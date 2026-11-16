import '@cnc/common'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, unlink, rmdir } from 'node:fs/promises'
import { prisma } from '../services/catalog-course-service/src/db'
import { storagePath } from '../services/catalog-course-service/src/resource-files'
import path from 'node:path'
import { problemInput } from '../services/catalog-course-service/src/classical-policy'
const require=createRequire(import.meta.url)
const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE || 'playwright')
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})})
const admin=await browser.newContext({viewport:{width:1440,height:1000}}),student=await browser.newContext({viewport:{width:1440,height:1000}})
admin.setDefaultTimeout(20000);student.setDefaultTimeout(20000);admin.setDefaultNavigationTimeout(30000);student.setDefaultNavigationTimeout(30000)
const origin='http://localhost:3000',ids:string[]=[]
let uploaded:any=null
const uploads:any[]=[]
const title=`Validation interface ${randomUUID().slice(0,8)}`
async function login(context:any,email:string,password:string) {
  const response=await context.request.post(`${origin}/api/auth/login`,{headers:{Origin:origin},data:{email,password}})
  assert.equal(response.status(),200,await response.text())
}
async function api(context:any,path:string,method='GET',data?:unknown) {
  const response=await context.request.fetch(`${origin}/api/classical-problems${path}`,{method,headers:{Origin:origin},data})
  assert.ok(response.ok(),await response.text());return response.json()
}
try {
  await login(admin,'admin.demo@example.test','Nexora-Admin-2026!')
  await login(student,'amina.demo@example.test','Nexora-Etudiant-2026!')
  const upload=await admin.request.post(`${origin}/api/resources`,{headers:{Origin:origin},multipart:{metadata:JSON.stringify({title,track:'MP',level:'SPE',subject:'CHEM',type:'TD',status:'DRAFT',allowDownload:false}),file:{name:'fixture.pdf',mimeType:'application/pdf',buffer:await readFile(new URL('../../frontend/public/problemes/classique-m1-enonce.pdf',import.meta.url))}}});assert.equal(upload.status(),201,await upload.text());uploaded=await upload.json();uploaded={...uploaded,...await prisma.educationalResource.findUniqueOrThrow({where:{id:uploaded.id}})};uploads.push(uploaded)
  const source={sourceName:'Document technique temporaire',sourceUrl:'https://example.org/source',documentUrl:'https://example.org/statement.pdf',author:'Fixture',verifiedAt:'2026-11-15',originalConfirmed:true,evidence:'Fixture technique, pas un exercice pédagogique',license:'Aucune ressource tierce utilisée',access:'LOCAL',format:'PDF',resourceId:uploaded.id,resourceRevision:uploaded.revision,licenseEvidence:'Fixture originale de la plateforme'}
  const input=problemInput.parse({title,subject:'CHEM',level:'SPE',tracks:['MP'],chapterLabel:'Validation interface',difficulty:'INTERMEDIATE',problemType:'CLASSICAL_EXERCISE',correctionStatus:'NO_CORRECTION',metadata:{description:'Fiche temporaire supprimée après vérification.',estimatedMinutes:30,prerequisites:['Lecture'],statement:source,correction:null,curriculumEvidence:'Fixture',nonCompetitionEvidence:'Fixture',copyrightReviewed:true}})
  // This POST always creates a new UUID fixture. No existing real problem is selected or modified.
  let row=await api(admin,'','POST',input);ids.push(row.id)
  assert.equal(row.title,title);assert.equal(row.state,'DISCOVERED');assert.notEqual(row.id,'4b5e1ccd-580f-4b5e-810d-ac7ae5cdf314')
  const page=await admin.newPage();await page.goto(`${origin}/admin`)
  await page.getByRole('button',{name:'Classiques',exact:true}).click()
  await page.getByLabel('Rechercher une fiche').fill(title)
  await page.getByRole('button',{name:new RegExp(title)}).click()
  const imported=page.waitForResponse((r:any)=>r.url().endsWith('/api/resources') && r.request().method()==='POST')
  await page.getByLabel('Importer Énoncé original',{exact:true}).setInputFiles(fileURLToPath(new URL('../../frontend/public/problemes/classique-m1-enonce.pdf',import.meta.url)))
  const importedResponse=await imported;assert.equal(importedResponse.status(),201);const newResource=await importedResponse.json()
  uploads.push(await prisma.educationalResource.findUniqueOrThrow({where:{id:newResource.id}}))
  await page.getByRole('button',{name:'Enregistrer la fiche',exact:true}).click()
  await page.getByText('Fiche enregistrée. La validation repart de la première étape.',{exact:true}).waitFor()
  row=await api(admin,`/${row.id}`);assert.ok(ids.includes(row.id));assert.equal(row.title,title);assert.equal(row.metadata.statement.resourceId,newResource.id)
  for(const state of ['SOURCE_VERIFIED','STATEMENT_VERIFIED','COPYRIGHT_REVIEWED','APPROVED'])row=await api(admin,`/${row.id}/review`,'POST',{revision:row.revision,state,note:'Fixture temporaire pour vérification du navigateur'})
  await page.getByRole('button',{name:'Actualiser',exact:true}).click()
  await page.getByRole('button',{name:new RegExp(`${title}.*Approuvé`)}).click()
  await page.getByLabel('Compte rendu de vérification').fill('Publication temporaire de la fixture de test')
  await page.getByRole('button',{name:'Publié',exact:true}).click()
  await page.getByRole('heading',{name:'Validation : Publié',exact:true}).waitFor()
  await mkdir(new URL('../../tmp/classical-qa/',import.meta.url),{recursive:true})
  await page.screenshot({path:fileURLToPath(new URL('../../tmp/classical-qa/admin.png',import.meta.url)),fullPage:false})
  console.log('Administration vérifiée')
  const learner=await student.newPage();await learner.goto(`${origin}/?tab=problemes`,{waitUntil:'domcontentloaded'});console.log('Page étudiant ouverte')
  await learner.getByRole('heading',{name:'Bibliothèque de problèmes classiques',exact:true}).waitFor();console.log('Bibliothèque affichée')
  await learner.getByRole('button',{name:/^Chimie/}).click()
  await learner.getByRole('button',{name:'Lire le problème',exact:true}).click()
  const localPdf=await student.request.get(`${origin}/api/classical-problems/${row.id}/document/statement`);assert.equal(localPdf.status(),200);assert.equal(localPdf.headers()['content-type'],'application/pdf');await learner.locator('.ds-page canvas').waitFor();assert.equal(await learner.getByRole('link',{name:/source|ouvrir.*original/i}).count(),0)
  await learner.getByRole('button',{name:'Ajouter aux favoris',exact:true}).click()
  await learner.getByText('Enregistré.',{exact:true}).waitFor()
  await learner.getByLabel('Notes personnelles').fill('Note persistante de test')
  await learner.getByRole('button',{name:'Enregistrer mes notes',exact:true}).click()
  await learner.getByText('Enregistré.',{exact:true}).waitFor()
  await learner.getByLabel('Page du signet').fill('3')
  await learner.getByLabel('Annotation du signet').fill('Signet personnel')
  await learner.getByRole('button',{name:'Ajouter un signet',exact:true}).click()
  await learner.getByText('Énoncé · page 3 · Signet personnel',{exact:true}).waitFor()
  assert.equal(await learner.getByRole('button',{name:'Consulter le corrigé original'}).isDisabled(),true)
  await learner.reload()
  await learner.getByRole('button',{name:/^Chimie/}).click()
  await learner.getByRole('button',{name:'Lire le problème',exact:true}).click()
  assert.equal(await learner.getByLabel('Notes personnelles').inputValue(),'Note persistante de test')
  await learner.getByText('Énoncé · page 3 · Signet personnel',{exact:true}).waitFor()
  await learner.screenshot({path:fileURLToPath(new URL('../../tmp/classical-qa/student.png',import.meta.url)),fullPage:false})
  await learner.setViewportSize({width:390,height:844})
  await learner.screenshot({path:fileURLToPath(new URL('../../tmp/classical-qa/mobile.png',import.meta.url)),fullPage:false})
  assert.ok(await learner.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1))
  const denied=await student.request.post(`${origin}/api/classical-problems`,{headers:{Origin:origin},data:input});assert.equal(denied.status(),403)
  const csrf=await admin.request.post(`${origin}/api/classical-problems`,{headers:{Origin:'https://example.org'},data:input});assert.equal(csrf.status(),403)
  console.log('PASS navigateur : publication admin, filtres, notes/favoris/signets persistants, mobile, corrigé indisponible, droits et origine.')
} catch(error) {
  for(const context of [admin,student])for(const page of context.pages()){console.log('Écran en échec',page.url(),(await page.locator('body').innerText()).slice(-2200));}
  throw error
} finally {
  for(const context of [admin,student])await context.request.post(`${origin}/api/auth/logout`,{headers:{Origin:origin},data:{}}).catch(()=>{})
  await browser.close()
  await prisma.$transaction([prisma.classicProgress.deleteMany({where:{problemId:{in:ids}}}),prisma.classicReview.deleteMany({where:{problemId:{in:ids}}}),prisma.classicProblem.deleteMany({where:{id:{in:ids}}})])
  for(const uploaded of uploads){await prisma.educationalResource.delete({where:{id:uploaded.id}});for(const key of [uploaded.storageKey,uploaded.outputKey].filter(Boolean)){await unlink(storagePath(key));await rmdir(path.dirname(storagePath(key)))}await rmdir(path.dirname(path.dirname(storagePath(uploaded.storageKey))))}
  await prisma.$disconnect()
}
