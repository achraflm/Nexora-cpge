'use client'
import { useEffect, useRef, useState } from 'react'
import { openPdf, type PDFDocumentProxy } from './document-studio/pdf-engine'
import { PdfPageView } from './document-studio/PdfPageView'
import type { ProblemItem } from './ExercisePdfTemplate'

export function ProblemPdfReader({problem,onBack}:{problem:ProblemItem;onBack:()=>void}) {
  const [mode,setMode]=useState<'enonce'|'corrige'>('enonce')
  const [doc,setDoc]=useState<PDFDocumentProxy|null>(null)
  const [sizes,setSizes]=useState<{width:number;height:number}[]>([])
  const [error,setError]=useState(false)
  const [width,setWidth]=useState(320)
  const host=useRef<HTMLDivElement>(null)
  const url=`/problemes/${problem.id}-${mode}.pdf`
  useEffect(()=>{const el=host.current;if(!el)return;const observer=new ResizeObserver(([entry])=>setWidth(entry.contentRect.width));observer.observe(el);return()=>observer.disconnect()},[])
  useEffect(()=>{let stopped=false;let task:Awaited<ReturnType<typeof openPdf>>['task']|undefined;setDoc(null);setError(false);setSizes([]);(async()=>{try{const opened=await openPdf(url);task=opened.task;if(stopped){void task.destroy();return}const pdf=await opened.promise;const pages=await Promise.all(Array.from({length:pdf.numPages},async(_,i)=>{const p=await pdf.getPage(i+1);const v=p.getViewport({scale:1});return {width:v.width,height:v.height}}));if(!stopped){setSizes(pages);setDoc(pdf)}}catch{if(!stopped)setError(true)}})();return()=>{stopped=true;void task?.destroy()}},[url])
  return <main className="mx-auto max-w-5xl px-4 py-6 sm:px-8">
    <button type="button" className="mb-5 text-sm font-semibold text-blue-600" onClick={onBack}>← Retour aux problèmes</button>
    <div className="glass-container rounded-2xl p-5 mb-5"><p className="text-xs font-bold uppercase text-blue-600">{problem.moduleTitle} · Document PDF</p><h1 className="mt-2 text-2xl">{problem.title}</h1><p className="mt-2 text-sm text-slate-500">{problem.filiere} · {problem.recommendedDuration}</p>
    <div className="mt-5 flex flex-wrap items-center gap-2">{(['enonce','corrige'] as const).map(value=><button key={value} type="button" aria-pressed={mode===value} onClick={()=>setMode(value)} className={`rounded-xl px-4 py-2 font-semibold ${mode===value?'bg-blue-600 text-white':'bg-slate-100 text-slate-700'}`}>{value==='enonce'?'Énoncé':'Corrigé'}</button>)}<a href={url} download className="rounded-xl border px-4 py-2 text-sm font-semibold">Télécharger le PDF</a><a href={url} target="_blank" rel="noreferrer" className="px-2 py-2 text-sm text-blue-600">Ouvrir ↗</a></div></div>
    <div ref={host} className="rounded-xl bg-slate-200/70 p-2 sm:p-5" aria-label={`PDF ${mode==='enonce'?'énoncé':'corrigé'}`}>
      {error?<p role="alert" className="p-5">Le document ne peut pas être affiché. Utilisez « Ouvrir » ou « Télécharger le PDF ».</p>:!doc?<p role="status" className="p-5">Chargement du PDF…</p>:sizes.map((size,i)=><div key={`${url}-${i}`} className="mb-4"><p className="mb-2 text-center text-xs text-slate-600">Page {i+1} / {sizes.length}</p><PdfPageView doc={doc} pageNumber={i+1} size={size} scale={Math.min(1.5,Math.max(0.1,(width-16)/size.width))} active textLayer={false}/></div>)}
    </div>
  </main>
}
