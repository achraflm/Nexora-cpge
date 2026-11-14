'use client'

import { useState } from 'react'
import { authenticateBrowser, CPGE_CENTERS, type UserProfile } from '@/lib/auth'
import { NexoraLogo } from './NexoraLogo'

export function SignUpPage({ onSignUpSuccess, onNavigateToLogin }: { onSignUpSuccess?: (user: UserProfile) => void; onNavigateToLogin?: () => void }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const field = 'w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20'
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const values = Object.fromEntries(new FormData(event.currentTarget).entries())
    if (new TextEncoder().encode(String(values.password)).length > 72) { setError('Le mot de passe doit contenir au maximum 72 octets UTF-8.'); return }
    setPending(true)
    setError('')
    try {
      const user = await authenticateBrowser('register', values)
      if (onSignUpSuccess) onSignUpSuccess(user)
      else window.location.assign('/')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Inscription impossible.') }
    finally { setPending(false) }
  }
  return <main className="relative flex min-h-screen items-center justify-center px-5 py-12 text-white">
    <section className="w-full max-w-xl rounded-3xl border border-blue-400/20 bg-slate-950/90 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-7 flex items-center gap-3"><NexoraLogo /><span className="text-2xl font-bold">Nexora</span></div>
      <h1 className="text-3xl font-bold">Votre préparation commence ici</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">Créez votre profil CPGE. Les cours de Sup et de Spé sont accessibles à tous les étudiants.</p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">{[['firstName', 'Prénom', 'given-name'], ['lastName', 'Nom', 'family-name']].map(([name, label, autoComplete]) => <label key={name} className="space-y-2 text-sm"><span>{label}</span><input className={field} name={name} autoComplete={autoComplete} required maxLength={80} /></label>)}</div>
        <label className="block space-y-2 text-sm"><span>Adresse e-mail</span><input name="email" type="email" autoComplete="username" required maxLength={254} className={field} /></label>
        <label className="block space-y-2 text-sm"><span>Mot de passe</span><input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} aria-describedby="password-help" className={field} /><span id="password-help" className="block text-xs text-slate-400">Au moins 8 caractères, au maximum 72 octets UTF-8.</span></label>
        <label className="block space-y-2 text-sm"><span>Centre CPGE</span><input name="cpgeCenter" list="cpge-centers" required minLength={2} maxLength={160} className={field} /><datalist id="cpge-centers">{CPGE_CENTERS.map(center => <option key={center} value={center} />)}</datalist></label>
        <div className="grid grid-cols-2 gap-4"><label className="space-y-2 text-sm"><span>Filière</span><select name="filiere" className={field}><option>MP</option><option>PSI</option><option>TSI</option></select></label><label className="space-y-2 text-sm"><span>Niveau actuel</span><select name="enrolledYear" className={field}><option value="SUP">1re année Sup</option><option value="SPE">2e année Spé</option></select></label></div>
        <button disabled={pending} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:opacity-50">{pending ? 'Création du compte…' : 'Créer mon compte'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">Déjà inscrit ? <button onClick={() => onNavigateToLogin ? onNavigateToLogin() : window.location.assign('/login')} className="font-semibold text-blue-300 hover:underline">Se connecter</button></p>
    </section>
  </main>
}
