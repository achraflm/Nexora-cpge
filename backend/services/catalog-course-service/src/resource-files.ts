import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fileTypeFromBuffer } from 'file-type'
import * as CFB from 'cfb'
import { HttpError } from '@cnc/common'

// Private disk adapter. Keys, never public URLs or client paths, are persisted in PostgreSQL.
export const root = path.resolve(process.env.RESOURCE_STORAGE_ROOT || fileURLToPath(new URL('../../../private-resources/', import.meta.url)))
export const MAX_FILE = 20 * 1024 * 1024
export function storagePath(key: string) {
  if (!/^[a-f0-9-]+\/(input\/[A-Za-z0-9_.-]+|output\/document.pdf)$/.test(key)) throw new Error('Invalid storage key')
  return path.join(root, key)
}
export async function detectDocument(name: string, mime: string, bytes: Buffer) {
  try { return await inspectDocument(name, mime, bytes) }
  catch (error) { if(error instanceof HttpError) throw error; throw new HttpError(400,'Document illisible ou endommagé.','INVALID_FILE') }
}
async function inspectDocument(name: string, mime: string, bytes: Buffer) {
  const ext = path.extname(name).slice(1).toLowerCase()
  const detected = await fileTypeFromBuffer(bytes)
  let format = detected?.ext
  if (ext === 'tex' && !bytes.includes(0)) {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    if (/\\documentclass(?:\[[^\]]*\])?\s*\{/.test(text)) format = 'tex'
  }
  if (['doc', 'ppt'].includes(ext) && bytes.subarray(0,8).equals(Buffer.from('d0cf11e0a1b11ae1','hex'))) {
    const container = CFB.read(bytes, { type: 'buffer' })
    if (container.FullPaths.some(p => p.endsWith('/WordDocument'))) format = 'doc'
    if (container.FullPaths.some(p => p.endsWith('/PowerPoint Document'))) format = 'ppt'
  }
  const mimes: Record<string,string[]> = {
    pdf:['application/pdf'], doc:['application/msword'], ppt:['application/vnd.ms-powerpoint'],
    docx:['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    pptx:['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    tex:['text/plain','text/x-tex','application/x-tex','text/x-latex','application/x-latex'],
  }
  if (!format || !mimes[format] || ext !== format || (mime && mime !== 'application/octet-stream' && !mimes[format].includes(mime))) {
    throw new HttpError(400, 'Extension, type MIME ou contenu du document non compatible.', 'INVALID_FILE')
  }
  return { format: format.toUpperCase(), mime: mimes[format][0], ext }
}
export async function storeUpload(files: Express.Multer.File[]) {
  const original = files.find(f=>f.fieldname==='file')
  if (!original) throw new HttpError(400,'Sélectionnez un document.')
  const meta = await detectDocument(original.originalname, original.mimetype, original.buffer)
  const extras = files.filter(f=>f.fieldname==='companions')
  if (extras.length && meta.ext !== 'tex') throw new HttpError(400,'Les fichiers complémentaires sont réservés au LaTeX.')
  const key = randomUUID()
  const storageKey = `${key}/input/document.${meta.ext}`
  const companions: {name:string;key:string;bytes:number}[]=[]
  const hash = createHash('sha256').update(original.buffer)
  await mkdir(path.join(root,key,'input'),{recursive:true})
  try {
    await writeFile(storagePath(storageKey),original.buffer,{flag:'wx'})
    for (const file of extras) {
      const name=file.originalname
      if (!/^[A-Za-z0-9_-][A-Za-z0-9_.-]{0,99}\.(png|jpg|jpeg|pdf|bib|sty|cls|tex)$/i.test(name) || name.startsWith('document.') || companions.some(f=>f.name.toLowerCase()===name.toLowerCase())) throw new HttpError(400,'Nom de fichier complémentaire invalide ou dupliqué.')
      const extension=path.extname(name).slice(1).toLowerCase()
      if (['png','jpg','jpeg','pdf'].includes(extension)) {
        const detected=await fileTypeFromBuffer(file.buffer)
        if (detected?.ext !== (extension==='jpeg'?'jpg':extension)) throw new HttpError(400,'Image complémentaire invalide.')
      } else { new TextDecoder('utf-8',{fatal:true}).decode(file.buffer); if(file.buffer.includes(0)) throw new HttpError(400,'Fichier texte invalide.') }
      const companionKey=`${key}/input/${name}`
      await writeFile(storagePath(companionKey),file.buffer,{flag:'wx'})
      hash.update(name).update(file.buffer)
      companions.push({name,key:companionKey,bytes:file.size})
    }
    const outputKey=meta.ext==='pdf'?`${key}/output/document.pdf`:null
    if(outputKey){await mkdir(path.join(root,key,'output'));await writeFile(storagePath(outputKey),original.buffer)}
    return {storageKey,originalName:path.basename(original.originalname).slice(0,200),format:meta.format,mime:meta.mime,bytes:original.size,companions,sourceHash:hash.digest('hex'),outputKey,conversion:outputKey?'READY' as const:'PENDING' as const}
  } catch(error){await rm(path.join(root,key),{recursive:true,force:true});throw error}
}
export async function readStored(key:string){return readFile(storagePath(key))}
