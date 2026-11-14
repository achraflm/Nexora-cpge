'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, MessageSquare, Plus, Send } from 'lucide-react'

const categories = {
  ERRATUM: 'Erratum', PEDAGOGICAL_QUESTION: 'Question pédagogique',
  TECHNICAL_ISSUE: 'Problème technique', BOOK_SUGGESTION: 'Suggestion d’ouvrage',
}
const statuses = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', RESOLVED: 'Résolu' }
type Category = keyof typeof categories
type Status = keyof typeof statuses
type Person = { id: string; name: string }
type Ticket = {
  id: string; userId: string; title: string; category: Category; status: Status;
  targetEntityRef?: string; createdAt: string; updatedAt: string; resolvedAt?: string;
  messages?: { content: string }[]; _count?: { messages: number };
}
type Message = { id: string; senderId: string; senderRole: 'STUDENT' | 'ADMIN'; content: string; createdAt: string; readAt: string | null }
type Thread = { before: string | null; messages: Message[] }
type Statistics = { counts: Record<Status, number>; recent: Pick<Ticket, 'id' | 'title' | 'createdAt'>[] }
type Tickets = { items: Ticket[]; count: number; pageSize: number }
export type ResourceReference = { ref: string; title: string }
const field = 'min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-slate-950/60'
const date = (value: string) => new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
const publishedDocument = /^RES-([a-f0-9-]{36})$/i

