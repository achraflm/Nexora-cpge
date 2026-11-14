import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
const base=process.env.TEST_APP_URL || 'http://localhost:3000'
const meta={title:'Vérification ressources',description:'Document de contrôle fonctionnel',track:'MPSI',level:'SUP',subject:'MATH',type:'COURSE',status:'DRAFT',allowDownload:true}
const cookies={}
async function login(role,email,password){
 const res=await fetch(`${base}/api/auth/login`,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email,password})})
 assert.equal(res.status,200,await res.text());cookies[role]=res.headers.get('set-cookie').split(';')[0]
}
async function request(role,path='',options={}){return fetch(`${base}/api/resources${path}`,{...options,headers:{Cookie:cookies[role]||'',Origin:base,...options.headers}})}
async function upload(name,bytes,metadata=meta,role='admin',mime='application/pdf'){
 const body=new FormData();body.set('metadata',JSON.stringify(metadata));body.set('file',new Blob([bytes],{type:mime}),name)
 return request(role,'',{method:'POST',body})
}
await login('admin','admin.demo@example.test','Nexora-Admin-2026!')
await login('student','amina.demo@example.test','Nexora-Etudiant-2026!')
const pdf=await readFile(new URL('../.test-fixtures/course.pdf',import.meta.url))
const created=[]
try {
 assert.equal((await request('anonymous')).status,401)
 assert.equal((await upload('course.pdf',pdf,meta,'student')).status,403)
 assert.equal((await upload('course.pdf',pdf,{...meta,level:'SPE'})).status,400)
 assert.equal((await upload('course.docx',pdf)).status,400)
 assert.equal((await upload('course.pdf',Buffer.from('<script>fake</script>'))).status,400)
 const result=await upload('course.pdf',pdf);assert.equal(result.status,201,await result.clone().text())
 const row=await result.json();created.push(row.id);assert.equal(row.format,'PDF');assert.equal(row.conversion,'READY');assert.equal(row.storageKey,undefined)
 assert.equal((await request('student',`/${row.id}`)).status,404)
 assert.equal((await request('student',`/${row.id}/file`)).status,404)
 let list=await (await request('student')).json();assert.ok(!list.resources.some(r=>r.id===row.id))
 const edit=await request('admin',`/${row.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({...meta,status:'PUBLISHED',allowDownload:false})});assert.equal(edit.status,200)
 list=await (await request('student','?track=MPSI&subject=MATH&type=COURSE&q=V%C3%A9rification')).json();assert.ok(list.resources.some(r=>r.id===row.id))
 list=await (await request('student','?track=MP&subject=MATH&type=COURSE')).json();assert.ok(!list.resources.some(r=>r.id===row.id))
 const file=await request('student',`/${row.id}/file`);assert.equal(file.status,200);assert.equal(Buffer.from(await file.arrayBuffer()).subarray(0,5).toString(),'%PDF-')
 assert.equal((await request('student',`/${row.id}/file?download=1`)).status,403)
 assert.equal((await request('student',`/${row.id}/file?original=1`)).status,403)
 assert.equal((await request('student',`/${row.id}`,{method:'DELETE'})).status,403)
 const csrf=await fetch(`${base}/api/resources/${row.id}`,{method:'DELETE',headers:{Cookie:cookies.admin,Origin:'https://foreign.test'}});assert.equal(csrf.status,403)
 console.log('PASS: PDF import, metadata, signatures, permissions, drafts, publication, filters, reader bytes, download policy and CSRF')
 if(process.argv.includes('--conversions')){
  const cases=[['course.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document'],['course.pptx','application/vnd.openxmlformats-officedocument.presentationml.presentation'],['course.doc','application/msword'],['course.ppt','application/vnd.ms-powerpoint'],['course.tex','text/plain']]
  for(const [name,mime] of cases){
   const response=await upload(name,await readFile(new URL(`../.test-fixtures/${name}`,import.meta.url)),{...meta,title:`Test ${name}`},'admin',mime)
   assert.equal(response.status,201,await response.clone().text());const item=await response.json();created.push(item.id)
   let state=item
   for(let attempt=0;attempt<100 && ['PENDING','PROCESSING'].includes(state.conversion);attempt++){await new Promise(r=>setTimeout(r,2000));state=await (await request('admin',`/${item.id}`)).json()}
   assert.equal(state.conversion,'READY',`${name}: ${state.conversionError}`)
   const generated=await request('admin',`/${item.id}/file`);assert.equal(generated.status,200);assert.equal(Buffer.from(await generated.arrayBuffer()).subarray(0,5).toString(),'%PDF-')
   console.log(`PASS: ${name} detected and converted to PDF`)
  }
  const broken=await upload('broken.tex',Buffer.from('\\documentclass{article}\n\\begin{document}\\unknowncommand\\end{document}'),meta,'admin','text/plain')
  const bad=await broken.json();created.push(bad.id)
  let state=bad
  for(let i=0;i<60 && ['PENDING','PROCESSING'].includes(state.conversion);i++){await new Promise(r=>setTimeout(r,2000));state=await (await request('admin',`/${bad.id}`)).json()}
  assert.equal(state.conversion,'FAILED');assert.ok(state.conversionError)
  console.log('PASS: compilation failure is reported without blocking catalogue')
 }
}finally{
 for(const id of created)await request('admin',`/${id}`,{method:'DELETE'})
 for(const role of ['admin','student'])await fetch(`${base}/api/auth/logout`,{method:'POST',headers:{Cookie:cookies[role],Origin:base,'Content-Type':'application/json'},body:'{}'})
}
