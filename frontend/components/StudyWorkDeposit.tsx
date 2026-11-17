'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Camera, Copy, LoaderCircle, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { imageToLatexLimits, type LatexTranscription } from '@/lib/image-to-latex'
import { readImageToLatex, visionIsConfigured } from '@/lib/read-image-to-latex'
import { compileStudyWork, hasUnreadableStudyWork, isCompleteStudyWork } from '@/lib/study-work-latex'
import { workApiUrl, workFolderUrl, type StudyWork, type StudyWorkStatus, type StudyWorkTarget } from '@/lib/study-work'
import { StudyWorkRender } from './StudyWorkRender'
import { ImageSourcePicker } from './ImageSourcePicker'

export function StudyWorkDeposit({ kind, resourceId, title, inFolder = false, actionLabel }: StudyWorkTarget & { title: string; inFolder?: boolean; actionLabel?: string }) {
  const router = useRouter()
  const heading = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const active = useRef<AbortController | null>(null)
  const target = { kind, resourceId }
  const workUrl = workApiUrl(target)
  const [file, setFile] = useState<File | null>(null)
  const [savedFile, setSavedFile] = useState<File | null>(null)
  const [savedImage, setSavedImage] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [latex, setLatex] = useState<string | null>(null)
  const [savedLatex, setSavedLatex] = useState<string | null>(null)
  const [resultStatus, setResultStatus] = useState<LatexTranscription['status'] | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [visionReady, setVisionReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [preview, setPreview] = useState(true)
  const [error, setError] = useState('')
  const [copyFeedback, setCopyFeedback] = useState('')
  const newPhoto = file !== savedFile ? file : null
  const rendering = useMemo(() => latex?.trim() ? compileStudyWork(latex) : undefined, [latex])
  const complete = Boolean(latex && rendering && isCompleteStudyWork(latex, resultStatus, rendering))
  const canValidate = Boolean(latex && rendering?.valid && !hasUnreadableStudyWork(latex))
  const needsReview = resultStatus === 'partial' || resultStatus === 'limited'
  const canSave = Boolean(newPhoto || (canValidate && (latex !== savedLatex || needsReview)))

  useEffect(() => {
    if (!file) { setImageUrl(''); return }
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  useEffect(() => () => active.current?.abort(), [])

  async function open() {
    dialog.current?.showModal()
    setShowPicker(true)
    if (loaded || loading) return
    const controller = new AbortController()
    active.current = controller
    setLoading(true)
    setError('')
    try {
      const [response, configured] = await Promise.all([
        fetch(workUrl, { cache: 'no-store', signal: controller.signal }),
        visionIsConfigured(controller.signal).catch(() => false),
      ])
      if (!response.ok) throw new Error('Impossible de charger la copie. Fermez la fenêtre puis réessayez.')
      const work = await response.json() as StudyWork | null
      if (controller.signal.aborted) return
      setLatex(work?.latex || null)
      setSavedLatex(work?.latex ?? null)
      setSavedImage(Boolean(work?.imageExtension))
      setResultStatus(work?.transcriptionStatus ?? null)
      setVisionReady(configured)
      setPreview(true)
      setLoaded(true)
    } catch (reason) {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Impossible de charger la copie.')
    } finally {
      if (active.current === controller) {
        active.current = null
        setLoading(false)
      }
    }
  }

  function selectImage(next: File) {
    setError('')
    setFile(next)
    setLatex(null)
    setResultStatus(null)
    setPreview(true)
  }

  function cancel() {
    active.current?.abort()
    active.current = null
    setBusy(false)
  }

  function close() {
    if (loading) {
      active.current?.abort()
      active.current = null
      setLoading(false)
    }
    cancel()
    setShowPicker(false)
    setCameraActive(false)
  }

  async function persist(latex: string, photo: File | null, status: StudyWorkStatus | null, signal?: AbortSignal) {
    const name = kind === 'td' && !/^TD\b/i.test(title) ? 'TD — ' + title : title
    const body = new FormData()
    body.set('title', name.slice(0, 240))
    body.set('latex', latex)
    if (photo) body.set('photo', photo)
    if (status) body.set('transcriptionStatus', status)
    const response = await fetch(workUrl, { method: 'PUT', body, signal })
    if (!response.ok) throw new Error('La copie n’a pas pu être enregistrée. Réessayez.')
    return response.json() as Promise<StudyWork>
  }

  async function convert(source = file, photoAlreadySaved = savedImage && !newPhoto) {
    if ((!source && !photoAlreadySaved) || active.current || !loaded || !visionReady) return
    const controller = new AbortController()
    active.current = controller
    setBusy(true)
    setError('')
    setCopyFeedback('')
    try {
      if (!source) {
        const response = await fetch(workUrl + '&file=photo', { signal: controller.signal })
        if (!response.ok) throw new Error('La photo enregistrée ne peut pas être chargée.')
        const blob = await response.blob()
        source = new File([blob], 'copie', { type: blob.type })
      }
      const result = await readImageToLatex(source, controller.signal)
      if (controller.signal.aborted) return
      setLatex(result.latex)
      setResultStatus(result.status)
      setPreview(true)
      if (photoAlreadySaved && result.status !== 'unreadable') {
        const work = await persist(result.latex, null, result.status, controller.signal)
        setSavedLatex(work.latex)
        if (inFolder) router.refresh()
      }
    } catch (reason) {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'La transcription a échoué. Réessayez.')
    } finally {
      if (active.current === controller) {
        active.current = null
        setBusy(false)
      }
    }
  }

  async function save() {
    if (!canSave || saving || busy || !loaded) return
    setError('')
    setSaving(true)
    try {
      const pendingManualDraft = Boolean(latex?.trim()) && !canValidate
      const draft = canValidate ? latex ?? '' : ''
      const work = await persist(draft, newPhoto, draft ? 'ok' : null)
      if (!pendingManualDraft) setLatex(work.latex || null)
      setSavedLatex(work.latex)
      setSavedImage(Boolean(work.imageExtension))
      setResultStatus(work.transcriptionStatus)
      if (newPhoto) setSavedFile(newPhoto)
      if (inFolder) router.refresh()
      if (newPhoto && !work.latex && !pendingManualDraft && visionReady) void convert(newPhoto, true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'La copie n’a pas pu être enregistrée.')
    } finally {
      setSaving(false)
    }
  }

  async function copy() {
    if (!latex) return
    try {
      await navigator.clipboard.writeText(latex)
      setCopyFeedback('Code LaTeX copié.')
    } catch { setCopyFeedback('Sélectionnez le code pour le copier.') }
  }

  const label = actionLabel ?? (inFolder ? 'Saisir ou lire la transcription' : 'Déposer mon travail')
  return <>
    <button type="button" onClick={() => void open()} className="ui-button-secondary shrink-0">
      <Camera size={16} aria-hidden="true" />{label}
    </button>
    <dialog ref={dialog} data-study-work onClose={close} onCancel={event => { if (saving) event.preventDefault() }} aria-labelledby={heading}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[min(94vw,56rem)] max-w-none overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 dark:border-white/15 dark:bg-slate-950 dark:text-slate-100">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 dark:border-white/15 dark:bg-slate-950">
        <div>
          <h2 id={heading} className="text-lg font-bold">{label}</h2>
        </div>
        <button type="button" aria-label="Fermer le dépôt" disabled={saving} onClick={() => dialog.current?.close()} className="rounded-lg border p-2"><X size={18} /></button>
      </div>
      <div className={'grid gap-5 p-5 ' + (latex !== null ? 'md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]' : '')}>
        <form onSubmit={event => { event.preventDefault(); void save() }} className="space-y-4">
          {showPicker && <ImageSourcePicker disabled={!loaded || busy || saving} onSelect={selectImage} onError={setError} onCameraChange={setCameraActive} />}
          {loading && <p role="status" className="text-sm">Chargement de la copie…</p>}
          <p className="text-xs text-slate-600 dark:text-slate-400">JPEG, PNG ou WebP · 15 Mo maximum</p>
          {(imageUrl || savedImage) && (!complete || Boolean(newPhoto) || latex !== savedLatex) && <figure className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-white/15 dark:bg-slate-900">
            {/* A local object URL already contains the browser-selected preview. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl || workUrl + '&file=photo'} alt="Aperçu de la copie" className="mx-auto max-h-72 max-w-full object-contain" />
          </figure>}
          {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
          {loaded && !visionReady && <p className="text-sm text-slate-600 dark:text-slate-400">La lecture automatique n’est pas encore configurée. Vous pouvez saisir la transcription en LaTeX.</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={!canSave || busy || saving || !loaded || cameraActive} className="ui-button-primary disabled:opacity-50">
              {saving ? 'Enregistrement…' : newPhoto && !canValidate ? 'Enregistrer la photo' : needsReview ? 'Valider la transcription' : 'Enregistrer'}
            </button>
            {visionReady && <button type="button" onClick={() => void convert()} disabled={(!file && !savedImage) || busy || saving || !loaded || cameraActive} className="ui-button-secondary disabled:opacity-50">
              {busy && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
              {busy ? 'Transcription en cours…' : 'Convertir en LaTeX'}
            </button>}
            {latex === null && <button type="button" onClick={() => setLatex('')} disabled={!loaded || busy || saving} className="ui-button-secondary">Saisir le LaTeX</button>}
            {busy && <button type="button" className="ui-button-secondary" onClick={cancel}>Annuler</button>}
          </div>
          {savedLatex !== null && <div role="status" className="space-y-1 text-sm">
            <p>{savedLatex ? 'Transcription enregistrée.' : 'Photo enregistrée.'}</p>
            {!inFolder && <Link href={workFolderUrl(target)} className="font-semibold underline underline-offset-4">Consulter la pochette</Link>}
          </div>}
        </form>
        {latex !== null && <div className="min-w-0 space-y-3">
          {resultStatus === 'partial' && <p role="status" className="rounded-lg bg-amber-500/10 p-2 text-sm text-amber-900 dark:text-amber-200">Vérifiez les passages signalés comme illisibles.</p>}
          {resultStatus === 'limited' && <p role="status" className="rounded-lg bg-amber-500/10 p-2 text-sm text-amber-900 dark:text-amber-200">Vérifiez les symboles et la disposition des formules avant de valider.</p>}
          {rendering && !rendering.valid && <p role="status" className="text-sm text-amber-800 dark:text-amber-200">Certains passages ne peuvent pas être mis en page. Vérifiez les formules dans l’aperçu.</p>}
          <label className="block text-sm font-semibold">Code LaTeX
            <textarea aria-label="Code LaTeX" value={latex} onChange={event => { setLatex(event.target.value); setCopyFeedback('') }} maxLength={imageToLatexLimits.latexChars} disabled={saving || busy} rows={11} spellCheck={false}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-white/15 dark:bg-slate-900" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copy} disabled={!latex.trim()} className="ui-button-secondary"><Copy size={15} aria-hidden="true" />Copier le code</button>
            <button type="button" onClick={() => setPreview(value => !value)} disabled={!latex.trim()} className="ui-button-secondary" aria-pressed={preview}>Aperçu du rendu</button>
          </div>
          {copyFeedback && <p role="status" className="text-sm">{copyFeedback}</p>}
          {preview && rendering && <div className="rounded-xl border border-slate-200 p-3 dark:border-white/15"><StudyWorkRender rendering={rendering} /></div>}
        </div>}
      </div>
    </dialog>
  </>
}
