'use client'

import { useState } from 'react'
import {
  User,
  EnvelopeSimple,
  LockSimple,
  Eye,
  EyeSlash,
  ArrowRight,
  ArrowLeft,
  Sparkle,
  GraduationCap,
  Buildings,
  CheckCircle,
  Lightning,
} from '@phosphor-icons/react'
import { CPGE_CENTERS, CpgeStream, CpgeYear, UserProfile, saveUserSession } from '@/lib/auth'

export function SignUpPage({
  onSignUpSuccess,
  onNavigateToLogin,
}: {
  onSignUpSuccess?: (user: UserProfile) => void
  onNavigateToLogin?: () => void
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [center, setCenter] = useState(CPGE_CENTERS[0])
  const [year, setYear] = useState<CpgeYear>('2e année Spé')
  const [stream, setStream] = useState<CpgeStream>('MP')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Fast autofill demo for quick testing
  const handleAutofillDemo = () => {
    setFirstName('Achraf')
    setLastName('Lemrani')
    setEmail('achraf.lemrani@cpge-cnc.ma')
    setPassword('StudentPassword2026!')
    setCenter('Lycée Omar Ibn Al-Khattab (Rabat)')
    setYear('2e année Spé')
    setStream('MP')
    setErrorMsg(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.')
      return
    }

    if (password.length < 8) {
      setErrorMsg('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: `${firstName} ${lastName}`.trim(),
        email: email.trim(),
        role: 'STUDENT',
        stream,
        year,
        center,
        token: `mock_jwt_student_${Date.now()}`,
      }
      saveUserSession(newUser)
      if (onSignUpSuccess) {
        onSignUpSuccess(newUser)
      } else if (onNavigateToLogin) {
        onNavigateToLogin()
      } else {
        window.location.href = '/'
      }
    }, 800)
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-transparent px-4 py-12 text-slate-100 selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* ------------------------------------------------------------------ */}
      {/* Background Lighting & SaaS Glows (Bleu Nuit / Bleu Électrique)     */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute inset-0 bg-[#070b14]/40 backdrop-blur-[2px]" />

      {/* Primary electric blue ambient orb (top center) */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[750px] rounded-full blur-[140px] opacity-40"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, #1e40af 50%, transparent 80%)',
        }}
      />

      {/* Secondary deep navy glow */}
      <div
        className="pointer-events-none absolute -bottom-32 right-10 h-[480px] w-[480px] rounded-full blur-[130px] opacity-30"
        style={{
          background: 'radial-gradient(circle, #1e40af 0%, #1d4ed8 40%, transparent 80%)',
        }}
      />

      {/* Dot matrix texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Left Navigation Back to Login */}
      {onNavigateToLogin && (
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="absolute left-6 top-6 z-20 flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0d1527]/70 px-3.5 py-2 text-xs font-semibold text-slate-300 backdrop-blur-md transition hover:border-blue-500/50 hover:bg-[#121e36] hover:text-white"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Déjà inscrit ? Se connecter</span>
        </button>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Central Glassmorphic Card (Dark Mode / SaaS Aesthetic)            */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10 w-full max-w-[540px] my-6">
        {/* Glow halo behind card */}
        <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-b from-blue-500/25 via-blue-600/10 to-transparent blur-xl opacity-75" />

        <div className="relative rounded-2xl border border-blue-500/20 bg-slate-900/80 p-7 sm:p-9 shadow-[0_20px_60px_-15px_rgba(11,15,25,0.9),0_0_40px_rgba(30,64,175,0.22)] backdrop-blur-2xl">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative flex size-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#1e40af] via-[#2563eb] to-[#3b82f6] text-white shadow-[0_0_25px_rgba(59,130,246,0.55)] border border-blue-400/30">
              <span className="text-2xl font-black tracking-tight text-white font-mono">
                L
              </span>
              <div className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-blue-400 text-slate-950 shadow-md">
                <Sparkle size={11} weight="fill" />
              </div>
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
              Inscription CPGE
            </h1>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">
              Rejoignez l&apos;élite de la préparation au Concours National Commun (CNC).
            </p>

            {/* Quick Demo Autofill Button */}
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-300 transition hover:bg-blue-500/20 hover:text-white"
            >
              <Lightning size={14} weight="fill" className="text-amber-300 animate-pulse" />
              <span>Pré-remplir en un clic (Exemple MP Spé)</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {errorMsg && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Prénom & Nom (Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Prénom <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User size={16} weight="bold" />
                  </div>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Achraf"
                    className="w-full rounded-xl border border-slate-800 bg-[#070b14]/80 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nom <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User size={16} weight="bold" />
                  </div>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Lemrani"
                    className="w-full rounded-xl border border-slate-800 bg-[#070b14]/80 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Adresse Email (académique ou personnelle) <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <EnvelopeSimple size={16} weight="bold" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="achraf.lemrani@cpge-cnc.ma"
                  className="w-full rounded-xl border border-slate-800 bg-[#070b14]/80 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mot de passe <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <LockSimple size={16} weight="bold" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 caractères"
                  className="w-full rounded-xl border border-slate-800 bg-[#070b14]/80 py-2.5 pl-9 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-200"
                >
                  {showPassword ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
                </button>
              </div>
            </div>

            {/* Centre CPGE (Liste Déroulante) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Centre CPGE <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Buildings size={16} weight="bold" />
                </div>
                <select
                  value={center}
                  onChange={(e) => setCenter(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#070b14]/90 py-2.5 pl-9 pr-4 text-xs sm:text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none"
                >
                  {CPGE_CENTERS.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Année d'étude (Boutons Radio) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Année d&apos;étude <span className="text-blue-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(['1re année Sup', '2e année Spé'] as CpgeYear[]).map((y) => {
                  const isSelected = year === y
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYear(y)}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs font-semibold transition ${
                        isSelected
                          ? 'border-blue-500 bg-blue-600/20 text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                          : 'border-slate-800 bg-[#070b14]/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div
                        className={`size-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                      </div>
                      <span>{y}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Filière (Sélecteur Visuel MP, PSI, TSI) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Filière CNC <span className="text-blue-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(
                  [
                    { id: 'MP', label: 'MP', desc: 'Maths-Physique' },
                    { id: 'PSI', label: 'PSI', desc: 'Physique & SI' },
                    { id: 'TSI', label: 'TSI', desc: 'Techno. & SI' },
                  ] as { id: CpgeStream; label: string; desc: string }[]
                ).map((f) => {
                  const isSelected = stream === f.id
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setStream(f.id)}
                      className={`relative flex flex-col items-center justify-center rounded-xl border py-2.5 px-2 text-center transition ${
                        isSelected
                          ? 'border-blue-400 bg-gradient-to-b from-blue-600/30 to-blue-900/30 text-white shadow-[0_0_20px_rgba(59,130,246,0.35)]'
                          : 'border-slate-800 bg-[#070b14]/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-base font-black tracking-wide">{f.label}</span>
                      <span className="text-[10px] text-slate-400">{f.desc}</span>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 text-blue-400">
                          <CheckCircle size={14} weight="fill" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit Action Button: Rectangulaire blanc */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.25)] transition hover:bg-slate-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] active:scale-[0.99] disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span>Création du compte...</span>
                  </span>
                ) : (
                  <>
                    <span>Créer mon compte Étudiant</span>
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

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Déjà inscrit sur Learning ?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-semibold text-blue-400 transition hover:text-blue-300 hover:underline"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
