import '@cnc/common'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { problemInput, stages, publicationErrors } from '../services/catalog-course-service/src/classical-policy'
const origin='http://localhost:3000'
const title='Cycle avec régénération — propulsion d’un brise-glace'
let cookie=''
async function api(path:string,method='GET',body?:unknown) {
 const response=await fetch(origin+path,{method,headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body instanceof FormData?body:body?JSON.stringify(body):undefined})
 if(path==='/api/auth/login')cookie=response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')
 const result=await response.json();assert.ok(response.ok,JSON.stringify(result));return result
}
try {
 await api('/api/auth/login','POST',{email:process.env.IMPORT_ADMIN_EMAIL || 'admin.demo@example.test',password:process.env.IMPORT_ADMIN_PASSWORD || 'Nexora-Admin-2026!'})
 const collection=(await api('/api/classical-problems')).problems
 const existing=collection.find((p:any)=>p.title===title)
 if(existing?.state==='PUBLISHED'){console.log('Déjà importé :',existing.id)}else{
  const resources=(await api('/api/resources')).resources
  async function upload(kind:string,label:string){
   const resourceTitle=`Cleynen — problème 9.3 régénération — ${label}`
   const found=resources.find((r:any)=>r.title===resourceTitle);if(found)return found
   const buffer=await readFile(new URL(`../../tmp/classical-import/${kind}.pdf`,import.meta.url))
   const form=new FormData();form.append('file',new Blob([buffer],{type:'application/pdf'}),`cleynen-${kind}.pdf`)
   form.append('metadata',JSON.stringify({title:resourceTitle,description:'Extrait original, extrait recadré sans réécriture. Olivier Cleynen, Thermodynamique de l’ingénieur, CC BY-SA 4.0.',track:'MPSI',level:'SUP',subject:'PHYS',type:'TD',status:'DRAFT',allowDownload:true}))
   return api('/api/resources','POST',form)
  }
  const statement=await upload('enonce','énoncé'),correction=await upload('correction','réponses')
  function source(resource:any,locator:string){return {sourceName:'Thermodynamique de l’ingénieur, troisième édition',sourceUrl:'https://thermodynamique.fr/',documentUrl:'https://thermodynamique.fr/thermodynamique-livre-gratuit.pdf',author:'Olivier Cleynen',verifiedAt:'2026-11-16',evidence:'Document original inspecté : chapitre 9, problème 9.3, sept questions liées au même cycle. Énoncé pages 269–270, réponses page 271. Recadrage des seules zones concernées ; aucune réécriture.',locator,format:'PDF',license:'CC BY-SA 4.0 — Olivier Cleynen. Extrait : recadrage des zones du problème 9.3 et sélection de pages annexes originales, sans modification du texte. Crédits des illustrations et licence conservés.',licenseEvidence:'https://thermodynamique.fr/ ; pages 4 et 328 du PDF original jointes à chaque extrait ; https://creativecommons.org/licenses/by-sa/4.0/deed.fr',access:'LOCAL',resourceId:resource.id,resourceRevision:resource.revision,originalConfirmed:true}}
  const input=problemInput.parse({title,subject:'PHYS',level:'SUP',tracks:['MP'],chapterLabel:'Machines thermiques et premier principe',difficulty:'ADVANCED',problemType:'CLASSICAL_PROBLEM',correctionStatus:'AUTHOR_PUBLISHED',metadata:{description:'Un problème long en sept questions sur une installation à vapeur de brise-glace : cycle de Rankine, consommation de vapeur, prélèvement et régénération, puissance et rendement. Énoncé sur les deux premières pages ; tables thermodynamiques puis crédits en annexes. Réponses originales de l’auteur et schémas dans le corrigé séparé.',subchapter:'Cycle de Rankine avec régénération',topic:'Enthalpie, entropie, bilan de mélange et rendement',estimatedMinutes:90,prerequisites:['Premier et second principes','Écoulement permanent','Diagrammes température-entropie','Lecture des tables de vapeur'],statement:source(statement,'Problème 9.3 : zone de la page 269 et page 270 ; tables 313, 318, 319 ; crédits 4 et 328'),correction:source(correction,'Réponses 9.3 : zone de la page 271 ; schémas originaux 260 et 264 ; crédits 4 et 328'),curriculumEvidence:'Programme officiel marocain MPSI https://www.cpge.ac.ma/documents/Docs/_PrgFil/10-scr-1e-mpsi-.pdf : page PDF 135 énergie mécanique, pages PDF 146–147 premier principe et capacités thermiques, page PDF 150 machines et systèmes ouverts. Révision Sup du parcours MPSI vers MP.',nonCompetitionEvidence:'Problème pédagogique 9.3 du manuel, chapitre 9, hors sujet de concours.',copyrightReviewed:true,editorialNote:'Import local demandé par le propriétaire du projet. Vérification documentaire assistée, sans génération de solution. Un seul problème long. Les zones des exercices 9.1 et 9.2 sont exclues du recadrage. Les 50 pistes antérieures restent inchangées.'}})
  assert.deepEqual(publicationErrors(input,'PUBLISHED'),[])
  let row=existing || await api('/api/classical-problems','POST',input)
  for(const state of stages.slice(1,8)){if(stages.indexOf(state)<=stages.indexOf(row.state))continue;row=await api(`/api/classical-problems/${row.id}/review`,'POST',{revision:row.revision,state,note:'Import demandé par le propriétaire : contrôle documentaire assisté des pages originales, réponses de l’auteur et licence CC BY-SA. Aucune solution générée ; cette étape ne représente pas une validation pédagogique humaine indépendante.'})}
  console.log('Import local publié :',row.id)
 }
 const previous=collection.find((p:any)=>p.title==='Énergie, travail et chaleur — neuf exercices fondamentaux')
 if(previous?.state==='PUBLISHED')await api(`/api/classical-problems/${previous.id}/review`,'POST',{revision:previous.revision,state:'DISCOVERED',note:'Retrait demandé : remplacement de la feuille de neuf exercices par un seul problème long. Fichiers et historique conservés.'})
} finally {if(cookie)await api('/api/auth/logout','POST',{}).catch(()=>{})}
