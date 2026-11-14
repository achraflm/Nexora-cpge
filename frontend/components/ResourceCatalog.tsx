'use client'
import { useEffect,useState } from 'react'
import { BookOpen,NotebookPen,Search,FileText,ArrowRight } from 'lucide-react'
import { RESOURCE_SUBJECTS,resourceRequest,type EducationalResource } from '@/lib/educational-resources'
import dynamic from 'next/dynamic'

const ResourceReader = dynamic(() => import('./ResourceReader').then(m => m.ResourceReader), {
  loading: () => <p role="status" className="px-5 py-8">Ouverture du document…</p>,
})

export function ResourceCatalog() {
  const [track,setTrack]=useState(''),[subject,setSubject]=useState(''),[type,setType]=useState(''),[q,setQ]=useState(''),[sort,setSort]=useState('desc')
  const [items,setItems]=useState<EducationalResource[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[selected,setSelected]=useState<EducationalResource|null>(null),[retry,setRetry]=useState(0)
  const [search, setSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setSearch(q.trim()), 150)
    return () => clearTimeout(timer)
  }, [q])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    const query = new URLSearchParams({ sort })
    if (track) query.set('track', track)
    if (subject) query.set('subject', subject)
    if (type) query.set('type', type)
    if (search) query.set('q', search)
    resourceRequest(`?${query}`, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setItems(result.resources) })
      .catch(error => { if (!controller.signal.aborted) setError(error.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [track, subject, type, search, sort, retry])
  if(selected)return <ResourceReader resource={selected} onBack={()=>setSelected(null)}/>
  return <section className="mx-auto max-w-[1440px] px-5 py-8 lg:px-8">
    <p className="ui-eyebrow">Bibliothèque pédagogique</p><h1 className="mt-2 text-3xl font-bold">Cours & travaux dirigés</h1><p className="ui-page-description">Les documents publiés par vos enseignants, à consulter directement ici.</p>
    <div className="glowing-card my-6 grid gap-4 rounded-2xl p-5 md:grid-cols-3 xl:grid-cols-5">
      <label className="text-sm">Filière / année<select aria-label="Filière / année" className="mt-2 w-full rounded-lg border bg-white p-2 dark:bg-slate-900" value={track} onChange={e=>setTrack(e.target.value)}><option value="">Tous les niveaux</option><option value="MPSI">MPSI · SUP</option><option value="MP">MP · SPE</option></select></label>
      <label className="text-sm">Matière<select aria-label="Matière" className="mt-2 w-full rounded-lg border bg-white p-2 dark:bg-slate-900" value={subject} onChange={e=>setSubject(e.target.value)}><option value="">Toutes les matières</option>{Object.entries(RESOURCE_SUBJECTS).map(([code,name])=><option key={code} value={code}>{name}</option>)}</select></label>
      <label className="text-sm">Type<select aria-label="Type de ressource" className="mt-2 w-full rounded-lg border bg-white p-2 dark:bg-slate-900" value={type} onChange={e=>setType(e.target.value)}><option value="">Cours et TD</option><option value="COURSE">Cours</option><option value="TD">TD</option></select></label>
      <label className="text-sm">Recherche par titre<div className="mt-2 flex items-center gap-2 rounded-lg border px-2"><Search size={16}/><input className="min-w-0 w-full bg-transparent py-2" maxLength={200} value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher…"/></div></label>
      <label className="text-sm">Date d’ajout<select className="mt-2 w-full rounded-lg border bg-white p-2 dark:bg-slate-900" value={sort} onChange={e=>setSort(e.target.value)}><option value="desc">Plus récentes</option><option value="asc">Plus anciennes</option></select></label>
    </div>
    {error?<p role="alert">{error} <button className="ui-button-secondary" onClick={()=>setRetry(v=>v+1)}>Réessayer</button></p>:loading?<p role="status">Chargement des ressources…</p>:<><p className="mb-4 text-sm text-slate-500" aria-live="polite">{items.length} ressource{items.length!==1?'s':''} disponible{items.length!==1?'s':''}</p>{!items.length?<div className="glowing-card rounded-2xl p-10 text-center"><BookOpen className="mx-auto mb-4 text-blue-500"/><h2 className="font-bold">Aucune ressource pour ces critères</h2><p className="mt-2 text-sm">Essayez une autre matière ou un autre niveau.</p></div>:<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{items.map(item=><article key={item.id} className="glowing-card flex flex-col rounded-3xl p-6"><div className="flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-lg bg-blue-500/15 px-3 py-2 text-blue-500">{item.track} · {item.level}</span><span className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-600">{item.type==='COURSE'?<BookOpen size={14}/>:<NotebookPen size={14}/>} {item.type==='COURSE'?'Cours':'TD'}</span><span className="flex items-center gap-1 px-2"><FileText size={14}/>{item.format}</span></div><h2 className="mt-5 text-xl font-bold">{item.title}</h2><p className="mt-2 text-sm text-blue-500">{RESOURCE_SUBJECTS[item.subject.code]}</p><p className="mb-5 mt-3 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">{item.description}</p><p className="mb-5 mt-auto text-xs text-slate-500">Ajouté le {new Date(item.createdAt).toLocaleDateString('fr-FR')} · {(item.bytes/1024/1024).toFixed(1)} Mo</p><button onClick={()=>setSelected(item)} className="ui-button-primary justify-center">Ouvrir {item.type==='COURSE'?'le cours':'le TD'} <ArrowRight size={17}/></button></article>)}</div>}</>}
  </section>
}
