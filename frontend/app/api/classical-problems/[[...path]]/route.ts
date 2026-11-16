import { NextRequest } from 'next/server'
import { getSession } from '@/lib/server-auth'

export const runtime='nodejs'
async function proxy(request:NextRequest,context:{params:Promise<{path?:string[]}>}) {
  const session=await getSession()
  if(!session)return Response.json({message:'Connexion requise.'},{status:401})
  const segments=(await context.params).path || []
  if(segments.length>3 || (segments[0] && !/^[a-f0-9-]{36}$/.test(segments[0])) || (segments[1] && !['progress','review','reviews','document'].includes(segments[1])) || (segments[2] && (segments[1]!=='document' || !['statement','correction'].includes(segments[2]))))return Response.json({message:'Route inconnue.'},{status:404})
  const mutating=request.method!=='GET'
  if(mutating) {
    if(request.headers.get('origin')!==(process.env.APP_ORIGIN || 'http://localhost:3000') || request.headers.get('sec-fetch-site')==='cross-site')return Response.json({message:'Origine refusée.'},{status:403})
    if(segments[1]!=='progress' && session.user.role!=='ADMIN')return Response.json({message:'Administration uniquement.'},{status:403})
  }
  let body:string|undefined
  if(mutating) {
    if(!request.headers.get('content-type')?.startsWith('application/json'))return Response.json({message:'Format JSON requis.'},{status:415})
    const reader=request.body?.getReader(),decoder=new TextDecoder();body='';let length=0
    if(reader)while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>128000){await reader.cancel();return Response.json({message:'Fiche trop volumineuse.'},{status:413})}body+=decoder.decode(value,{stream:true})}
    body+=decoder.decode()
  }
  try {
    const response=await fetch(`${process.env.API_GATEWAY_URL || 'http://127.0.0.1:4000'}/api/catalog/classical-problems${segments.length?'/'+segments.join('/'):''}${request.nextUrl.search}`,{method:request.method,headers:{Authorization:`Bearer ${session.accessToken}`,'Content-Type':'application/json'},body,cache:'no-store',signal:AbortSignal.timeout(15000)})
    return new Response(response.body,{status:response.status,headers:{'Content-Type':response.headers.get('content-type') || 'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',...(response.ok && response.headers.get('content-type')?.startsWith('application/pdf')?{'Content-Disposition':'inline; filename="probleme.pdf"','X-Frame-Options':'SAMEORIGIN','Content-Security-Policy':"frame-ancestors 'self'; base-uri 'none'"}:{})}})
  }catch{return Response.json({message:'Bibliothèque momentanément indisponible.'},{status:503})}
}
export {proxy as GET,proxy as POST,proxy as PATCH,proxy as PUT}
