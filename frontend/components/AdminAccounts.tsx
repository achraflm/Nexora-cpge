'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useSessionUser } from '@/components/SessionProvider'
import { AccountStatusDialog } from '@/components/AccountStatusDialog'
import { accountRequest } from '@/lib/accounts'
import { clearUserSession, type UserRole } from '@/lib/auth'

type Account = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  deactivatedAt: string | null
  student: { cpgeCenter: string; enrolledYear: 'SUP' | 'SPE'; filiere: string } | null
}
type AccountPage = { items: Account[]; total: number; pageSize: number }

const roles = { STUDENT: 'Étudiant', ADMIN: 'Administrateur' }
const fullName = (account: Account) => [account.firstName, account.lastName].join(' ')
const field = 'w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-slate-950'
const errorStyle = 'text-sm font-medium text-rose-600 dark:text-rose-300'

export function AdminAccounts() {
  const { id: adminId } = useSessionUser()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<AccountPage>()
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')
  const [editor, setEditor] = useState<{ account?: Account }>()
  const [pendingStatus, setPendingStatus] = useState<Account>()
  const [statusError, setStatusError] = useState('')
  const [changingStatus, setChangingStatus] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ page: String(page) })
    if (query) params.set('q', query)
    if (role) params.set('role', role)
    if (status) params.set('status', status)
    setResult(undefined)
    setLoadError('')
    accountRequest<AccountPage>('?' + params, 'GET', undefined, controller.signal).then(data => {
      if (controller.signal.aborted) return
      if (page > 1 && !data.items.length) setPage(page - 1)
      else setResult(data)
    }).catch(error => {
      if (!controller.signal.aborted) setLoadError(error.message)
    })
    return () => controller.abort()
  }, [query, role, status, page, version])

  function saved(message: string) {
    setNotice(message)
    setVersion(value => value + 1)
  }

  async function changeStatus() {
    if (!pendingStatus) return
    setChangingStatus(true)
    setStatusError('')
    const active = Boolean(pendingStatus.deactivatedAt)
    try {
      await accountRequest('/' + pendingStatus.id + '/status', 'PATCH', { active })
      if (!active && pendingStatus.id === adminId) {
        clearUserSession()
        window.location.assign('/login')
        return
      }
      setPendingStatus(undefined)
      saved(active ? 'Le compte a été réactivé.' : 'Le compte a été désactivé.')
    } catch (error) {
      setStatusError((error as Error).message)
    } finally {
      setChangingStatus(false)
    }
  }

  return <section aria-labelledby="accounts-title" className="space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h1 id="accounts-title" className="text-2xl font-bold">Gestion des comptes</h1>
      <button className="ui-button-primary" type="button" onClick={() => { setEditor({}); setNotice('') }}>Créer un compte</button>
    </header>
    {notice && <p role="status" className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{notice}</p>}
    {editor && <AccountEditor key={editor.account?.id ?? 'new'} account={editor.account}
      onCancel={() => setEditor(undefined)} onSaved={() => {
        saved(editor.account ? 'Le compte a été mis à jour.' : 'Le compte a été créé.')
        setEditor(undefined)
      }} />}
    <div className="glowing-card rounded-2xl p-4 sm:p-6">
      <form className="grid items-end gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
        onSubmit={event => { event.preventDefault(); setPage(1); setQuery(search.trim()); setVersion(value => value + 1) }}>
        <label className="grid gap-1 text-sm">Rechercher un compte
          <input type="search" value={search} maxLength={254} className={field} onChange={event => setSearch(event.target.value)} placeholder="Nom ou e-mail" />
        </label>
        <label className="grid gap-1 text-sm">Rôle
          <select className={field} value={role} onChange={event => { setRole(event.target.value); setPage(1) }}>
            <option value="">Tous</option>
            <option value="STUDENT">Étudiants</option>
            <option value="ADMIN">Administrateurs</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">Statut
          <select className={field} value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}>
            <option value="">Tous</option>
            <option value="active">Actifs</option>
            <option value="deactivated">Désactivés</option>
          </select>
        </label>
        <button type="submit" className="ui-button-secondary">Rechercher</button>
      </form>
      {loadError ? <p role="alert" className={errorStyle + ' mt-4'}>{loadError} <button type="button" className="underline" onClick={() => setVersion(value => value + 1)}>Réessayer</button></p>
        : !result ? <p role="status" className="mt-4 text-sm">Chargement des comptes…</p>
          : result.items.length === 0 ? <p className="mt-4 text-sm">Aucun compte trouvé.</p>
            : <ul aria-label="Comptes" className="mt-4 divide-y divide-slate-200 dark:divide-white/10">
              {result.items.map(account => <li key={account.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="break-words font-semibold">{fullName(account)} {account.id === adminId && <span className="text-xs text-slate-500 dark:text-slate-400">(vous)</span>}</p>
                  <p className="break-all text-sm text-slate-600 dark:text-slate-400">{account.email}</p>
                  <p className="mt-1 text-xs">{roles[account.role]}{account.student && ` · ${account.student.filiere} · ${account.student.enrolledYear === 'SUP' ? 'Sup' : 'Spé'}`}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={account.deactivatedAt ? 'rounded-lg bg-slate-500/15 px-2 py-1 text-xs' : 'rounded-lg bg-emerald-500/15 px-2 py-1 text-xs text-emerald-700 dark:text-emerald-300'}>
                    {account.deactivatedAt ? 'Désactivé' : 'Actif'}
                  </span>
                  <button type="button" className="ui-button-secondary" aria-label={'Modifier ' + fullName(account)} onClick={() => { setNotice(''); setEditor({ account }); window.scrollTo({ top: 0 }) }}>Modifier</button>
                  <button type="button" className="ui-button-secondary" onClick={() => { setStatusError(''); setPendingStatus(account) }}
                    aria-label={(account.deactivatedAt ? 'Réactiver ' : 'Désactiver ') + fullName(account)}>{account.deactivatedAt ? 'Réactiver' : 'Désactiver'}</button>
                </div>
              </li>)}
            </ul>}
      {result && (page > 1 || page * result.pageSize < result.total) && <nav aria-label="Pages des comptes" className="mt-4 flex items-center justify-between gap-2">
        <button type="button" className="ui-button-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Précédente</button>
        <span className="text-sm">Page {page}</span>
        <button type="button" className="ui-button-secondary" disabled={page * result.pageSize >= result.total} onClick={() => setPage(page + 1)}>Suivante</button>
      </nav>}
    </div>
    {pendingStatus && <AccountStatusDialog name={fullName(pendingStatus)} activate={Boolean(pendingStatus.deactivatedAt)}
      busy={changingStatus} error={statusError} onCancel={() => setPendingStatus(undefined)} onConfirm={() => { void changeStatus() }} />}
  </section>
}

