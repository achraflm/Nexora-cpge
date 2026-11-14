'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Download, FileText, RotateCw } from 'lucide-react'
import { openPdf, describePdfError, type PDFDocumentProxy } from './document-studio/pdf-engine'
import { PdfPageView, type PageSize } from './document-studio/PdfPageView'
import type { CourseDocument } from '@/lib/pdf-course-chapters'

export function CoursePdfReader({ document, onBack, onReport, allowDownload = true, downloadUrl }: { document: CourseDocument; onBack: () => void; onReport?: () => void; allowDownload?: boolean; downloadUrl?: string }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [size, setSize] = useState<PageSize | null>(null)
  const [width, setWidth] = useState(320)
  const host = useRef<HTMLDivElement>(null)
  const shell = useRef<HTMLElement>(null)
  const url = document.localPdfUrl
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const element = host.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!url) return
    let cancelled = false
    let task: Awaited<ReturnType<typeof openPdf>>['task'] | undefined
    setPdf(null)
    setPage(1)
    setSize(null)
    setError('')
    ;(async () => {
      try {
        const opened = await openPdf(url)
        task = opened.task
        if (cancelled) { void task.destroy(); return }
        const loaded = await opened.promise
        if (!cancelled) setPdf(loaded)
      } catch (reason) { if (!cancelled) setError(describePdfError(reason)) }
    })()
    return () => { cancelled = true; void task?.destroy() }
  }, [url])

  useEffect(() => {
    if (!pdf) return
    let cancelled = false
    setSize(null)
    pdf.getPage(page).then(value => {
      const viewport = value.getViewport({ scale: 1, rotation: (value.rotate + rotation) % 360 })
      if (!cancelled) setSize({ width: viewport.width, height: viewport.height })
    }).catch(reason => { if (!cancelled) setError(describePdfError(reason)) })
    return () => { cancelled = true }
  }, [pdf, page, rotation])

  return (
    <main ref={shell} className="mx-auto max-w-6xl overflow-auto bg-white px-4 py-6 sm:px-6 dark:bg-slate-950">
      <button type="button" onClick={onBack} className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"><ArrowLeft size={16} />Retour aux chapitres</button>
      <div className="glowing-card mb-5 rounded-2xl border border-slate-200 p-5 dark:border-white/10">
        <p className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-300"><FileText size={16} />{document.type === 'TD' ? 'Travaux dirigés' : 'Cours'} · {document.level === 'SUP' ? 'Sup' : 'Spé'} · PDF</p>
        <h1 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">{document.title}</h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Source : {document.sourceName}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {onReport && <button type="button" className="ui-button-secondary" onClick={onReport}>Signaler une erreur</button>}
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Page précédente" disabled={!pdf || page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-lg border p-2 disabled:opacity-30"><ChevronLeft size={18} /></button>
            <span aria-live="polite" className="text-sm">Page {page} / {pdf?.numPages ?? '…'}</span>
            <button type="button" aria-label="Page suivante" disabled={!pdf || page >= pdf.numPages} onClick={() => setPage(value => value + 1)} className="rounded-lg border p-2 disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
          <button type="button" disabled={!pdf} onClick={() => setRotation(value => (value + 90) % 360)} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm disabled:opacity-40"><RotateCw size={16} />Pivoter</button>
          <label className="text-sm">Zoom <select aria-label="Zoom" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="rounded-lg border bg-white p-2 dark:bg-slate-900">{[0.75,1,1.25,1.5,2].map(value=><option key={value} value={value}>{value*100}%</option>)}</select></label>
          <button className="rounded-lg border p-2 text-sm" onClick={() => { void shell.current?.requestFullscreen().catch(() => setError('Le plein écran est indisponible dans ce navigateur.')) }}>Plein écran</button>
          {url && allowDownload && <a href={downloadUrl || url} download className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"><Download size={16} />Télécharger le PDF</a>}
        </div>
      </div>
      <div ref={host} aria-label="Document du chapitre" className="min-w-0 overflow-auto rounded-xl bg-slate-200/70 p-2 sm:p-4 dark:bg-slate-950">
        {error ? <p role="alert" className="p-5 text-sm">{error}</p> : pdf && size ? <div className="mx-auto w-fit"><PdfPageView key={`${url}-${page}-${rotation}`} doc={pdf} pageNumber={page} size={size} rotation={rotation} scale={zoom * Math.min(1.5, Math.max(0.1, (width - 32) / size.width))} active textLayer={false} /></div> : <p role="status" className="p-5">Chargement du PDF…</p>}
      </div>
    </main>
  )
}