async function request<T>(path: string, method = 'GET', data?: object, signal?: AbortSignal): Promise<T> {
  const response = await fetch('/api/contact/' + path, {
    method, signal, headers: { 'Content-Type': 'application/json' }, body: data && JSON.stringify(data),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Impossible de traiter la demande.')
  return result
}

function useRefresh<T>(path: string | null, version: number, onData: (data: T) => void, onError: (message: string) => void) {
  useEffect(() => {
    if (!path) return
    const controller = new AbortController()
    let active = false
    async function refresh() {
      if (active || document.hidden || !path) return
      active = true
      try {
        const result = await request<T>(path, 'GET', undefined, controller.signal)
        if (!controller.signal.aborted) onData(result)
      } catch (error) {
        if (!controller.signal.aborted) onError((error as Error).message)
      } finally { active = false }
    }
    void refresh()
    const timer = window.setInterval(refresh, 8000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      controller.abort()
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
    // The callbacks are stable state setters or use only the current request key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, version])
}

export function TicketInbox({ admin = false, reference }: { admin?: boolean; reference?: ResourceReference }) {
  const [items, setItems] = useState<Tickets>()
  const [stats, setStats] = useState<Statistics>()
  const [notice, setNotice] = useState(0)
  const [people, setPeople] = useState<Person[]>([])
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [student, setStudent] = useState('')
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [selected, setSelected] = useState<string>()
  const [creating, setCreating] = useState(Boolean(reference))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const base = admin ? 'admin/tickets' : 'tickets'
  const params = new URLSearchParams({ page: String(page) })
  if (category) params.set('category', category)
  if (status) params.set('status', status)
  if (filterDate) params.set('date', filterDate)
  if (search) params.set('q', search)
  if (student) params.set('studentId', student)
  const refresh = () => setVersion(value => value + 1)
  const name = (id: string) => people.find(person => person.id === id)?.name || id

  useRefresh<Tickets>((admin ? base : base + '/mine') + '?' + params, version, setItems, setError)
  useRefresh<Statistics>(admin ? base + '/statistics' : null, version, setStats, setError)
  useRefresh<{ unread: number }>(admin ? null : 'notifications', version, data => setNotice(data.unread), setError)
  useEffect(() => {
    if (!admin) return
    const controller = new AbortController()
    request<Person[]>('admin/directory', 'GET', undefined, controller.signal)
      .then(setPeople).catch(error => { if (!controller.signal.aborted) setError(error.message) })
    return () => controller.abort()
  }, [admin])

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    setError('')
    setPending(true)
    try {
      const linked = String(fields.get('ref') || '').trim()
      const ticket = await request<{ id: string }>('tickets', 'POST', {
        title: fields.get('title'), description: fields.get('description'),
        category: fields.get('category'), targetEntityRef: linked || undefined,
      })
      setCreating(false)
      setSelected(ticket.id)
      refresh()
    } catch (error) { setError((error as Error).message) }
    finally { setPending(false) }
  }

  return <section className="mx-auto max-w-[1440px] space-y-5 px-5 py-7 lg:px-8">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="ui-eyebrow">Contact administration</p>
        <h1 className="mt-2 text-3xl font-bold">{admin ? 'Gestion des demandes' : 'Mes demandes'}</h1>
        {!admin && notice > 0 && <p aria-live="polite" className="mt-1 text-sm text-blue-500">{notice} réponse{notice > 1 ? 's' : ''} non lue{notice > 1 ? 's' : ''}</p>}
      </div>
      {!admin && <button className="ui-button-primary" onClick={() => { setCreating(true); setSelected(undefined) }}><Plus size={17} /> Nouvelle demande</button>}
    </header>
    {error && <p role="alert" className="text-sm text-red-500">{error} <button className="underline" onClick={() => { setError(''); refresh() }}>Réessayer</button></p>}
    {stats && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="glowing-card rounded-xl p-4">Total <strong className="block text-2xl">{Object.values(stats.counts).reduce((a, b) => a + b, 0)}</strong></div>
      {(Object.keys(statuses) as Status[]).map(key => <div key={key} className="glowing-card rounded-xl p-4">{statuses[key]} <strong className="block text-2xl">{stats.counts[key]}</strong></div>)}
    </div>}
    {stats && stats.recent.length > 0 && <div className="flex flex-wrap items-center gap-2 text-xs">
      <strong>Reçues récemment</strong>
      {stats.recent.map(ticket => <button key={ticket.id} className="rounded-lg bg-blue-500/10 px-3 py-2 text-blue-500" onClick={() => setSelected(ticket.id)}>{ticket.title}</button>)}
    </div>}
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className={`glowing-card min-w-0 rounded-2xl p-4 ${selected || creating ? 'hidden lg:block' : ''}`}>
        <form className="grid grid-cols-2 gap-2" onSubmit={event => { event.preventDefault(); setSearch(query.trim()); setPage(1) }}>
          <input className={field + ' col-span-2'} aria-label="Rechercher une demande" placeholder="Titre, référence ou identifiant" value={query} onChange={event => setQuery(event.target.value)} />
          <select className={field} aria-label="Filtrer par statut" value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}>
            <option value="">Tous les statuts</option>{Object.entries(statuses).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          <select className={field} aria-label="Filtrer par catégorie" value={category} onChange={event => { setCategory(event.target.value); setPage(1) }}>
            <option value="">Toutes les catégories</option>{Object.entries(categories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          {admin && <>
            <input type="date" className={field} aria-label="Date de création" value={filterDate} onChange={event => { setFilterDate(event.target.value); setPage(1) }} />
            <select className={field} aria-label="Filtrer par étudiant" value={student} onChange={event => { setStudent(event.target.value); setPage(1) }}>
              <option value="">Tous les étudiants</option>{people.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
          </>}
          <button className="ui-button-secondary col-span-2" type="submit">Rechercher</button>
        </form>
        {!items ? <p className="mt-4 text-sm" role="status">Chargement des demandes…</p>
          : !items.items.length ? <p className="mt-4 text-sm text-slate-500">Aucune demande trouvée.</p>
          : <ul className="mt-4 space-y-2">{items.items.map(ticket => <li key={ticket.id}>
            <button aria-pressed={selected === ticket.id} className="w-full rounded-xl border border-slate-200 p-3 text-left hover:bg-blue-500/10 aria-pressed:bg-blue-500/15 dark:border-white/10" onClick={() => { setSelected(ticket.id); setCreating(false) }}>
              <span className="flex flex-wrap items-center justify-between gap-2"><strong className="break-all">{ticket.title}</strong><span className="rounded bg-blue-500/10 px-2 py-1 text-xs text-blue-500">{statuses[ticket.status]}</span></span>
              {admin && <span className="mt-1 block break-all text-xs">{name(ticket.userId)} · {ticket.id}</span>}
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{categories[ticket.category]} · {date(ticket.createdAt)}</span>
              {admin && <span className="block text-xs text-slate-500 dark:text-slate-400">Activité · {date(ticket.updatedAt)}</span>}
              <span className="mt-1 block truncate text-sm">{ticket.messages?.[0]?.content}</span>
              {!!ticket._count?.messages && <span className="text-xs font-semibold text-blue-500">{ticket._count.messages} non lu(s)</span>}
            </button>
          </li>)}</ul>}
        {items && (page > 1 || page * items.pageSize < items.count) && <nav aria-label="Pages des demandes" className="mt-4 flex items-center justify-between gap-2">
          <button className="ui-button-secondary disabled:opacity-40" disabled={page === 1} onClick={() => setPage(page - 1)}>Précédente</button>
          <span className="text-xs">{page}</span>
          <button className="ui-button-secondary disabled:opacity-40" disabled={page * items.pageSize >= items.count} onClick={() => setPage(page + 1)}>Suivante</button>
        </nav>}
      </div>
      {creating ? <form onSubmit={createTicket} className="glowing-card grid gap-3 rounded-2xl p-5">
        <button type="button" className="ui-button-secondary justify-self-start" onClick={() => setCreating(false)}><ArrowLeft size={16} /> Mes demandes</button>
        <h2 className="text-xl font-bold">Nouvelle demande</h2>
        {reference && <p className="text-sm">Ressource concernée · <strong>{reference.title}</strong></p>}
        <label className="grid gap-1 text-sm">Titre<input name="title" className={field} required minLength={3} maxLength={160} /></label>
        <label className="grid gap-1 text-sm">Catégorie<select name="category" className={field} defaultValue={reference ? 'ERRATUM' : 'PEDAGOGICAL_QUESTION'}>
          {Object.entries(categories).map(([id, label]) => <option value={id} key={id}>{label}</option>)}
        </select></label>
        <label className="grid gap-1 text-sm">Référence de la ressource<input name="ref" defaultValue={reference?.ref} className={field} maxLength={180} /></label>
        <label className="grid gap-1 text-sm">Description<textarea name="description" className={field} required rows={5} maxLength={6000} /></label>
        <button className="ui-button-primary justify-self-start disabled:opacity-40" disabled={pending} type="submit"><Send size={16} /> Envoyer la demande</button>
      </form> : selected ? <Conversation key={selected} path={base + '/' + selected} admin={admin} people={people} onBack={() => setSelected(undefined)} onChange={refresh} />
        : <div className="glowing-card hidden rounded-2xl p-8 text-slate-500 lg:block"><MessageSquare className="mb-3 text-blue-500" />Sélectionnez une demande pour ouvrir la conversation.</div>}
    </div>
  </section>
}

function Conversation({ path, admin, people, onBack, onChange }: { path: string; admin: boolean; people: Person[]; onBack: () => void; onChange: () => void }) {
  const [ticket, setTicket] = useState<Ticket>()
  const [thread, setThread] = useState<Thread>()
  const [older, setOlder] = useState<Thread>()
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [version, setVersion] = useState(0)
  const role = admin ? 'ADMIN' : 'STUDENT'
  useRefresh<Ticket>(path, version, setTicket, setError)
  useRefresh<Thread>(path + '/messages', version, setThread, setError)
  const through = thread?.messages.at(-1)?.id
  const unread = thread?.messages.some(message => message.senderRole !== role && !message.readAt)
  useEffect(() => {
    if (!through || !unread) return
    request(path + '/read', 'PATCH', { through }).then(onChange).catch(error => setError(error.message))
    // Mark only messages already delivered to this view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, through, unread])

  async function action(work: () => Promise<unknown>) {
    setBusy(true)
    setError('')
    try {
      await work()
      setVersion(value => value + 1)
      onChange()
    } catch (error) { setError((error as Error).message) }
    finally { setBusy(false) }
  }

  const previous = older ? older.before : thread?.before
  const messages = [...new Map([...(older?.messages || []), ...(thread?.messages || [])].map(message => [message.id, message])).values()]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
  const next = ticket?.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED'
  return <article className="glowing-card min-w-0 rounded-2xl p-5" aria-label="Conversation">
    <button className="ui-button-secondary mb-3" onClick={onBack}><ArrowLeft size={16} /> Toutes les demandes</button>
    {error && <p role="alert" className="mb-3 text-sm text-red-500">{error}</p>}
    {!ticket ? <p role="status">Chargement de la conversation…</p> : <>
      <h2 className="break-all text-xl font-bold">{ticket.title}</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{categories[ticket.category]} · {statuses[ticket.status]} · {date(ticket.createdAt)}</p>
      {admin && <p className="mt-2 break-all text-sm">Étudiant · {people.find(person => person.id === ticket.userId)?.name || ticket.userId}</p>}
      {ticket.targetEntityRef && <p className="mt-2 break-all text-sm">
        Ressource · <strong>{ticket.targetEntityRef}</strong>{' '}
        {publishedDocument.test(ticket.targetEntityRef) &&
          <a className="text-blue-500 underline" href={`/api/resources/${ticket.targetEntityRef.slice(4)}/file`} target="_blank" rel="noreferrer">Ouvrir le document</a>}
        {ticket.targetEntityRef.startsWith('https://elearning-cpge.com/') &&
          <a className="text-blue-500 underline" href={ticket.targetEntityRef} target="_blank" rel="noreferrer">Ouvrir la leçon</a>}
      </p>}
      {ticket.resolvedAt && <p className="mt-2 text-sm">Résolu le {date(ticket.resolvedAt)}</p>}
      {admin && ticket.status !== 'RESOLVED' && <button className="ui-button-secondary mt-3" disabled={busy} onClick={() => void action(() => request(path + '/status', 'PATCH', { status: next }))}>{next === 'IN_PROGRESS' ? 'Prendre en charge' : 'Résoudre la demande'}</button>}
      {!thread && <p className="mt-4 text-sm" role="status">Chargement des messages…</p>}
      {previous && <button className="ui-button-secondary mt-4" disabled={busy} onClick={() => void action(async () => {
        const result = await request<Thread>(path + '/messages?before=' + previous)
        setOlder({ before: result.before, messages: [...result.messages, ...(older?.messages || [])] })
      })}>Messages précédents</button>}
      <ol className="my-4 grid gap-3" aria-live="polite">
        {messages.map(message => <li key={message.id} className={`max-w-[90%] rounded-2xl px-4 py-3 ${message.senderRole === role ? 'justify-self-end bg-blue-500/15' : 'justify-self-start bg-slate-500/10'}`}>
          <p className="text-xs font-semibold text-blue-500">{message.senderRole === role ? 'Vous' : people.find(person => person.id === message.senderId)?.name || (message.senderRole === 'ADMIN' ? 'Administration' : 'Étudiant')}</p>
          <p className="my-1 whitespace-pre-wrap break-words text-sm [overflow-wrap:anywhere]">{message.content}</p>
          <time className="text-xs text-slate-500 dark:text-slate-400" dateTime={message.createdAt}>{date(message.createdAt)}</time>
        </li>)}
      </ol>
      {ticket.status !== 'RESOLVED' && <form className="grid gap-2" onSubmit={event => {
        event.preventDefault()
        void action(async () => { await request(path + '/messages', 'POST', { text }); setText('') })
      }}>
        <textarea className={field} aria-label="Votre réponse" placeholder="Écrire une réponse…" rows={3} required maxLength={6000} value={text} onChange={event => setText(event.target.value)} />
        <button type="submit" disabled={busy || !text.trim()} className="ui-button-primary justify-self-end disabled:opacity-40"><Send size={16} /> Répondre</button>
      </form>}
    </>}
  </article>
}
