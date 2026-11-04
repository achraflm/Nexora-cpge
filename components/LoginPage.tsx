'use client'

import { useState } from 'react'
import {
  EnvelopeSimple,
  LockSimple,
  Eye,
  EyeSlash,
  ArrowRight,
  ArrowLeft,
  Sparkle,
  ShieldCheck,
  GraduationCap,
  Lightning,
} from '@phosphor-icons/react'
import { DEMO_ADMIN, DEMO_STUDENT, UserProfile, UserRole, saveUserSession } from '@/lib/auth'

export function LoginPage({
  onLoginSuccess,
  onBackToApp,
  onNavigateToSignUp,
}: {
  onLoginSuccess?: (role: UserRole, user: UserProfile) => void
  onBackToApp?: () => void
  onNavigateToSignUp?: () => void
}) {
  const [email, setEmail] = useState('achraf.lemrani@cpge-cnc.ma')
  const [password, setPassword] = useState('StudentPassword2026!')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const processLogin = (userToLogin: UserProfile) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      saveUserSession(userToLogin)
      if (onLoginSuccess) {
        onLoginSuccess(userToLogin.role, userToLogin)
      } else {
        if (userToLogin.role === 'ADMIN') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/'
        }
      }
    }, 600)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.')
      return
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (trimmedEmail === DEMO_ADMIN.email.toLowerCase()) {
      processLogin(DEMO_ADMIN)
    } else {
      const studentUser: UserProfile = {
        ...DEMO_STUDENT,
        email: trimmedEmail,
      }
      processLogin(studentUser)
    }
  }

  const handleDemoStudent = () => {
    setEmail(DEMO_STUDENT.email)
    setPassword('StudentPassword2026!')
    processLogin(DEMO_STUDENT)
  }

  const handleDemoAdmin = () => {
    setEmail(DEMO_ADMIN.email)
    setPassword('AdminPassword2026!')
    processLogin(DEMO_ADMIN)
  }

  const handleGoogleSignIn = () => {
    processLogin(DEMO_STUDENT)
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-transparent px-4 py-12 text-slate-100 selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* ------------------------------------------------------------------ */}
      {/* Background Lighting & SaaS Glows (Bleu Nuit / Bleu Électrique)     */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute inset-0 bg-[#070b14]/40 backdrop-blur-[2px]" />

      {/* Primary electric blue ambient orb (top center) */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[680px] rounded-full blur-[140px] opacity-40"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, #1e40af 50%, transparent 80%)',
        }}
      />

      {/* Secondary deep navy glow (bottom right) */}
      <div
        className="pointer-events-none absolute -bottom-32 right-10 h-[450px] w-[450px] rounded-full blur-[120px] opacity-30"
        style={{
          background: 'radial-gradient(circle, #1e40af 0%, #1d4ed8 40%, transparent 80%)',
        }}
      />

      {/* Tertiary subtle cyan-blue glow (bottom left) */}
      <div
        className="pointer-events-none absolute bottom-10 left-10 h-[380px] w-[380px] rounded-full blur-[130px] opacity-20"
        style={{
          background: 'radial-gradient(circle, #2563eb 0%, #0284c7 50%, transparent 80%)',
        }}
      />

      {/* Subtle tech dot matrix overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Left Back Navigation */}
      {onBackToApp && (
        <button
          type="button"
          onClick={onBackToApp}
          className="absolute left-6 top-6 z-20 flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0d1527]/70 px-3.5 py-2 text-xs font-semibold text-slate-300 backdrop-blur-md transition hover:border-blue-500/50 hover:bg-[#121e36] hover:text-white"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Back to Learning</span>
        </button>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Central Glassmorphic Card (Dark Mode / SaaS Aesthetic)            */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10 w-full max-w-[450px]">
        {/* Glow halo behind the card */}
        <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-b from-blue-500/25 via-blue-600/10 to-transparent blur-xl opacity-75" />

        <div className="relative rounded-2xl border border-blue-500/20 bg-slate-900/80 p-7 sm:p-9 shadow-[0_20px_60px_-15px_rgba(11,15,25,0.9),0_0_40px_rgba(30,64,175,0.22)] backdrop-blur-2xl">
          {/* Card Header */}
          <div className="flex flex-col items-center text-center">
            {/* Avatar circulaire affichant l'initiale « L » */}
            <div className="relative flex size-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#1e40af] via-[#2563eb] to-[#3b82f6] text-white shadow-[0_0_25px_rgba(59,130,246,0.55)] border border-blue-400/30">
              <span className="text-2xl font-black tracking-tight text-white font-mono">
                L
              </span>
              <div className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-blue-400 text-slate-950 shadow-md">
                <Sparkle size={11} weight="fill" />
              </div>
            </div>

            {/* Titre & Sous-titre */}
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
              Welcome Back
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Sign in to continue to <span className="font-semibold text-slate-300">Learning</span> (CNC Prep)
            </p>

            {/* Boutons de Connexion Rapide (Fast-Access Demo) */}
            <div className="mt-4 flex w-full items-center gap-2">
              <button
                type="button"
                onClick={handleDemoStudent}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 py-2 px-2 text-[11px] font-bold text-blue-300 transition hover:bg-blue-500/20 hover:text-white hover:border-blue-400 active:scale-[0.98]"
                title="Connexion en tant qu'étudiant Achraf Lemrani (MP Spé)"
              >
                <GraduationCap size={15} weight="bold" className="shrink-0 text-blue-400" />
                <span>Démo Étudiant (MP)</span>
              </button>

              <button
                type="button"
                onClick={handleDemoAdmin}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/15 py-2 px-2 text-[11px] font-bold text-indigo-300 transition hover:bg-indigo-500/25 hover:text-white hover:border-indigo-400 active:scale-[0.98]"
                title="Connexion en tant qu'administrateur Dr. Karim Mansouri"
              >
                <ShieldCheck size={15} weight="bold" className="shrink-0 text-indigo-400" />
                <span>Démo Admin</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Error Message if any */}
            {errorMessage && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            {/* Champ Email address */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <EnvelopeSimple size={17} weight="bold" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-800 bg-[#070b14]/80 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Champ Password avec icône cadenas et visibilité mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <LockSimple size={17} weight="bold" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-[#070b14]/80 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition hover:text-slate-200"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlash size={17} weight="bold" />
                  ) : (
                    <Eye size={17} weight="bold" />
                  )}
                </button>
              </div>
            </div>

            {/* Options : Remember me + Forgot password? */}
            <div className="flex items-center justify-between pt-0.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500/30 accent-blue-600"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Instructions de réinitialisation envoyées à votre adresse email.')}
                className="font-semibold text-blue-400 transition hover:text-blue-300 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Bouton d'action principal : Entièrement blanc avec texte foncé (« Sign In → ») */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.25)] transition hover:bg-slate-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] active:scale-[0.99] disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight
                      size={15}
                      weight="bold"
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Séparateur : « or » */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                or
              </span>
            </div>
          </div>

          {/* Bouton Social : Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-900 active:scale-[0.99]"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Pied de page : « Don't have an account? Sign up » */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToSignUp}
              className="font-semibold text-blue-400 transition hover:text-blue-300 hover:underline"
            >
              Sign up
            </button>
          </p>

          {/* CNC Quick Credential Badge */}
          <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-center text-[10.5px] text-blue-300/80">
            <span className="font-semibold text-blue-300">CPGE Morocco Fast-Access :</span>{' '}
            Filières MP • PSI • TSI (Concours CNC 2026)
          </div>
        </div>
      </div>
    </div>
  )
}
