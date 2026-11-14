import test from 'node:test'
import assert from 'node:assert/strict'
import { detectDocument, storagePath } from '../src/resource-files'

test('PDF signature and MIME must match its extension',async()=>{
  const pdf=Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF')
  assert.equal((await detectDocument('course.pdf','application/pdf',pdf)).format,'PDF')
  await assert.rejects(detectDocument('course.docx','application/pdf',pdf))
  await assert.rejects(detectDocument('course.pdf','text/html',pdf))
  await assert.rejects(detectDocument('course.pdf','application/pdf',Buffer.from('<script>alert(1)</script>')))
})
test('LaTeX requires UTF-8 document content',async()=>{
  assert.equal((await detectDocument('course.tex','text/plain',Buffer.from('\\documentclass{article}\n\\begin{document}Test\\end{document}'))).format,'TEX')
  await assert.rejects(detectDocument('course.tex','text/plain',Buffer.from('not a document')))
  await assert.rejects(detectDocument('course.tex','text/plain',Buffer.from([255,0,1])))
})
test('storage cannot escape its private root',()=>{
  assert.throws(()=>storagePath('../../.env'))
  assert.throws(()=>storagePath('abc/input/../.env'))
  assert.throws(()=>storagePath('abc/input/C:\\secret'))
  assert.ok(storagePath('aabb-ccdd/input/document.pdf').endsWith('document.pdf'))
})
