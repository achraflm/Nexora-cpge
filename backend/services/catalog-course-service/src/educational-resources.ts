import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { HttpError, currentUser, requireUser } from '@cnc/common'
import { prisma } from './db'
import { MAX_FILE, storeUpload, storagePath, detectDocument } from './resource-files'
import { processConversions } from './resource-converter'

export const educationalResources = Router()
const parseUpload=multer({storage:multer.memoryStorage(),limits:{fileSize:MAX_FILE,files:11,fields:1,fieldSize:10_000,parts:12}}).fields([{name:'file',maxCount:1},{name:'companions',maxCount:10}])
const upload:import('express').RequestHandler=(req,res,next)=>{
  if(Number(req.headers['content-length'])>MAX_FILE+1024*1024)return next(new HttpError(413,'Import limité à 20 Mo.'))
  let total=0
  const guard=(chunk:Buffer)=>{total+=chunk.length;if(total>MAX_FILE+1024*1024)req.destroy()}
  req.on('data',guard)
  parseUpload(req,res,error=>{req.removeListener('data',guard);next(error)})
}
export const resourceMetadata=z.object({
  title:z.string().trim().min(1).max(200),description:z.string().trim().max(4000).default(''),
  track:z.enum(['MPSI','MP']),level:z.enum(['SUP','SPE']),subject:z.enum(['MATH','PHYS','INFO','SI']),
  type:z.enum(['COURSE','TD']),status:z.enum(['DRAFT','PUBLISHED']),allowDownload:z.boolean(),
}).strict().refine(v=>v.level===(v.track==='MPSI'?'SUP':'SPE'),{message:'MPSI correspond à SUP ; MP correspond à SPE.',path:['level']})
const filters=z.object({track:z.enum(['MPSI','MP']).optional(),subject:z.enum(['MATH','PHYS','INFO','SI']).optional(),type:z.enum(['COURSE','TD']).optional(),q:z.string().max(200).optional(),sort:z.enum(['asc','desc']).default('desc')}).strict()
function id(value:unknown){return z.uuid().parse(value)}
function serialize(row:any){const {storageKey,outputKey,sourceHash,companions,...publicData}=row;return {...publicData,companions:(companions as any[]).map(({name,bytes})=>({name,bytes}))}}
async function permitted(req:any){
  const row=await prisma.educationalResource.findUnique({where:{id:id(req.params.id)},include:{subject:true}})
  if(!row || (currentUser(req).role!=='ADMIN' && row.status!=='PUBLISHED'))throw new HttpError(404,'Ressource introuvable.')
  return row
}
educationalResources.use(requireUser(),(_req,res,next)=>{res.setHeader('Cache-Control','private, no-store');next()})
educationalResources.get('/',async(req,res)=>{
  const f=filters.parse(req.query)
  const resources=await prisma.educationalResource.findMany({where:{...(currentUser(req).role==='ADMIN'?{}:{status:'PUBLISHED'}),track:f.track,subject:f.subject?{code:f.subject}:undefined,type:f.type,title:f.q?{contains:f.q,mode:'insensitive'}:undefined},include:{subject:true},orderBy:[{createdAt:f.sort},{id:'asc'}],take:500})
  res.json({resources:resources.map(serialize),total:resources.length})
})
educationalResources.post('/inspect',requireUser('ADMIN'),upload,async(req,res)=>{
  const file=(req.files as Record<string,Express.Multer.File[]>)?.file?.[0]
  if(!file)throw new HttpError(400,'Sélectionnez un document.')
  const detected=await detectDocument(file.originalname,file.mimetype,file.buffer)
  res.json({format:detected.format,bytes:file.size})
})
educationalResources.get('/:id',async(req,res)=>{res.json(serialize(await permitted(req)))})
educationalResources.get('/:id/file',async(req,res)=>{
  const row=await permitted(req)
  const original=req.query.original==='1'
  const download=req.query.download==='1' || original
  if(download && !row.allowDownload && currentUser(req).role!=='ADMIN')throw new HttpError(403,'Téléchargement désactivé pour cette ressource.')
  if(!original && (row.conversion!=='READY' || !row.outputKey))throw new HttpError(409,row.conversionError || 'Document en cours de préparation.')
  res.setHeader('Content-Type',original?row.mime:'application/pdf')
  res.setHeader('X-Content-Type-Options','nosniff')
  res.setHeader('Content-Disposition',`${download?'attachment':'inline'}; filename="document.${original?row.format.toLowerCase():'pdf'}"`)
  res.sendFile(storagePath(original?row.storageKey:row.outputKey!))
})
educationalResources.post('/',requireUser('ADMIN'),upload,async(req,res)=>{
  let raw:unknown
  try{raw=JSON.parse(req.body.metadata)}catch{throw new HttpError(400,'Métadonnées JSON invalides.')}
  const {subject,...metadata}=resourceMetadata.parse(raw)
  const subjectRow=await prisma.subject.findUnique({where:{code:subject}})
  if(!subjectRow)throw new HttpError(400,'Matière non configurée.')
  const files=Object.values(req.files || {}).flat() as Express.Multer.File[]
  if(files.reduce((sum,f)=>sum+f.size,0)>MAX_FILE)throw new HttpError(413,'La taille totale doit être inférieure à 20 Mo.')
  const stored=await storeUpload(files)
  const row=await prisma.educationalResource.create({data:{...metadata,...stored,subjectId:subjectRow.id,importedBy:currentUser(req).id},include:{subject:true}})
  res.status(201).json(serialize(row))
  void processConversions().catch(console.error)
})
educationalResources.patch('/:id',requireUser('ADMIN'),async(req,res)=>{
  await permitted(req)
  const {subject,...metadata}=resourceMetadata.parse(req.body)
  const subjectRow=await prisma.subject.findUnique({where:{code:subject}})
  if(!subjectRow)throw new HttpError(400,'Matière non configurée.')
  res.json(serialize(await prisma.educationalResource.update({where:{id:id(req.params.id)},data:{...metadata,subjectId:subjectRow.id},include:{subject:true}})))
})
educationalResources.put('/:id/file',requireUser('ADMIN'),upload,async(req,res)=>{
  const current=await permitted(req)
  if(current.conversion==='PROCESSING')throw new HttpError(409,'Attendez la fin de la conversion avant de remplacer le fichier.')
  const files=Object.values(req.files || {}).flat() as Express.Multer.File[]
  if(files.reduce((s,f)=>s+f.size,0)>MAX_FILE)throw new HttpError(413,'La taille totale doit être inférieure à 20 Mo.')
  const stored=await storeUpload(files)
  const updated=await prisma.educationalResource.updateMany({where:{id:current.id,revision:current.revision,conversion:{not:'PROCESSING'}},data:{...stored,revision:{increment:1},conversionError:null,convertedAt:null}})
  if(!updated.count)throw new HttpError(409,'La ressource a changé, actualisez la page.')
  res.json(serialize(await prisma.educationalResource.findUnique({where:{id:current.id},include:{subject:true}})))
  void processConversions().catch(console.error)
})
educationalResources.post('/:id/retry',requireUser('ADMIN'),async(req,res)=>{
  const row=await permitted(req)
  if(row.conversion==='FAILED')await prisma.educationalResource.updateMany({where:{id:row.id,conversion:'FAILED'},data:{conversion:'PENDING',conversionError:null}})
  res.json({ok:true});void processConversions().catch(console.error)
})
educationalResources.delete('/:id',requireUser('ADMIN'),async(req,res)=>{
  const row=await permitted(req)
  if(row.conversion==='PROCESSING')throw new HttpError(409,'Attendez la fin de la conversion.')
  await prisma.educationalResource.delete({where:{id:row.id}})
  // Files remain private for recovery; a retention job may purge unreferenced storage keys.
  res.status(204).end()
})
educationalResources.use((error:any,_req:any,_res:any,next:any)=>{next(error instanceof multer.MulterError?new HttpError(400,'Import invalide : vérifiez le nombre et la taille des fichiers.'):error)})
