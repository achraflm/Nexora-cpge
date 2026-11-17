'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import { chapterMaterialPdf, chapterMaterialRequest, type ChapterMaterial } from '@/lib/chapter-materials'
import { programmeChapters, programmeSubjectLabels } from '@/lib/cpge-programme'
import { ChapterLatexContent } from './ChapterMaterials'
import { ConfirmRemoval } from './UiFeedback'

type Form = Pick<ChapterMaterial, 'subject' | 'level' | 'chapterTitle' | 'type' | 'title' | 'format' | 'status'> & { latex: string }

const initialForm: Form = {
  subject: 'MATH', level: 'SUP', chapterTitle: '', type: 'COURSE',
  title: '', format: 'LATEX', status: 'PUBLISHED', latex: '',
}
const field = 'mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-white/15 dark:bg-slate-900'

export function AdminChapterMaterials() {
  const [materials, setMaterials] = useState<ChapterMaterial[] | null>(null)
  const [form, setForm] = useState(initialForm)
  const [editing, setEditing] = useState<ChapterMaterial | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [reload, setReload] = useState(0)
  const [removal, setRemoval] = useState<ChapterMaterial | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    chapterMaterialRequest<{ materials: ChapterMaterial[] }>('', { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setMaterials(result.materials) })
      .catch(reason => { if (!controller.signal.aborted) setError(reason.message) })
    return () => controller.abort()
  }, [reload])

  function reset() {
    setEditing(null)
    setFile(null)
    if (fileInput.current) fileInput.current.value = ''
    setPreview(false)
    setForm(previous => ({ ...previous, title: '', latex: '' }))
  }

  function edit(item: ChapterMaterial) {
    setEditing(item)
    setError('')
    setMessage('')
    setPreview(false)
    setFile(null)
    if (fileInput.current) fileInput.current.value = ''
    setForm({
      subject: item.subject, level: item.level, chapterTitle: item.chapterTitle, type: item.type,
      title: item.title, format: item.format, status: item.status, latex: item.latex ?? '',
    })
    document.getElementById('chapter-material-editor')?.scrollIntoView({ block: 'start' })
    document.getElementById('chapter-material-title')?.focus({ preventScroll: true })
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError('')
    setMessage('')
    if (file && file.size > 20 * 1024 * 1024) { setError('Le PDF est limité à 20 Mo.'); return }
    const { latex, ...metadata } = form
    const body = new FormData()
    body.set('metadata', JSON.stringify({
      ...metadata, latex: form.format === 'LATEX' ? latex : undefined, revision: editing?.revision,
    }))
    if (form.format === 'PDF' && file) body.set('file', file)
    setBusy(true)
    try {
      const saved = await chapterMaterialRequest<ChapterMaterial>(editing ? '/' + editing.id : '', {
        method: editing ? 'PATCH' : 'POST', body,
      })
      setMaterials(previous => editing
        ? (previous ?? []).map(item => item.id === saved.id ? saved : item)
        : [...(previous ?? []), saved])
      reset()
      setMessage(saved.status === 'PUBLISHED' ? 'Contenu publié dans le chapitre.' : 'Brouillon enregistré.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Enregistrement impossible.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(item: ChapterMaterial) {
    setRemoval(null)
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await chapterMaterialRequest<void>('/' + item.id + '?revision=' + item.revision, { method: 'DELETE' })
      setMaterials(previous => previous?.filter(material => material.id !== item.id) ?? null)
      if (editing?.id === item.id) reset()
      setMessage('Contenu supprimé du chapitre.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Suppression impossible.')
    } finally {
      setBusy(false)
    }
  }

  return <section className="space-y-6">
    <h1 className="flex items-center gap-2 text-2xl font-bold"><BookOpen className="text-blue-500" aria-hidden="true" />Chapitres du programme</h1>
    <form id="chapter-material-editor" onSubmit={save} className="glowing-card scroll-mt-24 rounded-2xl p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-bold">{editing ? 'Modifier le contenu' : 'Ajouter au chapitre'}</h2>
      <fieldset disabled={busy} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label>Niveau<select aria-label="Niveau" className={field} value={form.level} onChange={event => setForm({ ...form, level: event.target.value as Form['level'], chapterTitle: '' })}>
            <option value="SUP">Sup MPSI</option><option value="SPE">Spé MP</option>
          </select></label>
          <label>Matière<select aria-label="Matière" className={field} value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value as Form['subject'], chapterTitle: '' })}>
            {Object.entries(programmeSubjectLabels).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select></label>
          <label className="md:col-span-2">Chapitre du programme<select aria-label="Chapitre du programme" required className={field} value={form.chapterTitle} onChange={event => setForm({ ...form, chapterTitle: event.target.value })}>
            <option value="">Choisir un chapitre</option>
            {programmeChapters(form.subject, form.level).map((title, index) => <option key={title} value={title}>{index + 1}. {title}</option>)}
          </select></label>
          <label>Partie<select aria-label="Partie" className={field} value={form.type} onChange={event => setForm({ ...form, type: event.target.value as Form['type'] })}>
            <option value="COURSE">Cours</option><option value="TD">TD</option>
          </select></label>
          <label>Format<select aria-label="Format" disabled={Boolean(editing)} className={field} value={form.format} onChange={event => {
            setForm({ ...form, format: event.target.value as Form['format'] })
            setFile(null)
            setPreview(false)
          }}>
            <option value="LATEX">Code LaTeX</option><option value="PDF">Fichier PDF</option>
          </select></label>
          <label className="md:col-span-2">Titre du contenu<input id="chapter-material-title" aria-label="Titre du contenu" required maxLength={200} className={field} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
        </div>
        {form.format === 'LATEX' ? <>
          <label className="block">Code LaTeX<textarea aria-label="Code LaTeX" required rows={9} maxLength={65_536} spellCheck={false} className={field + ' font-mono text-sm'} value={form.latex} onChange={event => setForm({ ...form, latex: event.target.value })} /></label>
          <button type="button" className="ui-button-secondary" disabled={!form.latex.trim()} onClick={() => setPreview(value => !value)}>{preview ? 'Masquer l’aperçu' : 'Aperçu LaTeX'}</button>
          {preview && <div className="rounded-xl border border-slate-200 p-4 dark:border-white/15"><ChapterLatexContent source={form.latex} /></div>}
        </> : <div>
          <label className="block">{editing ? 'Remplacer le PDF' : 'Fichier PDF'}<input ref={fileInput} aria-label={editing ? 'Remplacer le PDF' : 'Fichier PDF'} type="file" accept=".pdf,application/pdf" required={!editing} className={field} onChange={event => setFile(event.target.files?.[0] ?? null)} /></label>
          {editing?.fileName && <p className="mt-2 text-sm">Fichier actuel · {editing.fileName}</p>}
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Le PDF apparaît dans Documents supplémentaires. Taille maximale de 20 Mo.</p>
        </div>}
        <label className="block max-w-sm">Visibilité<select aria-label="Visibilité" className={field} value={form.status} onChange={event => setForm({ ...form, status: event.target.value as Form['status'] })}>
          <option value="PUBLISHED">Publié pour les étudiants</option><option value="DRAFT">Brouillon</option>
        </select></label>
        {error && <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>}
        {message && <p role="status" className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{message}</p>}
        <div className="flex flex-wrap gap-3">
          <button className="ui-button-primary"><Plus size={16} aria-hidden="true" />{busy ? 'Enregistrement…' : 'Enregistrer le contenu'}</button>
          {editing && <button type="button" className="ui-button-secondary" onClick={reset}>Annuler la modification</button>}
        </div>
      </fieldset>
    </form>

    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Contenus ajoutés aux chapitres</h2>
        <button type="button" className="ui-button-secondary" disabled={busy} onClick={() => { setError(''); setReload(value => value + 1) }}>Actualiser la liste</button>
      </div>
      {materials === null && !error && <p role="status">Chargement des contenus…</p>}
      {materials?.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Aucun contenu ajouté.</p>}
      {materials?.map(item => <article key={item.id} className="glowing-card flex flex-wrap items-center justify-between gap-4 rounded-xl p-4">
        <div className="min-w-0">
          <h3 className="break-words font-semibold">{item.title}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.level === 'SUP' ? 'Sup MPSI' : 'Spé MP'} · {programmeSubjectLabels[item.subject]} · {item.chapterTitle}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.type === 'TD' ? 'TD' : 'Cours'} · {item.format === 'PDF' ? 'PDF' : 'LaTeX'} · {item.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.format === 'PDF' && <a className="ui-button-secondary" href={chapterMaterialPdf(item).localPdfUrl!} target="_blank" rel="noopener noreferrer">Consulter le PDF</a>}
          <button type="button" className="ui-button-secondary" disabled={busy} onClick={() => edit(item)}><Pencil size={15} aria-hidden="true" />Modifier</button>
          <button type="button" className="ui-button-secondary" disabled={busy} onClick={() => setRemoval(item)}><Trash2 size={15} aria-hidden="true" />Supprimer</button>
        </div>
      </article>)}
    </div>
    {removal && <ConfirmRemoval title={removal.title} onCancel={() => setRemoval(null)} onConfirm={() => void remove(removal)} />}
  </section>
}
