'use client'

import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, LockKeyhole } from 'lucide-react'
import { authenticateBrowser, type UserProfile, type UserRole } from '@/lib/auth'
import { NexoraLogo } from './NexoraLogo'

export function LoginPage({ onLoginSuccess, onNavigateToSignUp }: {
  onLoginSuccess?: (role: UserRole, user: UserProfile) => void
  onNavigateToSignUp?: () => void
  onBackToApp?: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError('')
    try {
      const user = await authenticateBrowser('login', { email, password, rememberMe })
      if (onLoginSuccess) onLoginSuccess(user.role, user)
      else window.location.assign(user.role === 'ADMIN' ? '/admin' : '/')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Connexion impossible.')
    } finally { setPending(false) }
  }

  return <main className="relative flex min-h-screen items-center justify-center px-5 py-12 text-white">
    <section className="w-full max-w-md rounded-3xl border border-blue-400/20 bg-slate-950/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
      <div className="mb-10 flex items-center gap-3"><NexoraLogo /><span className="text-2xl font-bold">Nexora</span></div>
      <h1 className="text-3xl font-bold tracking-tight">Heureux de vous retrouver</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">Connectez-vous pour retrouver vos cours et suivre votre préparation au CNC.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
        <div><label htmlFor="login-email" className="mb-2 block text-sm font-medium">Adresse e-mail</label><input id="login-email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" /></div>
        <div><label htmlFor="login-password" className="mb-2 block text-sm font-medium">Mot de passe</label><div className="relative"><input id="login-password" type={visible ? 'text' : 'password'} autoComplete="current-password" required maxLength={72} value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 pr-12 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" /><button type="button" aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} onClick={() => setVisible(!visible)} className="absolute right-3 top-3.5 text-slate-400">{visible ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></div>
        <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)} className="accent-blue-500" />Rester connecté sur cet appareil</label>
        <button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:opacity-50">{pending ? 'Connexion en cours…' : 'Se connecter'}<ArrowRight size={18} /></button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">Première visite ? <button onClick={() => onNavigateToSignUp ? onNavigateToSignUp() : window.location.assign('/signup')} className="font-semibold text-blue-300 hover:underline">Créer un compte</button></p>
      <p className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500"><LockKeyhole size={14} />Votre espace personnel de préparation</p>
    </section>
  </main>
}
