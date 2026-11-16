import { test } from 'node:test'
import assert from 'node:assert/strict'
import { correctionAvailable, externalUrl, problemInput, publicationErrors, publicMetadata, transitionAllowed } from '../src/classical-policy'
const source={sourceName:'Enseignant',sourceUrl:'https://example.org/collection',documentUrl:'https://example.org/original.pdf',institution:'Lycée',author:'Enseignant',verifiedAt:'2026-11-15',evidence:'Énoncé et document inspectés séparément',originalConfirmed:true,license:'Autorisation de test',access:'LOCAL',format:'PDF',resourceId:'54148a72-86cc-4eba-b381-36cab563c71e',resourceRevision:1,licenseEvidence:'Autorisation de test'}
const base=()=>problemInput.parse({title:'Exercice',subject:'CHEM',level:'SUP',tracks:['MP'],chapterLabel:'Solutions aqueuses',difficulty:'INTERMEDIATE',problemType:'CLASSICAL_EXERCISE',correctionStatus:'TEACHER_PUBLISHED',metadata:{description:'Description',estimatedMinutes:30,prerequisites:[],statement:source,correction:source,curriculumEvidence:'Programme officiel, chapitre et page contrôlés',nonCompetitionEvidence:'Exercice pédagogique original contrôlé',copyrightReviewed:true}})
test('publication refuses unverified statements, attribution, curriculum and rights',()=>{
  for(const change of [(p:ReturnType<typeof base>)=>{p.metadata.statement.originalConfirmed=false},(p:ReturnType<typeof base>)=>{p.metadata.statement.author='';p.metadata.statement.institution=''},(p:ReturnType<typeof base>)=>{p.metadata.curriculumEvidence=''},(p:ReturnType<typeof base>)=>{p.metadata.copyrightReviewed=false}]){const p=base();change(p);assert.ok(publicationErrors(p,'PUBLISHED').length)}
})
test('pending and unverified corrections are redacted from student metadata',()=>{
  for(const status of ['UNVERIFIED','PENDING_VERIFICATION','NO_CORRECTION'] as const){const p=base();p.correctionStatus=status;assert.equal(correctionAvailable(p),false);assert.equal(publicMetadata(p).correction,null)}
})
test('an official badge needs explicit official evidence',()=>{const p=base();p.correctionStatus='OFFICIAL';assert.equal(correctionAvailable(p),false);assert.ok(publicationErrors(p,'PUBLISHED').length);p.metadata.correction!.officialEvidence='Institution explicitly endorses the correction';assert.equal(correctionAvailable(p),true)})
test('a verified statement may publish without a correction',()=>{const p=base();p.correctionStatus='NO_CORRECTION';p.metadata.correction=null;assert.deepEqual(publicationErrors(p,'PUBLISHED'),[]);assert.equal(transitionAllowed('STATEMENT_VERIFIED','COPYRIGHT_REVIEWED'),true)})
test('publication cannot skip approval and rejected entries must restart',()=>{assert.equal(transitionAllowed('DISCOVERED','PUBLISHED'),false);assert.equal(transitionAllowed('REJECTED','PUBLISHED'),false);assert.equal(transitionAllowed('APPROVED','PUBLISHED'),true);assert.equal(transitionAllowed('PUBLISHED','DISCOVERED'),true)})
test('publication requires locally imported statement and correction',()=>{const p=base();assert.deepEqual(publicationErrors(p,'PUBLISHED'),[]);p.metadata.statement.access='EMBED';assert.ok(publicationErrors(p,'PUBLISHED').length);p.metadata.statement.access='LOCAL';p.metadata.correction!.access='LINK_ONLY';assert.ok(publicationErrors(p,'PUBLISHED').length);p.metadata.correction!.access='LOCAL';p.metadata.statement.licenseEvidence='';assert.ok(publicationErrors(p,'PUBLISHED').length)})
test('an imported correction can be found without a remote document URL',()=>{const p=base();p.metadata.correction!.documentUrl=null;assert.deepEqual(publicationErrors(p,'CORRECTION_FOUND'),[])})
test('unsafe URLs and generated correction fields are rejected',()=>{
  for(const url of ['javascript:alert(1)','http://example.org','https://localhost/a','https://127.0.0.1/a','https://[::1]/a','https://user:pass@example.org'])assert.equal(externalUrl.safeParse(url).success,false)
  const p=base();assert.equal(problemInput.safeParse({...p,solution:'generated'}).success,false)
})
