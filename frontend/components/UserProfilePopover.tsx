'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Gear,
  Check,
  FolderOpen,
  User,
  SignOut,
  Sun,
  Moon,
  Desktop,
  CaretRight,
  ShieldCheck,
} from '@phosphor-icons/react'
import { UserProfile, DEMO_STUDENT, getStoredUser } from '@/lib/auth'

export interface UserProfilePopoverProps {
  isOpen: boolean
  onClose: () => void
  onNavigateToPochettes?: () => void
  onNavigateToSettings?: () => void
  onNavigateToAdmin?: () => void
  onLogout?: () => void
}

export function UserProfilePopover({
  isOpen,
  onClose,
  onNavigateToPochettes,
  onNavigateToSettings,
  onNavigateToAdmin,
  onLogout,
}: UserProfilePopoverProps) {
  const router = useRouter()
  const popoverRef = useRef<HTMLDivElement>(null)

  // User Profile state
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      return getStoredUser() || DEMO_STUDENT
    }
    return DEMO_STUDENT
  })

  // Theme mode internal state
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('dark')

  // Synchronize user from localStorage and custom event
  useEffect(() => {
    const user = getStoredUser()
    if (user) setCurrentUser(user)

    const handleUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>
      if (customEvent.detail) {
        setCurrentUser(customEvent.detail)
      } else {
        const u = getStoredUser()
        if (u) setCurrentUser(u)
      }
    }
    window.addEventListener('nexora-user-updated', handleUserUpdate)
    return () => window.removeEventListener('nexora-user-updated', handleUserUpdate)
  }, [])

  // Sync theme mode on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('nexora-theme')
      if (saved === 'light' || saved === 'dark') {
        setThemeMode(saved)
      } else {
        setThemeMode('system')
      }
    }
  }, [])

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode)
    if (mode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', isDark)
      document.documentElement.classList.toggle('light', !isDark)
      window.localStorage.removeItem('nexora-theme')
      window.localStorage.removeItem('learning-theme')
      window.dispatchEvent(new CustomEvent('nexora-theme-change', { detail: { isDark } }))
    } else {
      const isDark = mode === 'dark'
      document.documentElement.classList.toggle('dark', isDark)
      document.documentElement.classList.toggle('light', !isDark)
      window.localStorage.setItem('nexora-theme', mode)
      window.localStorage.setItem('learning-theme', mode)
      window.dispatchEvent(new CustomEvent('nexora-theme-change', { detail: { isDark } }))
    }
  }

  const handleGoToPochettes = () => {
    onClose()
    if (onNavigateToPochettes) {
      onNavigateToPochettes()
    } else {
      router.push('/pochettes')
    }
  }

  const handleGoToSettings = () => {
    onClose()
    if (onNavigateToSettings) {
      onNavigateToSettings()
    } else {
      router.push('/parametres')
    }
  }

  if (!isOpen) return null

  const initials =
    currentUser.username === 'achraf' || currentUser.name?.toLowerCase().includes('achraf')
      ? 'AC'
      : currentUser.name
        ? currentUser.name
            .trim()
            .split(/\s+/)
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'AC'

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Menu profil utilisateur"
      className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl shadow-slate-900/10 backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150 select-none dark:border-white/10 dark:bg-[#121214] dark:text-white dark:shadow-2xl"
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER : Avatar + Nom + Email + Settings gear icon         */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-zinc-800/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-12 w-12 h-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3978F6] to-indigo-600 text-base font-bold text-white shadow-xs overflow-hidden border border-white/15">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="size-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 truncate">
            <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
              {currentUser.username || (currentUser.name ? currentUser.name.split(' ')[0].toLowerCase() : 'achraf')}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono truncate">
              {currentUser.email}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoToSettings}
          className="flex size-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition cursor-pointer"
          title="Paramètres du compte"
          aria-label="Accéder aux paramètres du compte"
        >
          <Gear size={17} weight="bold" />
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. WORKSPACES SECTION                                         */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-3.5 pb-2">
        <p className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-400">
          Workspaces
        </p>
        <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200 dark:bg-zinc-900/80 dark:border-zinc-800/60 transition">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 text-[11px] font-black dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30">
              {currentUser.stream || 'MP'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                Nexora CPGE — {currentUser.stream || 'MP*'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                {currentUser.center || 'Lycée Moulay Youssef'}
              </p>
            </div>
          </div>
          <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Check size={11} weight="bold" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. NAVIGATION LINKS                                           */}
      {/* ------------------------------------------------------------- */}
      <div className="py-2 space-y-1 border-b border-slate-200/80 dark:border-zinc-800/80">
        <button
          type="button"
          onClick={handleGoToPochettes}
          className="flex w-full items-center justify-between rounded-xl py-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:hover:text-white transition cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <FolderOpen
              size={18}
              weight="fill"
              className="text-blue-500 dark:text-blue-400 transition group-hover:scale-110"
            />
            <span className="font-semibold text-slate-900 dark:text-zinc-100">Mes Pochettes</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-zinc-400">
            <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[9.5px] font-bold text-blue-600 dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-300">
              Ouvrir
            </span>
            <CaretRight size={12} />
          </span>
        </button>

        <button
          type="button"
          onClick={handleGoToSettings}
          className="flex w-full items-center justify-between rounded-xl py-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:hover:text-white transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <User size={18} weight="bold" className="text-slate-400 dark:text-zinc-400" />
            <span className="font-semibold text-slate-900 dark:text-zinc-100">Paramètres du compte</span>
          </div>
          <CaretRight size={12} className="text-slate-400 dark:text-zinc-500" />
        </button>

        {onNavigateToAdmin && (
          <button
            type="button"
            onClick={() => {
              onClose()
              onNavigateToAdmin()
            }}
            className="flex w-full items-center justify-between rounded-xl py-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:hover:text-white transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} weight="bold" className="text-indigo-500 dark:text-indigo-400" />
              <span>Espace administrateur</span>
            </div>
            <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 text-[9.5px] font-bold text-indigo-600 dark:bg-indigo-500/15 dark:border-indigo-500/30 dark:text-indigo-300">
              Démo
            </span>
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. FOOTER : Theme selector (left) + Déconnexion (right)          */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between pt-3">
        {/* 3-way theme toggle button group */}
        <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`flex size-7 items-center justify-center rounded-lg text-xs transition cursor-pointer ${
              themeMode === 'light'
                ? 'bg-white text-amber-500 shadow-xs dark:bg-zinc-800 dark:text-amber-400'
                : 'text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
            title="Thème Clair"
            aria-label="Thème Clair"
          >
            <Sun size={14} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`flex size-7 items-center justify-center rounded-lg text-xs transition cursor-pointer ${
              themeMode === 'dark'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-zinc-800 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
            title="Thème Sombre"
            aria-label="Thème Sombre"
          >
            <Moon size={14} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`flex size-7 items-center justify-center rounded-lg text-xs transition cursor-pointer ${
              themeMode === 'system'
                ? 'bg-white text-emerald-600 shadow-xs dark:bg-zinc-800 dark:text-emerald-400'
                : 'text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
            title="Thème Système"
            aria-label="Thème Système"
          >
            <Desktop size={14} weight="bold" />
          </button>
        </div>

        {/* Déconnexion */}
        <button
          type="button"
          onClick={() => {
            onClose()
            if (onLogout) onLogout()
            else router.push('/login')
          }}
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition cursor-pointer"
        >
          <SignOut size={14} weight="bold" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  )
}

export default UserProfilePopover
