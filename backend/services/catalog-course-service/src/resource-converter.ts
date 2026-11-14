import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { prisma } from './db'
import { root, storagePath, MAX_FILE } from './resource-files'

function docker(args:string[], timeout=100_000):Promise<Buffer> {
  return new Promise((resolve,reject)=>{
    const child=spawn('docker',args,{windowsHide:true,stdio:['ignore','pipe','ignore'],shell:false})
    const chunks:Buffer[]=[];let bytes=0
    child.stdout.on('data',(chunk:Buffer)=>{bytes+=chunk.length;if(bytes>MAX_FILE){child.kill();reject(new Error('PDF généré trop volumineux.'))}else chunks.push(chunk)})
    const timer=setTimeout(()=>{child.kill();reject(new Error('Délai de conversion dépassé.'))},timeout)
    child.on('error',()=>{clearTimeout(timer);reject(new Error('Le moteur de conversion est indisponible.'))})
    child.on('close',code=>{clearTimeout(timer);code===0?resolve(Buffer.concat(chunks)):reject(new Error('Conversion impossible : vérifiez le document, ses packages et ses fichiers complémentaires.'))})
  })
}
let busy=false
export async function processConversions() {
  if(busy)return
  busy=true
  try {
    for (;;) {
      const resource=await prisma.educationalResource.findFirst({where:{conversion:'PENDING'},orderBy:{createdAt:'asc'}})
      if(!resource)break
      const claimed=await prisma.educationalResource.updateMany({where:{id:resource.id,revision:resource.revision,conversion:'PENDING'},data:{conversion:'PROCESSING',conversionError:null}})
      if(!claimed.count)continue
      const directory=resource.storageKey.split('/')[0], name=`nexora-convert-${randomUUID()}`
      try {
        const output=path.join(root,directory,'output')
        await mkdir(output,{recursive:true})
        // Only input files are mounted; generated files live in a bounded tmpfs, never a writable host mount.
        const args=['run','--name',name,'--rm','--network=none','--read-only','--cap-drop=ALL','--security-opt=no-new-privileges','--user=65534:65534','--memory=768m','--memory-swap=768m','--cpus=1','--pids-limit=96','--ulimit','fsize=24576000:24576000','--tmpfs','/tmp:rw,noexec,nosuid,size=268435456','--mount',`type=bind,source=${path.join(root,directory,'input')},target=/input,readonly`,'--env','openin_any=p','--env','openout_any=p',process.env.RESOURCE_CONVERTER_IMAGE || 'nexora-converter:local',resource.format]
        const pdf=await docker(args)
        const outputKey=`${directory}/output/document.pdf`
        if(pdf.subarray(0,5).toString()!=='%PDF-')throw new Error('Le document ne produit pas un PDF valide.')
        await writeFile(storagePath(outputKey),pdf)
        await prisma.educationalResource.updateMany({where:{id:resource.id,revision:resource.revision},data:{conversion:'READY',outputKey,convertedAt:new Date()}})
      }catch(error){await prisma.educationalResource.updateMany({where:{id:resource.id,revision:resource.revision},data:{conversion:'FAILED',conversionError:error instanceof Error?error.message:'Conversion impossible.'}})}
      finally{await docker(['rm','-f',name],10_000).catch(()=>{})}
    }
  } finally{busy=false}
}
export async function recoverConversions(){
  await prisma.educationalResource.updateMany({where:{conversion:'PROCESSING'},data:{conversion:'FAILED',conversionError:'Conversion interrompue. Relancez-la depuis l’administration.'}})
  void processConversions().catch(console.error)
}
