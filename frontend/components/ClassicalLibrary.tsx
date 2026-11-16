'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, BookOpen, Star } from 'lucide-react'
import { GraduationCap, Atom, Flask, Gear, TerminalWindow } from '@phosphor-icons/react'
import { CLASSIC_SUBJECTS, CORRECTION_LABELS, DIFFICULTIES, PROBLEM_TYPES, PROGRESS_LABELS, classicRequest, emptyProgress, type ClassicProblem, type ClassicProgress, type ClassicSource } from '@/lib/classical-library'
import { DocumentStudio } from './document-studio'
import { MathFormula } from './MathFormula'

const control='rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-slate-900'
function SourceDetails({source}:{source:ClassicSource}) {
  return <details className="text-xs text-slate-500 dark:text-slate-400"><summary className="cursor-pointer">Crédits du document</summary><p className="mt-2">{source.author || source.institution || source.sourceName} · {source.license}</p></details>
}
function ProblemDetail({problem,onBack,onReport}:{problem:ClassicProblem;onBack:()=>void;onReport?:()=>void}) {
  const [progress,setProgress]=useState<ClassicProgress>(problem.progress || emptyProgress)
  const [notes,setNotes]=useState(progress.notes),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('')
  const [mode,setMode]=useState<'statement'|'correction'>('statement'),[page,setPage]=useState(1),[bookmarkNote,setBookmarkNote]=useState(''),[pageRequest,setPageRequest]=useState({ page: 1 })
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'})},[problem.id])
  const source=mode==='statement'?problem.metadata.statement:problem.metadata.correction
  const viewerUrl=source?.access==='LOCAL'?`/api/classical-problems/${problem.id}/document/${mode}`:null
  async function save(patch:Partial<ClassicProgress>) {
    setBusy(true);setError('');setMessage('')
    try{setProgress(await classicRequest(`/${problem.id}/progress`,'PUT',patch));setMessage('Enregistré.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  return <section className="mx-auto max-w-7xl space-y-5 p-4 sm:p-8">
    <button className="ui-button-secondary" onClick={onBack}><ArrowLeft size={16}/> Bibliothèque</button>
    <div className="glowing-card space-y-4 rounded-2xl p-4 sm:p-6"><p className="text-sm text-blue-500">{CLASSIC_SUBJECTS[problem.subject.code]} · {problem.level==='SUP'?'Sup':'Spé'} · {problem.chapterLabel}</p><h1 className="text-2xl font-bold">{problem.title}</h1><details><summary className="cursor-pointer text-sm">À propos de ce problème</summary><p className="mt-3">{problem.metadata.description}</p><p className="text-sm">{PROBLEM_TYPES[problem.problemType]} · {DIFFICULTIES[problem.difficulty]} · environ {problem.metadata.estimatedMinutes} min</p><p className="text-sm">Prérequis : {problem.metadata.prerequisites.join(', ') || 'Non renseignés'}</p></details>

    </div>
    <div className="flex flex-wrap gap-3"><button aria-pressed={mode==='statement'} className="ui-button-secondary" onClick={()=>{setPageRequest({ page: 1 });setMode('statement')}}>Énoncé original</button><button disabled={!problem.correctionAvailable} aria-pressed={mode==='correction'} className="ui-button-secondary disabled:opacity-50" onClick={()=>{setPageRequest({ page: 1 });setMode('correction');if(progress.status!=='MASTERED')void save({status:'CORRECTION_CONSULTED'})}}>Consulter le corrigé original</button><span className="self-center text-sm">{CORRECTION_LABELS[problem.correctionStatus]}</span></div>
    {source && (
      <div className="glowing-card space-y-4 rounded-2xl p-2 sm:p-3">
        {viewerUrl ? (
          <div className="h-[88dvh] min-h-96 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
            <DocumentStudio
              key={viewerUrl}
              mode="study"
              presentation="problems"
              documents={[{ id: mode, label: mode === 'statement' ? 'Énoncé' : 'Corrigé', url: viewerUrl }]}
              activeDocumentId={mode}
              pageRequest={pageRequest}
              onPageChange={setPage}
            />
          </div>
        ) : <p className="text-sm text-slate-500">Le document sera disponible ici dès que son import sera terminé.</p>}
        <SourceDetails source={source} />
      </div>
    )}
    <div className="glowing-card space-y-4 rounded-2xl p-4 sm:p-6"><h2 className="text-lg font-semibold">Mon carnet de travail</h2>      <div className="flex flex-wrap gap-3"><button disabled={busy} onClick={()=>void save({favorite:!progress.favorite})} className="ui-button-secondary"><Star size={16} fill={progress.favorite?'currentColor':'none'}/> {progress.favorite?'Favori':'Ajouter aux favoris'}</button><button disabled={busy} onClick={()=>void save({saved:!progress.saved})} className="ui-button-secondary">{progress.saved?'Retirer des enregistrés':'Enregistrer pour plus tard'}</button>{onReport && <button className="ui-button-secondary" onClick={onReport}>Signaler un problème</button>}</div>
      <label className="block text-sm">Ma progression <select className={`${control} ml-2`} disabled={busy} value={progress.status} onChange={e=>void save({status:e.target.value as ClassicProgress['status']})}>{Object.entries(PROGRESS_LABELS).map(([key,label])=><option key={key} value={key} disabled={key==='CORRECTION_CONSULTED' && !problem.correctionAvailable}>{label}</option>)}</select></label><label className="block text-sm">Notes personnelles<textarea className={`${control} mt-2 block min-h-32 w-full`} maxLength={20000} value={notes} onChange={e=>setNotes(e.target.value)}/></label><button className="ui-button-primary" disabled={busy} onClick={()=>void save({notes})}>Enregistrer mes notes</button>
      <div className="flex flex-wrap items-end gap-3"><label className="text-sm">Page du signet<input type="number" min={1} max={10000} className={`${control} block w-24`} value={page} onChange={e=>setPage(Number(e.target.value))}/></label><label className="text-sm">Annotation du signet<input className={`${control} block`} maxLength={1000} value={bookmarkNote} onChange={e=>setBookmarkNote(e.target.value)}/></label><button className="ui-button-secondary" disabled={busy || !Number.isInteger(page) || page<1 || page>10000 || progress.bookmarks.length>=100} onClick={()=>void save({bookmarks:[...progress.bookmarks,{document:mode,page,note:bookmarkNote}]})}>Ajouter un signet</button></div>
      {progress.bookmarks.map((bookmark,index)=><div className="flex justify-between gap-4 border-b border-slate-500/20 py-2 text-sm" key={index}><button className="text-left underline" onClick={()=>{setMode(bookmark.document);setPageRequest({ page: bookmark.page });setPage(bookmark.page);}}>{bookmark.document==='statement'?'Énoncé':'Corrigé'} · page {bookmark.page} · {bookmark.note}</button><button disabled={busy} onClick={()=>void save({bookmarks:progress.bookmarks.filter((_,i)=>i!==index)})}>Retirer</button></div>)}
      <p role="status">{message}</p>{error && <p role="alert" className="text-red-500">{error}</p>}
    </div>
  </section>
}
const subjectPresentation = {
  MATH: {icon:GraduationCap, color:'text-indigo-600 dark:text-indigo-300', background:'bg-indigo-500/10'},
  PHYS: {icon:Atom, color:'text-sky-600 dark:text-sky-300', background:'bg-sky-500/10'},
  CHEM: {icon:Flask, color:'text-teal-600 dark:text-teal-300', background:'bg-teal-500/10'},
  SI: {icon:Gear, color:'text-amber-600 dark:text-amber-300', background:'bg-amber-500/10'},
  INFO: {icon:TerminalWindow, color:'text-purple-600 dark:text-purple-300', background:'bg-purple-500/10'},
} as const

const problemIllustrations: Readonly<Partial<Record<string, {
  src: string
  alt: string
  contain?: boolean
} & ({
  author: string
  source: string
  license: string
  licenseUrl: string
} | { author?: never })>>> = {
  'Intégrale gaussienne': {
    src: '/images/gaussian-integral.svg',
    alt: 'Aire sous la courbe de la fonction gaussienne exp(−x²)',
    author: 'A1E6',
    source: 'https://commons.wikimedia.org/wiki/File:The_Gaussian_integral.svg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    contain: true,
  },
  'Cinétique d’une réaction en chaîne': {
    src: '/images/problem-methane.png',
    alt: 'Modèle moléculaire du méthane',
    author: 'Ben Mills',
    source: 'https://commons.wikimedia.org/wiki/File:Methane-CRC-MW-3D-balls.png',
    license: 'Domaine public',
    licenseUrl: 'https://commons.wikimedia.org/wiki/File:Methane-CRC-MW-3D-balls.png#Licensing',
    contain: true,
  },
  'Le compte est bon': {
    src: '/images/problem-le-compte-est-bon.webp',
    alt: 'Plaques numérotées et nombre cible du jeu Le compte est bon',
  },
  'Fonction gamma d’Euler': {
    src: '/images/gamma-function.svg',
    alt: 'Courbe de la fonction gamma d’Euler',
    author: 'Rumil',
    source: 'https://commons.wikimedia.org/wiki/File:Gamma_function.svg',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    contain: true,
  },
  'Cycle avec régénération — propulsion d’un brise-glace': {
    src: '/images/50-let-pobedy.jpg',
    alt: 'Le brise-glace 50 Let Pobedy dans la banquise arctique',
    author: 'Kiselev d',
    source: 'https://commons.wikimedia.org/wiki/File:50letPob_pole.JPG',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
}

const problemFormulas: Readonly<Partial<Record<string, string>>> = {
  'Intégrale gaussienne': String.raw`\int_0^{+\infty} e^{-x^2}\,\mathrm{d}x`,
  'Fonction gamma d’Euler': String.raw`\Gamma(x)=\int_0^{+\infty}t^{x-1}e^{-t}\,\mathrm{d}t`,
}

export function ClassicalLibrary({onBackToDashboard,onReport}:{onBackToDashboard?:()=>void;onReport?:(item:{ref:string;title:string})=>void}) {
  const [all,setAll]=useState<ClassicProblem[]>([]),[selected,setSelected]=useState<ClassicProblem|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[reload,setReload]=useState(0)
  const [subject,setSubject]=useState<keyof typeof CLASSIC_SUBJECTS|null>(null)
  useEffect(()=>{const abort=new AbortController();setLoading(true);setError('');classicRequest('','GET',undefined,abort.signal).then(data=>setAll(data.problems)).catch(e=>{if(e.name!=='AbortError')setError(e.message)}).finally(()=>{if(!abort.signal.aborted)setLoading(false)});return()=>abort.abort()},[reload])
  function chooseSubject(value:typeof subject){setSubject(value);window.scrollTo({top:0,behavior:'instant'})}
  if(selected)return <ProblemDetail key={selected.id} problem={selected} onBack={()=>{setSelected(null);setReload(x=>x+1)}} onReport={onReport?()=>onReport({ref:`CLASSIC-${selected.id}`,title:selected.title}):undefined}/>
  const available=all.filter(p=>p.state==='PUBLISHED' && p.metadata.statement.access==='LOCAL' && p.metadata.statement.resourceId)
  const problems=available.filter(p=>p.subject.code===subject)
  return <main className="mx-auto max-w-7xl space-y-7 p-4 text-slate-900 sm:p-8 dark:text-slate-100">
    {subject?<button className="ui-button-secondary" onClick={()=>chooseSubject(null)}><ArrowLeft size={16}/> Toutes les matières</button>:onBackToDashboard && <button className="ui-button-secondary" onClick={onBackToDashboard}><ArrowLeft size={16}/> Tableau de bord</button>}
    <header><p className="mb-2 text-sm font-semibold text-blue-500">APPRENDRE · COMPRENDRE · APPROFONDIR</p><h1 className="text-3xl font-bold sm:text-4xl">{subject?`Problèmes de ${CLASSIC_SUBJECTS[subject].toLocaleLowerCase()}`:'Bibliothèque de problèmes classiques'}</h1><p className="mt-3 max-w-3xl text-slate-500 dark:text-slate-400">{subject?'Choisissez un problème pour lire son énoncé directement ici.':'Choisissez une matière pour découvrir ses problèmes.'}</p></header>
    {loading && <p role="status">Chargement des problèmes…</p>}
    {error && <div role="alert" className="rounded-xl border border-red-500 p-4">{error} <button className="underline" onClick={()=>setReload(x=>x+1)}>Réessayer</button></div>}
    {!subject && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{(Object.keys(CLASSIC_SUBJECTS) as (keyof typeof CLASSIC_SUBJECTS)[]).map(key=>{
      const {icon:Icon,color,background}=subjectPresentation[key]
      const count=available.filter(p=>p.subject.code===key).length
      return <button type="button" key={key} onClick={()=>chooseSubject(key)} className="glowing-card group rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 dark:border-white/10 dark:hover:border-blue-500">
        <span className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${background} ${color}`}><Icon size={30} weight="duotone" aria-hidden="true"/></span>
        <strong className="block">{CLASSIC_SUBJECTS[key]}</strong><span className={`mt-2 block text-sm ${count?'text-blue-600 dark:text-blue-400':'text-slate-500 dark:text-slate-400'}`}>{loading?'Chargement…':error?'Indisponible':count?`${count} problème${count>1?'s':''} à découvrir`:'Aucun problème publié'}</span>
      </button>
    })}</div>}
    {subject && !loading && !error && !problems.length && <div className="glowing-card rounded-2xl p-10 text-center"><BookOpen className="mx-auto mb-4 text-blue-500" size={32}/><h2 className="text-xl font-semibold">Aucun problème publié dans cette matière</h2><p className="mt-2 text-slate-500">Les documents apparaîtront ici après leur import et leur validation.</p><button className="ui-button-secondary mt-5" onClick={()=>chooseSubject(null)}>Choisir une autre matière</button></div>}
    {subject && <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{problems.map(p=>{
      const {icon:Icon,color,background}=subjectPresentation[p.subject.code]
      const illustration = problemIllustrations[p.title]
      const formula = problemFormulas[p.title]
      return <article key={p.id} className="glowing-card flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
        {illustration ? (
          <figure>
            <div className={`relative aspect-[16/9] overflow-hidden ${illustration.contain?'bg-white':'bg-slate-100 dark:bg-slate-900'}`}>
              <Image src={illustration.src} alt={illustration.alt} fill sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw" className={illustration.contain?'object-contain p-3':'object-cover'} />
            </div>
            {illustration.author && <figcaption className="px-6 pt-2 text-xs text-slate-500 dark:text-slate-400">
              Illustration par <a className="underline" href={illustration.source}>{illustration.author}</a> ·{' '}
              <a className="underline" href={illustration.licenseUrl}>{illustration.license}</a>
            </figcaption>}
          </figure>
        ) : formula ? (
          <div className={`flex min-h-28 items-center justify-center px-4 ${background} ${color}`}>
            <MathFormula math={formula} block className="text-lg sm:text-xl" />
          </div>
        ) : (
          <div aria-hidden="true" className={`flex h-28 items-center justify-center ${background} ${color}`}><Icon size={52} weight="duotone"/></div>
        )}
        <div className="flex flex-1 flex-col gap-4 p-6"><p className="text-xs font-semibold text-blue-500">{p.level==='SUP'?'Sup':'Spé'} · {p.tracks.join(' / ')}</p><h2 className="text-xl font-bold">{p.title}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{p.chapterLabel}</p><p className="text-sm">{DIFFICULTIES[p.difficulty]} · {p.metadata.estimatedMinutes} min</p><p className="text-sm text-emerald-600 dark:text-emerald-400">Énoncé disponible sur le site{p.correctionAvailable?' · Corrigé disponible':''}</p><p className="text-sm">{PROGRESS_LABELS[p.progress?.status || 'NOT_STARTED']}{p.progress?.favorite?' · ★':''}</p><button className="ui-button-primary mt-auto" onClick={()=>setSelected(p)}>Lire le problème</button></div>
      </article>
    })}</div>}
  </main>
}
