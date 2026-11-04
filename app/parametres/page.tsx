'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  GraduationCap,
  Lock,
  Bell,
  Camera,
  Trash,
  Check,
  CheckCircle,
  Buildings,
  Trophy,
  ArrowLeft,
  FloppyDisk,
  Sparkle,
  ShieldCheck,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react'
import { Navbar } from '@/components/Navbar'
import {
  UserProfile,
  DEMO_STUDENT,
  CPGE_CENTERS,
  CpgeStream,
  CpgeYear,
  getStoredUser,
  saveUserSession,
} from '@/lib/auth'

const PRESET_AVATARS = [
  {
    id: 'avatar-major',
    label: 'Major MP*',
    emoji: 'MP',
    bg: 'from-blue-600 via-indigo-600 to-purple-600',
  },
  {
    id: 'avatar-phys',
    label: 'Physicienne',
    emoji: 'PC',
    bg: 'from-cyan-500 via-blue-600 to-indigo-700',
  },
  {
    id: 'avatar-dev',
    label: 'Informatique',
    emoji: 'INF',
    bg: 'from-emerald-500 via-teal-600 to-cyan-700',
  },
  {
    id: 'avatar-sii',
    label: 'Ingénieur SII',
    emoji: 'SII',
    bg: 'from-amber-500 via-orange-600 to-rose-600',
  },
  {
    id: 'avatar-laureat',
    label: 'Lauréat CNC',
    emoji: 'CNC',
    bg: 'from-fuchsia-600 via-purple-600 to-indigo-800',
  },
]

const ALL_CONCOURS = [
  'CNC Maroc',
  'Mines-Ponts',
  'Centrale-Supélec',
  'CCINP',
  'Polytechnique (X-ENS)',
]

