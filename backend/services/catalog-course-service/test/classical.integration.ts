import '@cnc/common'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { copyFile, mkdir, readFile, rename, unlink, rmdir } from 'node:fs/promises'
import path from 'node:path'
import { createServiceApp } from '@cnc/common'
import { classicalProblems } from '../src/classical-problems'
import { prisma } from '../src/db'
import { problemInput } from '../src/classical-policy'
import { storagePath } from '../src/resource-files'

// Explicit integration command; creates and removes only its own UUID-scoped fixtures.
const admin=randomUUID(),student=randomUUID(),other=randomUUID(),secret=randomUUID(),ids:string[]=[]
const resourceId=randomUUID(),storageKey=`${resourceId}/input/fixture.pdf`,file=storagePath(storageKey)
let resourceCreated=false,fileCreated=false
const app=createServiceApp({name:'classic-integration',internalSecret:secret,router:classicalProblems})
const server=app.listen(0,'127.0.0.1');await once(server,'listening')
const port=(server.address() as {port:number}).port
async function request(path:string,method='GET',body?:unknown,role='ADMIN',userId=admin,expected=200) {
  const response=await fetch(`http://127.0.0.1:${port}${path}`,{method,headers:{'Content-Type':'application/json','x-internal-secret':secret,'x-user-id':userId,'x-user-role':role},body:body?JSON.stringify(body):undefined})
  const result=await response.json()
  assert.equal(response.status,expected,JSON.stringify(result))
  return result
}
const source={sourceName:'Fixture temporaire de test',sourceUrl:'https://example.org/source',documentUrl:'https://example.org/statement.pdf',author:'Fixture',verifiedAt:'2026-11-15',evidence:'Fixture sans contenu pédagogique',originalConfirmed:true,license:'Fixture de test ; aucun document réel',access:'LOCAL',format:'PDF',resourceId,resourceRevision:1,licenseEvidence:'Autorisation fixture de test'}
const input=problemInput.parse({title:`Test temporaire ${randomUUID()}`,subject:'CHEM',level:'SPE',tracks:['MP'],chapterLabel:'Test isolation',difficulty:'ADVANCED',problemType:'CLASSICAL_PROBLEM',correctionStatus:'PENDING_VERIFICATION',metadata:{description:'Fixture technique supprimée en fin de test',estimatedMinutes:30,prerequisites:[],statement:source,correction:{...source,documentUrl:'https://example.org/private-correction.pdf'},curriculumEvidence:'Fixture programme',nonCompetitionEvidence:'Fixture hors concours',copyrightReviewed:true}})
try {
  const subject=await prisma.subject.findUniqueOrThrow({where:{code:'CHEM'}})
  await mkdir(path.dirname(file),{recursive:true})
  await copyFile(new URL('../../../../frontend/public/problemes/classique-m1-enonce.pdf',import.meta.url),file);fileCreated=true
  const bytes=await readFile(file)
  await prisma.educationalResource.create({data:{id:resourceId,title:'Fixture PDF temporaire',track:'MPSI',level:'SUP',subjectId:subject.id,type:'TD',importedBy:admin,originalName:'fixture.pdf',format:'PDF',mime:'application/pdf',bytes:bytes.length,storageKey,sourceHash:'fixture-test',conversion:'READY'}});resourceCreated=true
  let row=await request('/','POST',input,'ADMIN',admin,201);ids.push(row.id)
  await request('/','POST',input,'STUDENT',student,403)
  await request(`/${row.id}`,'GET',undefined,'STUDENT',student,404)
  await request(`/${row.id}/review`,'POST',{revision:row.revision,state:'PUBLISHED',note:'Test saut interdit'},'ADMIN',admin,400)
  for(const state of ['SOURCE_VERIFIED','STATEMENT_VERIFIED','COPYRIGHT_REVIEWED','APPROVED','PUBLISHED'])row=await request(`/${row.id}/review`,'POST',{revision:row.revision,state,note:'Vérification fixture temporaire'})
  const visible=await request(`/${row.id}`,'GET',undefined,'STUDENT',student)
  assert.equal(visible.metadata.correction,null);assert.equal(visible.correctionAvailable,false)
  assert.equal(JSON.stringify(visible).includes('private-correction'),false)
  await rename(file,`${file}.unavailable`)
  try {
    assert.equal((await request(`/?q=${encodeURIComponent(input.title)}`,'GET',undefined,'STUDENT',student)).total,0)
    await request(`/${row.id}`,'GET',undefined,'STUDENT',student,404)
    assert.equal((await request(`/?q=${encodeURIComponent(input.title)}`)).total,1)
  } finally {await rename(`${file}.unavailable`,file)}
  assert.equal((await request(`/?q=${encodeURIComponent(input.title)}`,'GET',undefined,'STUDENT',student)).total,1)
  await request(`/${row.id}/progress`,'PUT',{status:'CORRECTION_CONSULTED'},'STUDENT',student,400)
  await request(`/${row.id}/progress`,'PUT',{favorite:true,saved:true,status:'IN_PROGRESS',notes:'Note privée',bookmarks:[{document:'statement',page:2,note:'À relire'}]},'STUDENT',student)
  assert.equal((await request(`/${row.id}`,'GET',undefined,'STUDENT',student)).progress.notes,'Note privée')
  assert.equal((await request(`/${row.id}`,'GET',undefined,'STUDENT',other)).progress,null)
  assert.equal((await request(`/?subject=CHEM&level=SPE&track=MP&difficulty=ADVANCED&type=CLASSICAL_PROBLEM&chapter=Test%20isolation&personal=favorite&q=${encodeURIComponent(input.title)}`,'GET',undefined,'STUDENT',student)).total,1)
  assert.equal((await request(`/?personal=favorite&q=${encodeURIComponent(input.title)}`,'GET',undefined,'STUDENT',other)).total,0)
  assert.equal((await request(`/?correction=available&q=${encodeURIComponent(input.title)}`,'GET',undefined,'STUDENT',student)).total,0)
  await request(`/${row.id}`,'PATCH',{revision:0,problem:input},'ADMIN',admin,409)
  row=await request(`/${row.id}`,'PATCH',{revision:row.revision,problem:{...input,correctionStatus:'TEACHER_PUBLISHED'}})
  assert.equal(row.state,'DISCOVERED')
  await request(`/${row.id}`,'GET',undefined,'STUDENT',student,404)
  for(const state of ['SOURCE_VERIFIED','STATEMENT_VERIFIED','CORRECTION_FOUND','CORRECTION_VERIFIED','COPYRIGHT_REVIEWED','APPROVED','PUBLISHED'])row=await request(`/${row.id}/review`,'POST',{revision:row.revision,state,note:'Vérification fixture corrigé'})
  assert.equal((await request(`/${row.id}`,'GET',undefined,'STUDENT',student)).correctionAvailable,true)
  await request(`/${row.id}/progress`,'PUT',{status:'CORRECTION_CONSULTED'},'STUDENT',student)
  await request(`/${row.id}/reviews`,'GET',undefined,'STUDENT',student,403)
  assert.ok((await request(`/${row.id}/reviews`)).length>=12)
  await request(`/${row.id}/review`,'POST',{revision:row.revision,state:'REJECTED',note:'Fin du test : retrait de publication'})
  await request(`/${row.id}`,'GET',undefined,'STUDENT',student,404)
  const localInput={...input,metadata:{...input.metadata,statement:{...input.metadata.statement,access:'LOCAL',format:'PDF',resourceId,resourceRevision:1,licenseEvidence:'Autorisation fixture de test'},correction:null},correctionStatus:'NO_CORRECTION'}
  row=await request(`/${row.id}`,'PATCH',{revision:row.revision+1,problem:localInput})
  await request(`/${row.id}/document/statement`,'GET',undefined,'STUDENT',student,404)
  for(const state of ['SOURCE_VERIFIED','STATEMENT_VERIFIED','COPYRIGHT_REVIEWED','APPROVED','PUBLISHED'])row=await request(`/${row.id}/review`,'POST',{revision:row.revision,state,note:'Validation du fichier original de test'})
  const original=await fetch(`http://127.0.0.1:${port}/${row.id}/document/statement`,{headers:{'x-internal-secret':secret,'x-user-id':student,'x-user-role':'STUDENT'}})
  assert.equal(original.status,200);assert.equal(original.headers.get('content-type'),'application/pdf');assert.deepEqual(Buffer.from(await original.arrayBuffer()),bytes)
  await prisma.educationalResource.update({where:{id:resourceId},data:{revision:{increment:1}}})
  await request(`/${row.id}/document/statement`,'GET',undefined,'STUDENT',student,404)
  console.log('PASS : droits, étapes, filtrage combiné, corrigés masqués, progression privée persistante, concurrence et retrait.')
} finally {
  await prisma.$transaction([prisma.classicProgress.deleteMany({where:{problemId:{in:ids}}}),prisma.classicReview.deleteMany({where:{problemId:{in:ids}}}),prisma.classicProblem.deleteMany({where:{id:{in:ids}}})])
  if(resourceCreated)await prisma.educationalResource.delete({where:{id:resourceId}})
  if(fileCreated)await unlink(file)
  await rmdir(path.dirname(file)).catch(()=>{});await rmdir(path.dirname(path.dirname(file))).catch(()=>{})
  server.close();await prisma.$disconnect()
}
