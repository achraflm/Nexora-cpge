'use client'
import { useEffect,useState,type FormEvent } from 'react'
import { BookOpen,Plus,Upload,FileText,Pencil,Trash2,Eye,RefreshCw } from 'lucide-react'
import { RESOURCE_SUBJECTS,resourceRequest,type EducationalResource } from '@/lib/educational-resources'
import { ResourceReader } from './ResourceReader'
import { CoursePdfReader } from './CoursePdfReader'
import type { CourseDocument } from '@/lib/pdf-course-chapters'

const blank={title:'',description:'',track:'MPSI',subject:'MATH',type:'COURSE',status:'DRAFT',allowDownload:true}
export function ResourceAdmin(){
  const [items,setItems]=useState<EducationalResource[]>([]),[form,setForm]=useState(blank),[editing,setEditing]=useState<EducationalResource|null>(null),[open,setOpen]=useState(false)
  const [detected,setDetected]=useState(''),[inspecting,setInspecting]=useState(false)
  const [file,setFile]=useState<File|null>(null),[companions,setCompanions]=useState<File[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[reader,setReader]=useState<EducationalResource|null>(null),[preview,setPreview]=useState(''),[previewOpen,setPreviewOpen]=useState(false),[step,setStep]=useState(1)
  const refresh=()=>resourceRequest().then(r=>setItems(r.resources)).catch(e=>setError(e.message))
  useEffect(()=>{void refresh()},[])
  useEffect(()=>{if(!items.some(r=>['PENDING','PROCESSING'].includes(r.conversion)))return;const timer=setInterval(refresh,3000);return()=>clearInterval(timer)},[items])
  useEffect(()=>{if(!file || !file.name.toLowerCase().endsWith('.pdf')){setPreview('');return}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url)},[file])
  useEffect(()=>{
    setDetected('');if(!file){setInspecting(false);return}
    if(file.size>20*1024*1024){setError('Document limité à 20 Mo.');return}
    const controller=new AbortController();setInspecting(true);setError('')
    const body=new FormData();body.set('file',file)
    resourceRequest('/inspect',{method:'POST',body,signal:controller.signal}).then(result=>setDetected(result.format)).catch(e=>{if(!controller.signal.aborted)setError(e.message)}).finally(()=>{if(!controller.signal.aborted)setInspecting(false)})
    return()=>controller.abort()
  },[file])
  const metadata=(value= form)=>({...value,level:value.track==='MPSI'?'SUP':'SPE'})
  const start=(item?:EducationalResource)=>{setEditing(item||null);setForm(item?{title:item.title,description:item.description,track:item.track,subject:item.subject.code,type:item.type,status:item.status,allowDownload:item.allowDownload}:blank);setFile(null);setCompanions([]);setError('');setMessage('');setStep(1);setOpen(true)}
  async function save(event:FormEvent){
    event.preventDefault();setError('');setMessage('');setBusy(true)
    try{
      if(!editing && !file)throw new Error('Sélectionnez un fichier.')
      if((file?.size || 0)+companions.reduce((s,f)=>s+f.size,0)>20*1024*1024)throw new Error('La taille totale dépasse 20 Mo.')
      if(editing){
        // Replace first: a rejected file must never publish changed metadata.
        if(file){const body=new FormData();body.set('file',file);companions.forEach(f=>body.append('companions',f));await resourceRequest(`/${editing.id}/file`,{method:'PUT',body})}
        await resourceRequest(`/${editing.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(metadata())})
      }else{const body=new FormData();body.set('metadata',JSON.stringify(metadata()));body.set('file',file!);companions.forEach(f=>body.append('companions',f));await resourceRequest('',{method:'POST',body})}
      setOpen(false);setMessage('Ressource enregistrée. Le format a été vérifié par le serveur.');await refresh()
    }catch(e){setError(e instanceof Error?e.message:'Import impossible.')}finally{setBusy(false)}
  }
  async function action(item:EducationalResource,kind:'publish'|'delete'|'retry'){
    if(kind==='delete' && !window.confirm(`Supprimer « ${item.title} » du catalogue ?`))return
    setBusy(true);setError('');setMessage('')
    try{
      if(kind==='delete')await resourceRequest(`/${item.id}`,{method:'DELETE'})
      else if(kind==='retry')await resourceRequest(`/${item.id}/retry`,{method:'POST'})
      else await resourceRequest(`/${item.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:item.title,description:item.description,track:item.track,level:item.level,subject:item.subject.code,type:item.type,status:item.status==='PUBLISHED'?'DRAFT':'PUBLISHED',allowDownload:item.allowDownload})})
      await refresh();setMessage('Modification enregistrée.')
    }catch(e){setError(e instanceof Error?e.message:'Modification impossible.')}finally{setBusy(false)}
  }
  if(reader)return <ResourceReader resource={reader} onBack={()=>setReader(null)}/>
  if(previewOpen && preview)return <CoursePdfReader document={{title:form.title || file?.name,localPdfUrl:preview,type:form.type,level:form.track==='MPSI'?'SUP':'SPE',sourceName:'Aperçu local avant importation'} as CourseDocument} onBack={()=>setPreviewOpen(false)}/>
  const field='mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-white/15 dark:bg-slate-900'
  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="ui-eyebrow">Administration · bibliothèque</p><h1 className="mt-2 flex items-center gap-2 text-2xl font-bold"><BookOpen className="text-blue-500"/>Cours & travaux dirigés</h1><p className="mt-2 text-sm text-slate-500">MPSI / SUP et MP / SPE · PDF, Word, PowerPoint et LaTeX</p></div><button className="ui-button-primary" onClick={()=>start()}><Plus size={18}/>Importer une ressource</button></div>
    {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">{error}</p>}{message && <p role="status" className="rounded-xl bg-emerald-500/10 p-4 text-emerald-600">{message}</p>}
    {open && <form onSubmit={save} className="glowing-card space-y-5 rounded-2xl p-6">
      <div className="flex justify-between gap-3"><h2 className="font-bold">{editing?'Modifier la ressource':'Nouvelle ressource'} · Étape {step}/2</h2><button type="button" disabled={busy} onClick={()=>setOpen(false)}>Annuler</button></div>
      {step===1?<><div className="grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2">Titre<input required maxLength={200} className={field} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label className="sm:col-span-2">Description (facultative)<textarea maxLength={4000} className={field} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Filière<select className={field} value={form.track} onChange={e=>setForm({...form,track:e.target.value})}><option>MPSI</option><option>MP</option></select></label><label>Année<input className={field} readOnly value={form.track==='MPSI'?'SUP — première année':'SPE — deuxième année'}/></label><label>Matière<select className={field} value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}>{Object.entries(RESOURCE_SUBJECTS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><label>Type pédagogique<select className={field} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="COURSE">Cours</option><option value="TD">TD</option></select></label></div><button type="button" className="ui-button-primary" disabled={!form.title.trim()} onClick={()=>setStep(2)}>Continuer vers le document</button></>:<>
      <p className="text-sm">{form.title} · {form.track} / {metadata().level} · {RESOURCE_SUBJECTS[form.subject as keyof typeof RESOURCE_SUBJECTS]} · {form.type==='TD'?'TD':'Cours'}</p>
      <label className="block rounded-2xl border-2 border-dashed border-blue-500/30 p-6"><Upload className="mb-3 text-blue-500"/>{editing?'Remplacer le document (facultatif)':'Document principal'}<input aria-label="Document principal" className="mt-4 block w-full text-sm" type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.tex" onChange={e=>{setFile(e.target.files?.[0] || null);setCompanions([])}}/></label>
      {file?<div className="rounded-xl bg-blue-500/10 p-4 text-sm"><p>{file.name} · {(file.size/1024/1024).toFixed(2)} Mo</p><p className="mt-2">{inspecting ? "Vérification du contenu…" : detected ? `Format détecté : ${detected}` : "Ce fichier n’a pas été validé."}</p>{preview && <button type="button" className="ui-button-secondary mt-3" onClick={()=>setPreviewOpen(true)}>Aperçu du PDF</button>}</div>:editing && <p>Document actuel : {editing.originalName} · format détecté {editing.format}</p>}
      {file?.name.toLowerCase().endsWith('.tex') && <label className="block">Fichiers complémentaires LaTeX<input className="mt-3 block w-full" type="file" multiple accept=".png,.jpg,.jpeg,.pdf,.bib,.sty,.cls,.tex" onChange={e=>setCompanions(Array.from(e.target.files || []))}/><span className="mt-2 block text-xs text-slate-500">10 fichiers maximum, sans sous-dossiers. Référencez leurs noms dans le document. Total de l’import : 20 Mo maximum.</span></label>}
      <label className="block">Publication<select className={field} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="DRAFT">Conserver en brouillon</option><option value="PUBLISHED">Publier pour les étudiants</option></select></label><label className="flex items-center gap-3"><input type="checkbox" checked={form.allowDownload} onChange={e=>setForm({...form,allowDownload:e.target.checked})}/>Autoriser le téléchargement</label>
      <div className="flex flex-wrap gap-3"><button type="button" className="ui-button-secondary" onClick={()=>setStep(1)}>Informations pédagogiques</button><button disabled={busy || inspecting || (!!file && !detected) || (!editing && !file)} className="ui-button-primary">{busy?'Enregistrement…':'Enregistrer la ressource'}</button></div></>}
    </form>}
    <p className="text-sm text-slate-500">{items.length} ressources · Les brouillons sont visibles uniquement par l’administration.</p>
    {!items.length && <div className="glowing-card rounded-2xl p-10 text-center">Importez votre premier cours ou TD pour alimenter le catalogue.</div>}
    <div className="grid gap-5 xl:grid-cols-2">{items.map(item=><article key={item.id} className="glowing-card rounded-2xl p-6"><div className="flex flex-wrap gap-2 text-xs"><span className="rounded-lg bg-blue-500/10 px-2 py-1">{item.track} · {item.level} · {item.type==='TD'?'TD':'Cours'}</span><span className="rounded-lg bg-amber-500/10 px-2 py-1">{item.status==='DRAFT'?'Brouillon':'Publié'}</span></div><h2 className="mt-4 text-lg font-bold">{item.title}</h2><p className="mt-1 text-sm text-slate-500">{RESOURCE_SUBJECTS[item.subject.code]}</p><p className="mt-3 flex items-center gap-2 text-sm"><FileText size={16}/>{item.format} · {(item.bytes/1024/1024).toFixed(2)} Mo · {new Date(item.createdAt).toLocaleDateString('fr-FR')}</p><p className="mt-2 text-xs text-slate-500 break-all">Importé par : {item.importedBy}</p><p className="my-4 text-sm" role="status">{item.conversion==='READY'?'Prêt à consulter':item.conversion==='FAILED'?item.conversionError:'Conversion en cours…'}</p><div className="flex flex-wrap gap-2"><button className="ui-button-secondary" onClick={()=>setReader(item)}><Eye size={16}/>Consulter</button><button disabled={busy} className="ui-button-secondary" onClick={()=>start(item)}><Pencil size={16}/>Modifier</button><button disabled={busy} className="ui-button-secondary" onClick={()=>action(item,'publish')}>{item.status==='DRAFT'?'Publier':'Dépublier'}</button>{item.conversion==='FAILED' && <button disabled={busy} className="ui-button-secondary" onClick={()=>action(item,'retry')}><RefreshCw size={16}/>Relancer</button>}<button disabled={busy} className="ui-button-secondary" onClick={()=>action(item,'delete')}><Trash2 size={16}/>Supprimer</button><a className="ui-button-secondary" href={`/api/resources/${item.id}/file?original=1`}>Source originale</a></div></article>)}</div>
  </section>
}
