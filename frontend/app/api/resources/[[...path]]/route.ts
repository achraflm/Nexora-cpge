import { NextRequest } from 'next/server'
import { getSession } from '@/lib/server-auth'

export const runtime='nodejs'
async function proxy(request:NextRequest, context:{params:Promise<{path?:string[]}>}) {
  const session=await getSession()
  if(!session)return Response.json({message:'Connexion requise.'},{status:401})
  const path=(await context.params).path || []
  const chapters=path[0]==='chapters'
  const segments=chapters?path.slice(1):path
  const allowedActions=chapters?['file']:['file','retry']
  if(segments.length>2 || (segments[0] && !(segments[0]==='inspect' && !chapters) && !/^[a-f0-9-]{36}$/.test(segments[0])) || (segments[1] && !allowedActions.includes(segments[1])))return Response.json({message:'Route inconnue.'},{status:404})
  const mutating=!['GET','HEAD'].includes(request.method)
  if(mutating){
    if(session.user.role!=='ADMIN')return Response.json({message:'Administration uniquement.'},{status:403})
    if(request.headers.get('origin')!==(process.env.APP_ORIGIN || 'http://localhost:3000') || request.headers.get('sec-fetch-site')==='cross-site')return Response.json({message:'Origine refusée.'},{status:403})
  }
  let body:Uint8Array|undefined
  if(mutating && request.body){
    const reader=request.body.getReader(), chunks:Uint8Array[]=[]
    let length=0
    while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>21*1024*1024){await reader.cancel();return Response.json({message:'Import limité à 20 Mo.'},{status:413})}chunks.push(value)}
    body=new Uint8Array(length);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length}
  }
  try {
    const collection=chapters?'chapter-materials':'educational-resources'
    const upstream=await fetch(`${process.env.API_GATEWAY_URL || 'http://127.0.0.1:4000'}/api/catalog/${collection}${segments.length?'/'+segments.join('/'):''}${request.nextUrl.search}`,{
      method:request.method,headers:{Authorization:`Bearer ${session.accessToken}`,...(request.headers.get('content-type')?{'Content-Type':request.headers.get('content-type')!}:{}),...(request.headers.get('range')?{Range:request.headers.get('range')!}:{})},body:body as BodyInit|undefined,cache:'no-store',signal:AbortSignal.timeout(30_000),
    })
    const headers=new Headers({'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'})
    for(const key of ['content-type','content-disposition','content-length','content-range','accept-ranges']){const value=upstream.headers.get(key);if(value)headers.set(key,value)}
    return new Response(upstream.body,{status:upstream.status,headers})
  }catch{return Response.json({message:'Service des ressources momentanément indisponible.'},{status:503})}
}
export {proxy as GET,proxy as POST,proxy as PUT,proxy as PATCH,proxy as DELETE}
