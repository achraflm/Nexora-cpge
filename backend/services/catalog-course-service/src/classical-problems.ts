import { Router } from 'express'
import { open } from 'node:fs/promises'
import { z } from 'zod'
import { currentUser, HttpError, requireUser } from '@cnc/common'
import { prisma } from './db'
import { storagePath } from './resource-files'
import { correctionAvailable, problemInput, progressInput, publicationErrors, publicMetadata, stages, subjects, transitionAllowed, type ProblemInput } from './classical-policy'

export const classicalProblems=Router()
classicalProblems.use(requireUser(),(_req,res,next)=>{res.setHeader('Cache-Control','private, no-store');next()})
const uuid=(value:unknown)=>z.uuid().parse(value)
const filters=z.object({subject:z.enum(subjects).optional(),level:z.enum(['SUP','SPE']).optional(),track:z.enum(['MP','PSI','PC','TSI']).optional(),chapter:z.string().max(200).optional(),difficulty:problemInput.shape.difficulty.optional(),type:problemInput.shape.problemType.optional(),q:z.string().max(200).optional(),correction:z.enum(['available','unavailable','pending']).optional(),personal:z.enum(['favorite','saved','started']).optional(),state:z.enum(stages).optional()}).strict()
function inputOf(row:any):ProblemInput {return {...row,subject:row.subject.code,metadata:row.metadata}}
function serialize(row:any,admin:boolean) {
  const input=inputOf(row)
  return {...row,metadata:admin?row.metadata:publicMetadata(input),correctionAvailable:correctionAvailable(input),progress:row.progress?.[0] || null}
}
async function permitted(req:any) {
  const row=await prisma.classicProblem.findUnique({where:{id:uuid(req.params.id)},include:{subject:true,progress:{where:{userId:currentUser(req).id}}}})
  if(!row || (currentUser(req).role!=='ADMIN' && !(await readableProblem(row))))throw new HttpError(404,'Problème introuvable.')
  return row
}
async function dataFor(input:ProblemInput) {
  await verifyAttachments(input)
  const subject=await prisma.subject.findUnique({where:{code:input.subject}})
  if(!subject)throw new HttpError(400,'Matière non configurée.')
  if(input.chapterId) {
    const chapter=await prisma.chapter.findUnique({where:{id:input.chapterId}})
    if(!chapter || chapter.subjectId!==subject.id || chapter.studyLevel!==input.level)throw new HttpError(400,'Chapitre incompatible avec la matière ou le niveau.')
  }
  const {subject:_,...data}=input
  return {...data,subjectId:subject.id}
}
async function verifyAttachments(input:ProblemInput) {
  for(const source of [input.metadata.statement,input.metadata.correction]) {
    if(source?.access!=='LOCAL')continue
    const resource=source.resourceId?await prisma.educationalResource.findUnique({where:{id:source.resourceId}}):null
    if(!resource || resource.format!=='PDF' || resource.revision!==source.resourceRevision)throw new HttpError(409,'Le PDF original a changé ou est introuvable. Sélectionnez à nouveau le document et vérifiez-le.')
  }
}
// A published label alone must never expose a card with a missing local document.
async function readableProblem(row:any) {
  if(row.state!=='PUBLISHED')return false
  const input=inputOf(row)
  if(!input.metadata.copyrightReviewed)return false
  const sources=[input.metadata.statement,...(correctionAvailable(input)?[input.metadata.correction]:[])]
  for(const source of sources) {
    if(source?.access!=='LOCAL' || !source.resourceId || !source.licenseEvidence)return false
    const resource=await prisma.educationalResource.findUnique({where:{id:source.resourceId}})
    if(!resource || resource.format!=='PDF' || resource.revision!==source.resourceRevision)return false
    try {
      const file=await open(storagePath(resource.storageKey),'r')
      try {
        const header=Buffer.alloc(5)
        const {bytesRead}=await file.read(header,0,5,0)
        if(bytesRead!==5 || header.toString()!=='%PDF-')return false
      } finally {await file.close()}
    } catch {return false}
  }
  return true
}
classicalProblems.get('/',async(req,res)=>{
  const f=filters.parse(req.query),user=currentUser(req),admin=user.role==='ADMIN'
  const rows=await prisma.classicProblem.findMany({where:{state:admin?f.state:'PUBLISHED',subject:f.subject?{code:f.subject}:undefined,level:f.level,tracks:f.track?{has:f.track}:undefined,chapterLabel:f.chapter,difficulty:f.difficulty,problemType:f.type,
    ...(f.q?{OR:[{title:{contains:f.q,mode:'insensitive'}},{chapterLabel:{contains:f.q,mode:'insensitive'}}]}:{}),
    ...(f.personal?{progress:{some:{userId:user.id,...(f.personal==='favorite'?{favorite:true}:f.personal==='saved'?{saved:true}:{status:{not:'NOT_STARTED'}})}}}:{}),
  },include:{subject:true,progress:{where:{userId:user.id}}},orderBy:[{title:'asc'},{id:'asc'}],take:1000})
  const visible=[]
  for(const row of rows)if(admin || await readableProblem(row))visible.push(row)
  const problems=visible.map(row=>serialize(row,admin)).filter(row=>!f.correction || (f.correction==='available'?row.correctionAvailable:f.correction==='pending'?['UNVERIFIED','PENDING_VERIFICATION'].includes(row.correctionStatus):!row.correctionAvailable))
  res.json({problems,total:problems.length,limit:1000})
})
classicalProblems.get('/:id',async(req,res)=>res.json(serialize(await permitted(req),currentUser(req).role==='ADMIN')))
classicalProblems.get('/:id/document/:kind',async(req,res)=>{
  const kind=z.enum(['statement','correction']).parse(req.params.kind),row=await permitted(req),input=inputOf(row)
  if(kind==='correction' && !correctionAvailable(input))throw new HttpError(404,'Corrigé authentifié indisponible.')
  const source=input.metadata[kind]
  if(source?.access!=='LOCAL' || !source.resourceId || !source.licenseEvidence || !input.metadata.copyrightReviewed)throw new HttpError(403,'Consultation locale non autorisée.')
  await verifyAttachments(input)
  const resource=await prisma.educationalResource.findUniqueOrThrow({where:{id:source.resourceId}})
  res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition','inline; filename="original.pdf"');res.setHeader('X-Content-Type-Options','nosniff')
  res.sendFile(storagePath(resource.storageKey))
})
classicalProblems.get('/:id/reviews',requireUser('ADMIN'),async(req,res)=>{
  const row=await permitted(req)
  res.json(await prisma.classicReview.findMany({where:{problemId:row.id},orderBy:{createdAt:'desc'}}))
})
classicalProblems.post('/',requireUser('ADMIN'),async(req,res)=>{
  const data=await dataFor(problemInput.parse(req.body))
  const row=await prisma.classicProblem.create({data,include:{subject:true}})
  res.status(201).json(serialize(row,true))
})
classicalProblems.patch('/:id',requireUser('ADMIN'),async(req,res)=>{
  const body=z.object({revision:z.number().int(),problem:problemInput}).strict().parse(req.body)
  const row=await permitted(req),data=await dataFor(body.problem)
  await prisma.$transaction(async tx=>{
    const result=await tx.classicProblem.updateMany({where:{id:row.id,revision:body.revision},data:{...data,state:'DISCOVERED',revision:{increment:1}}})
    if(!result.count)throw new HttpError(409,'Cette fiche a changé. Rechargez-la avant de modifier.')
    await tx.classicReview.create({data:{problemId:row.id,actorId:currentUser(req).id,fromState:row.state,toState:'DISCOVERED',note:'Métadonnées modifiées ; validation à reprendre.'}})
  })
  res.json(serialize(await permitted(req),true))
})
classicalProblems.post('/:id/review',requireUser('ADMIN'),async(req,res)=>{
  const body=z.object({revision:z.number().int(),state:z.enum(stages),note:z.string().trim().min(10).max(4000)}).strict().parse(req.body)
  const row=await permitted(req)
  if(!transitionAllowed(row.state,body.state))throw new HttpError(400,'Respectez les étapes de vérification.')
  const issues=publicationErrors(inputOf(row),body.state)
  await verifyAttachments(inputOf(row))
  if(issues.length)throw new HttpError(400,issues.join(' '))
  await prisma.$transaction(async tx=>{
    const result=await tx.classicProblem.updateMany({where:{id:row.id,revision:body.revision,state:row.state},data:{state:body.state,revision:{increment:1}}})
    if(!result.count)throw new HttpError(409,'Cette fiche a changé. Rechargez-la.')
    await tx.classicReview.create({data:{problemId:row.id,actorId:currentUser(req).id,fromState:row.state,toState:body.state,note:body.note}})
  })
  res.json(serialize(await permitted(req),true))
})
classicalProblems.put('/:id/progress',requireUser('STUDENT'),async(req,res)=>{
  const row=await permitted(req),data=progressInput.parse(req.body),userId=currentUser(req).id
  if(data.status==='CORRECTION_CONSULTED' && !correctionAvailable(inputOf(row)))throw new HttpError(400,'Corrigé authentifié indisponible.')
  if(data.bookmarks?.some(b=>b.document==='correction') && !correctionAvailable(inputOf(row)))throw new HttpError(400,'Signet de corrigé indisponible.')
  const now=new Date()
  const timestamps={...(data.status && data.status!=='NOT_STARTED'?{lastAttemptedAt:now}:{}),...(data.status==='STATEMENT_COMPLETED'?{completedAt:now}:{}),...(data.status==='MASTERED'?{masteredAt:now}:{})}
  res.json(await prisma.classicProgress.upsert({where:{problemId_userId:{problemId:row.id,userId}},create:{problemId:row.id,userId,...data,...timestamps},update:{...data,...timestamps}}))
})
