import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
const require=createRequire(import.meta.url)
const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE || 'playwright')
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})})
const origin='http://localhost:3000'
await mkdir('../tmp/classical-reader',{recursive:true})
try {
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},deviceScaleFactor:mobile?2:1})
  try {
   const login=await context.request.post(`${origin}/api/auth/login`,{headers:{Origin:origin},data:{email:'amina.demo@example.test',password:'Nexora-Etudiant-2026!'}});assert.equal(login.status(),200);const loginPage=await context.request.get(`${origin}/login`);assert.equal(loginPage.headers()['x-frame-options'],'DENY')
   const rows=await (await context.request.get(`${origin}/api/classical-problems`)).json()
   assert.equal(rows.problems.filter((p:any)=>p.title.includes('neuf exercices')).length,0)
   const row=rows.problems.find((p:any)=>p.title==='Cycle avec régénération — propulsion d’un brise-glace');assert.ok(row);assert.equal(row.problemType,'CLASSICAL_PROBLEM')
   const page=await context.newPage();page.setDefaultTimeout(25000)
   await page.addInitScript(() => localStorage.setItem('document-studio:prefs:v1:problems', JSON.stringify({layout:'spread'})))
   // HTTP resources only from the local app; allow browser-generated blob/data assets.
   await page.route('**/*',(route:any)=>{const u=new URL(route.request().url());return ['http:','https:'].includes(u.protocol) && u.origin!==origin?route.abort():route.continue()})
   await page.goto(`${origin}/?tab=problemes`)
   await page.getByRole('button',{name:/^Mathématiques 2 problèmes/}).click()
   for (const title of ['Intégrale gaussienne', 'Fonction gamma d’Euler']) {
    const mathProblem=rows.problems.find((problem:any)=>problem.title===title)
    assert.ok(mathProblem?.correctionAvailable)
    const card=page.getByRole('article').filter({hasText:title})
    const banner=card.locator('img')
    await banner.waitFor({timeout:8000})
    await banner.evaluate((img:HTMLImageElement)=>img.decode())
    assert.ok(await banner.evaluate((img:HTMLImageElement)=>img.naturalWidth>0))
    for (const kind of ['statement','correction']) {
      const pdf=await context.request.get(`${origin}/api/classical-problems/${mathProblem.id}/document/${kind}`)
      assert.equal(pdf.status(),200);assert.equal(pdf.headers()['content-type'],'application/pdf')
    }
    await card.getByRole('button',{name:'Lire le problème',exact:true}).click()
    await page.locator('.ds-page[data-page="1"] canvas').waitFor()
    await page.getByRole('button',{name:'Bibliothèque',exact:true}).click()
   }
   await page.getByRole('button',{name:'Toutes les matières',exact:true}).click()

   for (const [subject,title] of [
    ['Chimie','Cinétique d’une réaction en chaîne'],
    ['Informatique','Le compte est bon'],
   ]) {
    await page.getByRole('button',{name:new RegExp(`^${subject} 1 problème`)}).click()
    const card=page.getByRole('article').filter({hasText:title})
    await card.locator('img').evaluate((img:HTMLImageElement)=>img.decode())
    await card.getByRole('button',{name:'Lire le problème',exact:true}).click()
    await page.locator('.ds-page[data-page="1"] canvas').waitFor()
    await page.getByRole('button',{name:'Consulter le corrigé original',exact:true}).click()
    await page.locator('.ds-page[data-page="1"] canvas').waitFor()
    await page.getByRole('button',{name:'Bibliothèque',exact:true}).click()
    await page.getByRole('button',{name:'Toutes les matières',exact:true}).click()
   }

   assert.equal(await page.getByRole('searchbox').count(),0);await page.getByRole('button',{name:/^Physique/}).click();await page.getByRole('article').filter({hasText:row.title}).getByRole('button',{name:'Lire le problème',exact:true}).click()
   async function rendered(number:number){
    const canvas=page.locator(`.ds-page[data-page="${number}"] canvas`);await canvas.waitFor()
    assert.ok(await canvas.evaluate((el:HTMLCanvasElement)=>{const data=el.getContext('2d')!.getImageData(0,0,el.width,el.height).data;let ink=0;for(let i=0;i<data.length;i+=40)if(data[i+3]>0 && data[i]<180 && data[i+1]<180 && data[i+2]<180)ink++;return ink>100}),'Le PDF doit contenir des pixels de texte, pas une page blanche')
   }
   await rendered(1)
   assert.equal(await page.locator('.ds-page').count(),1)
   assert.equal(await page.getByRole('link',{name:'Ouvrir le PDF local',exact:true}).count(),0)
   await page.getByRole('button',{name:'Page suivante',exact:true}).click();await rendered(2)
   assert.equal(await page.locator('.ds-page').count(),1)
   await page.getByRole('button',{name:'Consulter le corrigé original',exact:true}).click();await rendered(1)
   if(!mobile){
    const documentPath=`**/api/classical-problems/${row.id}/document/statement`
    await page.route(documentPath,(route:any)=>route.abort())
    await page.getByRole('button',{name:'Énoncé original',exact:true}).click()
    await page.getByRole('button',{name:'Réessayer',exact:true}).waitFor()
    await page.unroute(documentPath)
    await page.getByRole('button',{name:'Réessayer',exact:true}).click();await rendered(1)
   }
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
   console.log(`PASS ${mobile?'mobile x2':'desktop'} : pages verticales, rendu non blanc, navigation, corrigé et nouvelle tentative.`)
  } catch(error) {console.log((await context.pages()[0]?.locator('body').innerText())?.slice(0,2600));throw error} finally {await context.request.post(`${origin}/api/auth/logout`,{headers:{Origin:origin},data:{}});await context.close()}
 }
}finally{await browser.close()}