export default function ParametresPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Current session user
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      return getStoredUser() || DEMO_STUDENT
    }
    return DEMO_STUDENT
  })

  // Active tab in settings
  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'security' | 'notifications'>('profile')

  // Form states
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [year, setYear] = useState<CpgeYear>('2e année Spé')
  const [stream, setStream] = useState<CpgeStream>('MP*')
  const [center, setCenter] = useState('')
  const [targetConcours, setTargetConcours] = useState<string[]>([
    'CNC Maroc',
    'Mines-Ponts',
    'Centrale-Supélec',
  ])

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordToast, setPasswordToast] = useState<string | null>(null)

  // Notifications
  const [notifyAnswers, setNotifyAnswers] = useState(true)
  const [notifyAnnales, setNotifyAnnales] = useState(true)
  const [notifyReminders, setNotifyReminders] = useState(false)

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Init from current user
  useEffect(() => {
    const user = getStoredUser() || DEMO_STUDENT
    setCurrentUser(user)
    setName(user.name || '')
    setUsername(user.username || (user.name ? user.name.split(' ')[0].toLowerCase() : 'achraf'))
    setEmail(user.email || '')
    setBio(user.bio || 'Objectif Concours CNC 2026 — Filière MP*')
    setAvatarUrl(user.avatarUrl || '')
    setYear(user.year || '2e année Spé')
    setStream((user.stream as CpgeStream) || 'MP*')
    setCenter(user.center || 'Lycée Moulay Youssef (Rabat)')
    if (user.targetConcours && user.targetConcours.length > 0) {
      setTargetConcours(user.targetConcours)
    }
  }, [])

  // Handle custom image file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, WEBP, etc.).')
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 4 Mo.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        setAvatarUrl(result)
        showToast('Photo de profil importée avec succès !')
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle preset avatar selection
  const handleSelectPreset = (preset: (typeof PRESET_AVATARS)[number]) => {
    const svgPreset = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%232563eb"/><stop offset="100%" stop-color="%234f46e5"/></linearGradient></defs><rect width="100%" height="100%" rx="26" fill="url(%23g)"/><text x="50%" y="55%" font-family="system-ui, sans-serif" font-weight="900" font-size="30" fill="%23ffffff" dominant-baseline="middle" text-anchor="middle">${preset.emoji}</text></svg>`
    setAvatarUrl(svgPreset)
    showToast(`Avatar « ${preset.label} » sélectionné !`)
  }

  const handleRemovePhoto = () => {
    setAvatarUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    showToast('Photo supprimée (avatar par initiales réactivé)')
  }

  // Target Concours multi-toggle
  const toggleConcours = (concoursName: string) => {
    setTargetConcours((prev) =>
      prev.includes(concoursName)
        ? prev.filter((c) => c !== concoursName)
        : [...prev, concoursName]
    )
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Password update action
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      setPasswordToast('Veuillez saisir votre mot de passe actuel.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordToast('Le nouveau mot de passe doit comporter au moins 6 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordToast('Les mots de passe ne correspondent pas.')
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordToast('Mot de passe mis à jour avec succès !')
    showToast('Votre mot de passe a été modifié en toute sécurité.')
  }

  // Save changes
  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSaving(true)

    const updatedUser: UserProfile = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      username: username.trim().toLowerCase() || 'achraf',
      email: email.trim() || currentUser.email,
      bio: bio.trim(),
      avatarUrl,
      year,
      stream,
      center,
      targetConcours,
    }

    // Persist
    saveUserSession(updatedUser)
    setCurrentUser(updatedUser)

    // Broadcast across app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('nexora-user-updated', { detail: updatedUser })
      )
    }

    setTimeout(() => {
      setIsSaving(false)
      showToast('Toutes vos modifications ont été enregistrées avec succès !')
    }, 400)
  }

  const displayInitials =
    username === 'achraf' || name.toLowerCase().includes('achraf')
      ? 'AC'
      : name
        ? name
            .trim()
            .split(/\s+/)
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'AC'

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, text: 'Vide', color: 'bg-slate-300' }
    let score = 0
    if (newPassword.length >= 6) score += 1
    if (newPassword.length >= 10) score += 1
    if (/[A-Z]/.test(newPassword)) score += 1
    if (/[0-9]/.test(newPassword)) score += 1
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1

    if (score <= 2) return { score: 1, text: 'Faible', color: 'bg-rose-500' }
    if (score <= 4) return { score: 2, text: 'Moyen', color: 'bg-amber-500' }
    return { score: 3, text: 'Robuste', color: 'bg-emerald-500' }
  }

  const strength = getPasswordStrength()

  return (
    <div className="learning-shell min-h-screen bg-transparent text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Global Unified Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onNavigateToAdmin={() => router.push('/admin')}
        onLogout={() => router.push('/login')}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-2xl shadow-indigo-600/40 animate-in fade-in slide-in-from-top-4">
          <CheckCircle size={18} weight="fill" className="text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Top Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="hover:text-indigo-600 dark:hover:text-white transition cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft size={13} weight="bold" />
                <span>Tableau de bord</span>
              </button>
              <span>/</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Paramètres du compte</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>Paramètres du Compte</span>
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Session Active
              </span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Gérez votre identité, personnalisez votre photo de profil, définissez vos objectifs de concours CPGE et sécurisez votre accès.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-[#3978F6] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 transition cursor-pointer disabled:opacity-50"
            >
              <FloppyDisk size={16} weight="bold" />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column SaaS Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Navigation */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Quick Profile Summary Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0d1322] text-center">
              <div className="relative mx-auto size-24 w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-[#3978F6] to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md border-2 border-indigo-500/30">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  displayInitials
                )}
              </div>
              <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white truncate">
                {name || 'Achraf Lemrani'}
              </h2>
              <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                @{username || 'achraf'}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                {center || 'Lycée Moulay Youssef (Rabat)'}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-center gap-2">
                <span className="rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 px-3 py-1 font-mono text-xs font-bold dark:bg-indigo-500/20 dark:text-indigo-400">
                  {stream} • {year}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="rounded-3xl border border-slate-200/90 bg-white p-2.5 shadow-sm dark:border-white/10 dark:bg-[#0d1322] space-y-1">
              {[
                { id: 'profile', label: 'Photo & Identité', icon: User, desc: 'Nom, avatar, bio & email' },
                { id: 'academic', label: 'Cursus & Filière CPGE', icon: GraduationCap, desc: 'Niveau, stream & concours' },
                { id: 'security', label: 'Sécurité & Mot de passe', icon: Lock, desc: 'Authentification & clé d’accès' },
                { id: 'notifications', label: 'Alertes & Préférences', icon: Bell, desc: 'Gestion des emails & rappels' },
              ].map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as typeof activeTab)}
                    className={`flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                    }`}
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                      }`}
                    >
                      <Icon size={18} weight={isActive ? 'fill' : 'bold'} />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold">{item.label}</p>
                      <p
                        className={`text-xs truncate ${
                          isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Right Main Content Card */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-white/10 dark:bg-[#0d1322] backdrop-blur-xl">
            {/* ------------------------------------------------------------- */}
            {/* SECTION 1 : PHOTO DE PROFIL & IDENTITÉ                        */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User size={20} weight="fill" className="text-indigo-600 dark:text-indigo-400" />
                    <span>Photo de Profil &amp; Informations Personnelles</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Votre photo et votre nom d'utilisateur sont visibles sur le fil pédagogique et dans vos fiches de révision.
                  </p>
                </div>

                {/* Avatar Uploader Block */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/[0.02]">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-3">
                    Photo de Profil
                  </span>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Big Avatar Preview */}
                    <div className="relative group shrink-0">
                      <div className="size-24 w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500/40 bg-gradient-to-tr from-[#3978F6] to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="size-full object-cover" />
                        ) : (
                          displayInitials
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                        title="Changer la photo"
                      >
                        <Camera size={24} weight="bold" />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 flex-1 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition cursor-pointer"
                        >
                          <Camera size={15} weight="bold" />
                          <span>Changer la photo</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition cursor-pointer"
                          >
                            <Trash size={14} weight="bold" />
                            <span>Supprimer</span>
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Formats recommandés : PNG, JPG ou WEBP. Taille maximale : 4 Mo.
                      </p>
                    </div>
                  </div>

                  {/* Preset Avatars Selection */}
                  <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-white/10">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
                      Ou choisir un avatar CPGE officiel stylisé :
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {PRESET_AVATARS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPreset(p)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition cursor-pointer"
                        >
                          <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">{p.emoji}</span>
                          <span>{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Identity Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Nom complet officiel *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Achraf Lemrani"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder-slate-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Nom d’utilisateur / Pseudo *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-mono text-slate-400">
                        @
                      </span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="achraf"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-8 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder-slate-500 font-mono transition"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Adresse email académique *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="achraf.lemrani@cpge-cnc.ma"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder-slate-500 font-mono transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Bio &amp; Devise personnelle CPGE
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Ex: Objectif Concours CNC 2026 — Filière MP*, majorant en mathématiques."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder-slate-500 leading-relaxed transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION 2 : CURSUS ACADÉMIQUE CPGE (NIVEAU & FILIÈRE)         */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'academic' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <GraduationCap size={20} weight="fill" className="text-indigo-600 dark:text-indigo-400" />
                    <span>Cursus Académique CPGE (Niveau &amp; Filière)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Définissez votre année de prépa et votre filière pour adapter vos annales CNC et devoirs surveillés.
                  </p>
                </div>

                {/* Niveau d'étude sous forme de Cartes */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Niveau d’étude CPGE *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        id: '1re année Sup' as CpgeYear,
                        title: '1ère année — SUP',
                        subtitle: 'MPSI / PCSI / TSI 1 (Acquisition des fondamentaux)',
                      },
                      {
                        id: '2e année Spé' as CpgeYear,
                        title: '2ème année — SPÉ',
                        subtitle: 'MP / MP* / PSI / TSI 2 (Préparation aux concours CNC)',
                      },
                    ].map((card) => {
                      const isSelected = year === card.id
                      return (
                        <div
                          key={card.id}
                          onClick={() => setYear(card.id)}
                          className={`rounded-2xl border p-4 cursor-pointer transition select-none ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-500/10 shadow-sm'
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-white/10 dark:bg-black/30 dark:hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {card.title}
                            </span>
                            <div
                              className={`flex size-5 items-center justify-center rounded-full ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'border border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {isSelected && <Check size={12} weight="bold" />}
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {card.subtitle}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Filière Précise Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Filière CPGE Précise *
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {(['MP*', 'MP', 'PSI*', 'PSI', 'TSI'] as CpgeStream[]).map((st) => {
                      const isSelected = stream === st
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStream(st)}
                          className={`rounded-xl px-4 py-2 font-mono text-xs font-bold transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                              : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                          }`}
                        >
                          Filière {st}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Établissement / Centre CPGE */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <Buildings size={15} weight="bold" className="text-indigo-600 dark:text-indigo-400" />
                    <span>Lycée ou Centre Préparatoire CPGE</span>
                  </label>
                  <select
                    value={center}
                    onChange={(e) => setCenter(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white transition"
                  >
                    {CPGE_CENTERS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Objectifs Concours Cibles */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-1.5">
                    <Trophy size={15} weight="bold" className="text-amber-500" />
                    <span>Concours Cibles Préparés (Sélection multiple)</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {ALL_CONCOURS.map((c) => {
                      const isSelected = targetConcours.includes(c)
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleConcours(c)}
                          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                              : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                          }`}
                        >
                          {isSelected && <Check size={13} weight="bold" />}
                          <span>{c}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION 3 : SÉCURITÉ & CHANGEMENT DE MOT DE PASSE             */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Lock size={20} weight="fill" className="text-indigo-600 dark:text-indigo-400" />
                    <span>Sécurité &amp; Mot de Passe</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Protégez votre compte étudiant avec un mot de passe robuste et des clés chiffrées.
                  </p>
                </div>

                {passwordToast && (
                  <div
                    className={`rounded-2xl p-4 text-xs font-bold ${
                      passwordToast.includes('succès')
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                    }`}
                  >
                    {passwordToast}
                  </div>
                )}

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Mot de passe actuel *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder-slate-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Nouveau mot de passe *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 caractères"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder-slate-500 transition"
                    />

                    {/* Strength Indicator */}
                    {newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-500 dark:text-slate-400">Robustesse :</span>
                          <span
                            className={
                              strength.score === 3
                                ? 'text-emerald-500'
                                : strength.score === 2
                                ? 'text-amber-500'
                                : 'text-rose-500'
                            }
                          >
                            {strength.text}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full ${strength.color} transition-all duration-300`}
                            style={{ width: `${(strength.score / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Confirmer le nouveau mot de passe *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder-slate-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition cursor-pointer"
                  >
                    <ShieldCheck size={16} weight="bold" />
                    <span>Mettre à jour le mot de passe</span>
                  </button>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION 4 : ALERTES & PRÉFÉRENCES                             */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell size={20} weight="fill" className="text-indigo-600 dark:text-indigo-400" />
                    <span>Préférences de Notifications &amp; Alertes CPGE</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Personnalisez vos récapitulatifs hebdomadaires et vos alertes de nouveaux corrigés.
                  </p>
                </div>

                <div className="space-y-3 divide-y divide-slate-100 dark:divide-white/10">
                  <div className="pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        Réponses Pédagogiques &amp; Retours Enseignants
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Recevoir une alerte instantanée lorsqu'un professeur corrige votre question de cours.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifyAnswers(!notifyAnswers)}
                      className={`size-6 rounded-full transition cursor-pointer ${
                        notifyAnswers ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-zinc-700'
                      } flex items-center justify-center text-white`}
                    >
                      {notifyAnswers && <Check size={14} weight="bold" />}
                    </button>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        Nouveaux Rapports CNC &amp; Annales
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Soyez notifié dès la mise en ligne des rapports de jurys officiels et concours blancs.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifyAnnales(!notifyAnnales)}
                      className={`size-6 rounded-full transition cursor-pointer ${
                        notifyAnnales ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-zinc-700'
                      } flex items-center justify-center text-white`}
                    >
                      {notifyAnnales && <Check size={14} weight="bold" />}
                    </button>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        Rappels Quotidiens de Révision
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Rappel à 20h00 pour maintenir votre série d'entraînement continue.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifyReminders(!notifyReminders)}
                      className={`size-6 rounded-full transition cursor-pointer ${
                        notifyReminders ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-zinc-700'
                      } flex items-center justify-center text-white`}
                    >
                      {notifyReminders && <Check size={14} weight="bold" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Toutes vos données restent stockées de façon sécurisée sur votre session CPGE.
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAll()}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-[#3978F6] px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:brightness-110 transition cursor-pointer disabled:opacity-50"
                >
                  <Check size={14} weight="bold" />
                  <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