function AccountEditor({ account, onSaved, onCancel }: { account?: Account; onSaved: () => void; onCancel: () => void }) {
  const [role, setRole] = useState<UserRole>(account?.role ?? 'STUDENT')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const identity = { firstName: data.get('firstName'), lastName: data.get('lastName'), email: data.get('email') }
    const student = role === 'STUDENT' ? { cpgeCenter: data.get('cpgeCenter'), enrolledYear: data.get('enrolledYear') } : {}
    const body = account ? { ...identity, ...student }
      : { ...identity, ...student, role, password: data.get('password'), ...(role === 'STUDENT' ? { filiere: 'MP' } : {}) }
    setSaving(true)
    setError('')
    try {
      await accountRequest(account ? '/' + account.id : '', account ? 'PATCH' : 'POST', body)
      onSaved()
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return <form aria-label={account ? 'Modifier le compte' : 'Nouveau compte'} className="glowing-card grid gap-4 rounded-2xl p-4 sm:p-6" onSubmit={save} autoComplete="off">
    <h2 className="text-lg font-bold">{account ? 'Modifier ' + fullName(account) : 'Nouveau compte'}</h2>
    {error && <p role="alert" className={errorStyle}>{error}</p>}
    <fieldset disabled={saving} className="grid min-w-0 gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-sm">Prénom
        <input className={field} name="firstName" required maxLength={80} defaultValue={account?.firstName} />
      </label>
      <label className="grid gap-1 text-sm">Nom
        <input className={field} name="lastName" required maxLength={80} defaultValue={account?.lastName} />
      </label>
      <label className="grid gap-1 text-sm">E-mail
        <input type="email" className={field} name="email" required maxLength={254} defaultValue={account?.email} />
      </label>
      {account ? <p className="self-end py-2 text-sm">{roles[account.role]}</p> : <>
        <label className="grid gap-1 text-sm">Rôle du compte
          <select className={field} value={role} onChange={event => setRole(event.target.value === 'ADMIN' ? 'ADMIN' : 'STUDENT')}>
            <option value="STUDENT">Étudiant</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">Mot de passe initial
          <input type="password" className={field} name="password" required minLength={8} maxLength={72} autoComplete="new-password" />
        </label>
      </>}
      {role === 'STUDENT' && <>
        <label className="grid gap-1 text-sm">Centre CPGE
          <input className={field} name="cpgeCenter" required minLength={2} maxLength={160} defaultValue={account?.student?.cpgeCenter} />
        </label>
        <label className="grid gap-1 text-sm">Année
          <select className={field} name="enrolledYear" defaultValue={account?.student?.enrolledYear ?? 'SUP'}>
            <option value="SUP">1re année Sup</option>
            <option value="SPE">2e année Spé</option>
          </select>
        </label>
      </>}
    </fieldset>
    <div className="flex flex-wrap gap-2">
      <button type="submit" className="ui-button-primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer le compte'}</button>
      <button type="button" className="ui-button-secondary" disabled={saving} onClick={onCancel}>Annuler</button>
    </div>
  </form>
}
