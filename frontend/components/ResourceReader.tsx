'use client'
import { useEffect,useState } from 'react'
import { CoursePdfReader } from './CoursePdfReader'
import { resourceRequest, type EducationalResource } from '@/lib/educational-resources'
import type { CourseDocument } from '@/lib/pdf-course-chapters'

export function ResourceReader({resource,onBack}:{resource:EducationalResource;onBack:()=>void}) {
  const [item,setItem]=useState(resource),[error,setError]=useState('')
  useEffect(()=>{
    if(!['PENDING','PROCESSING'].includes(item.conversion))return
    let cancelled=false
    const timer=setInterval(()=>{resourceRequest(`/${resource.id}`).then(value=>{if(!cancelled){setItem(value);setError('')}}).catch(e=>{if(!cancelled)setError(e.message)})},2500)
    return()=>{cancelled=true;clearInterval(timer)}
  },[resource.id,item.conversion])
  if(item.conversion!=='READY')return <section className="glowing-card mx-auto my-8 max-w-3xl rounded-2xl p-8"><button onClick={onBack} className="ui-button-secondary">Retour au catalogue</button><h1 className="my-5 text-2xl font-bold">{item.title}</h1><p role="status">{item.conversion==='FAILED'?item.conversionError:'Préparation du document en cours… Cette page se met à jour automatiquement.'}</p>{error && <p role="alert">{error}</p>}<p className="mt-4 text-sm text-slate-500">{item.conversion==='FAILED'?'L’administration peut corriger le fichier ou relancer sa conversion.':'Vous pouvez revenir au catalogue pendant la conversion.'}</p></section>
  const document={title:item.title,type:item.type,level:item.level,sourceName:`${item.track} · ${item.subject.name} · ${item.format}`,localPdfUrl:`/api/resources/${item.id}/file`} as CourseDocument
  return <CoursePdfReader document={document} onBack={onBack} allowDownload={item.allowDownload} downloadUrl={`/api/resources/${item.id}/file?download=1`} />
}
