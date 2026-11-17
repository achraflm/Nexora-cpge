'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { FilePdf, UploadSimple } from '@phosphor-icons/react'
import { useSessionUser } from './SessionProvider'
import { StudyWorkRender } from './StudyWorkRender'
import { ImageSourcePicker } from './ImageSourcePicker'
import { readImageToLatex, visionIsConfigured } from '@/lib/read-image-to-latex'
import { imageToLatexLimits } from '@/lib/image-to-latex'
import { compileStudyWork, isCompleteStudyWork } from '@/lib/study-work-latex'
import { loadPochetteAttachments, savePochetteAttachment, type PochetteAttachment } from '@/lib/pochette-storage'

function Attachment({ document, reading, disabled, visionReady, onRead, onSave }: {
  document: PochetteAttachment
  reading: boolean
  disabled: boolean
  visionReady: boolean
  onRead: (document: PochetteAttachment) => void
  onSave: (document: PochetteAttachment, latex: string) => Promise<boolean>
}) {
  const [url, setUrl] = useState('')
  const [draft, setDraft] = useState<string | null>(null)
  const { file, kind, transcription } = document
  const rendering = useMemo(() => transcription ? compileStudyWork(transcription.latex) : undefined, [transcription])
  const complete = Boolean(transcription && rendering && isCompleteStudyWork(transcription.latex, transcription.status, rendering))
  const draftRendering = useMemo(() => draft?.trim() ? compileStudyWork(draft) : undefined, [draft])
  const draftValid = Boolean(draft && draftRendering && isCompleteStudyWork(draft, 'ok', draftRendering))
  useEffect(() => {
    if (complete) return
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file, complete])

  if (kind === 'pdf') return <div id={'document-' + document.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-white/15">
    <FilePdf size={19} className="text-rose-500" aria-hidden="true" />
    <span className="min-w-0 flex-1 break-all font-semibold">{file.name}</span>
    {url && <a href={url} target="_blank" rel="noopener" className="font-semibold underline">Ouvrir le PDF</a>}
    {url && <a href={url} download={file.name} className="font-semibold underline">Télécharger</a>}
  </div>

  return <details id={'document-' + document.id} open className="space-y-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-white/15">
    <summary className="cursor-pointer break-words font-semibold">{file.name}</summary>
    <div className={'grid items-start gap-4' + (complete ? '' : ' md:grid-cols-2')}>
      {/* The image URL points to the file imported into this browser. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {!complete && url && <img src={url} alt={`Image importée · ${file.name}`} className="max-h-72 max-w-full rounded-lg object-contain print:hidden" />}
      <div className="min-w-0 space-y-3">
        {reading && <p role="status">Lecture de l’image en cours…</p>}
        {transcription && rendering && draft === null && <>
          <p className="font-semibold">Transcription mise en page</p>
          {!complete && <p className="text-xs text-amber-800 dark:text-amber-200">
            {rendering.valid ? 'Certains passages sont à vérifier.' : 'Certaines formules n’ont pas pu être mises en page.'}
          </p>}
          <StudyWorkRender rendering={rendering} />
          <details className="print:hidden">
            <summary className="cursor-pointer">Code LaTeX</summary>
            <pre className="mt-2 whitespace-pre-wrap break-all rounded-lg bg-slate-100 p-2 dark:bg-white/5">{transcription.latex}</pre>
          </details>
        </>}
        {!complete && !reading && draft === null && <div className="flex flex-wrap gap-2">
          {visionReady && <button type="button" className="ui-button-secondary" disabled={disabled} onClick={() => onRead(document)}>
            {transcription ? 'Relancer la lecture' : 'Lire l’image'}
          </button>}
          <button type="button" className="ui-button-secondary" disabled={disabled} onClick={() => setDraft(transcription?.latex ?? '')}>
            {transcription ? 'Corriger le LaTeX' : 'Saisir le LaTeX'}
          </button>
        </div>}
        {draft !== null && <form className="space-y-3" onSubmit={async event => {
          event.preventDefault()
          if (draftValid && await onSave(document, draft.trim())) setDraft(null)
        }}>
          <label className="block font-semibold">Code LaTeX
            <textarea value={draft} onChange={event => setDraft(event.target.value)} disabled={disabled}
              maxLength={imageToLatexLimits.latexChars} rows={6} spellCheck={false}
              className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-mono dark:border-white/15 dark:bg-slate-900" />
          </label>
          {draftRendering && <StudyWorkRender rendering={draftRendering} />}
          {draftRendering && !draftValid && <p role="status" className="text-xs text-amber-800 dark:text-amber-200">Vérifiez les passages illisibles et les formules dans l’aperçu.</p>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="ui-button-primary" disabled={disabled || !draftValid}>Enregistrer la transcription</button>
            <button type="button" className="ui-button-secondary" disabled={disabled} onClick={() => setDraft(null)}>Annuler</button>
          </div>
        </form>}
      </div>
    </div>
  </details>
}

export function PochetteDocuments({ pageId, folderTitle }: { pageId: string; folderTitle: string }) {
  const { id: userId } = useSessionUser()
  const pdfInput = useRef<HTMLInputElement>(null)
  const active = useRef<AbortController | null>(null)
  const [documents, setDocuments] = useState<PochetteAttachment[]>([])
  const [pending, setPending] = useState<PochetteAttachment | null>(null)
  const [latest, setLatest] = useState<string | null>(null)
  const [readingId, setReadingId] = useState('')
  const [busy, setBusy] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [ready, setReady] = useState(false)
  const [visionReady, setVisionReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const request = new AbortController()
    Promise.all([loadPochetteAttachments(userId, pageId), visionIsConfigured(request.signal).catch(() => false)]).then(([files, configured]) => {
      if (!mounted) return
      setDocuments(files)
      setVisionReady(configured)
      setReady(true)
    }).catch(() => {
      if (mounted) setError('Le stockage des pièces jointes est indisponible dans ce navigateur.')
    })
    return () => {
      mounted = false
      request.abort()
      active.current?.abort()
    }
  }, [pageId, userId])

  async function handleDocument(document: PochetteAttachment, isNew: boolean) {
    if (active.current || busy) return
    const controller = new AbortController()
    active.current = controller
    setBusy(true)
    setError('')
    try {
      if (isNew) {
        await savePochetteAttachment(document)
        if (controller.signal.aborted) return
        setDocuments(current => [...current, document])
        setPending(null)
        setLatest(document.id)
      }
      if (document.kind === 'image' && visionReady) {
        setReadingId(document.id)
        const transcription = await readImageToLatex(document.file, controller.signal)
        controller.signal.throwIfAborted()
        const updated = { ...document, transcription }
        await savePochetteAttachment(updated)
        if (!controller.signal.aborted) setDocuments(current => current.map(item => item.id === document.id ? updated : item))
      }
    } catch (reason) {
      if (!controller.signal.aborted) setError(reason instanceof Error && reason.name === 'Error' ? reason.message : 'Impossible d’enregistrer le document dans cette pochette.')
    } finally {
      if (active.current === controller) {
        active.current = null
        if (!controller.signal.aborted) {
          setBusy(false)
          setReadingId('')
        }
      }
    }
  }

  async function saveTranscription(document: PochetteAttachment, latex: string) {
    if (busy) return false
    setBusy(true)
    setError('')
    try {
      const updated = { ...document, transcription: { latex, status: 'ok' as const } }
      await savePochetteAttachment(updated)
      setDocuments(current => current.map(item => item.id === document.id ? updated : item))
      return true
    } catch {
      setError('Impossible d’enregistrer la transcription dans cette pochette.')
      return false
    } finally {
      setBusy(false)
    }
  }

  function stageFile(file: File, kind: PochetteAttachment['kind']) {
    setError('')
    setPending({ id: crypto.randomUUID(), userId, pageId, kind, file })
  }

  async function importPdf(event: ChangeEvent<HTMLInputElement>) {
    let file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const header = await file.slice(0, 1024).text().catch(() => '')
    if (!header.includes('%PDF-')) { setError('Choisissez un fichier PDF valide.'); return }
    if (file.type !== 'application/pdf') file = new File([file], file.name, { type: 'application/pdf' })
    stageFile(file, 'pdf')
  }

  return <section aria-label="Documents de la fiche" className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-sm font-bold">Documents de la fiche</h2>
      <ImageSourcePicker disabled={!ready || busy} onSelect={file => stageFile(file, 'image')} onError={setError} onCameraChange={setCameraActive}>
        <input ref={pdfInput} type="file" accept=".pdf,application/pdf" hidden onChange={event => void importPdf(event)} />
        <button type="button" className="ui-button-secondary disabled:opacity-50" disabled={!ready || busy || cameraActive} onClick={() => pdfInput.current?.click()}>
          <UploadSimple size={16} weight="bold" aria-hidden="true" /> Importer un PDF
        </button>
      </ImageSourcePicker>
    </div>
    {pending && <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-100 p-2 dark:bg-white/5">
      <span className="min-w-0 flex-1 break-all text-sm">{pending.file.name}</span>
      <button type="button" className="ui-button-primary" disabled={busy || cameraActive} onClick={() => void handleDocument(pending, true)}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
      <button type="button" className="ui-button-secondary" disabled={busy} onClick={() => setPending(null)}>Annuler</button>
    </div>}
    {latest && <div className="flex flex-wrap gap-x-2 text-sm">
      <p role="status">Document enregistré dans « {folderTitle} ».</p>
      <a href={'#document-' + latest} className="font-semibold underline">Consulter la pochette</a>
    </div>}
    {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
    {documents.map(document => <Attachment key={document.id} document={document} reading={document.id === readingId}
      disabled={busy} visionReady={visionReady} onRead={item => void handleDocument(item, false)} onSave={saveTranscription} />)}
  </section>
}
