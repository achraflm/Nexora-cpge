'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  ScrollText,
  PenTool,
  Sparkles,
  LifeBuoy,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import { NexoraLogo } from '@/components/NexoraLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserProfilePopover } from '@/components/UserProfilePopover'
import { StreakBadge } from '@/components/StreakBadge'
import { getStoredUser, DEMO_STUDENT, UserProfile } from '@/lib/auth'

export type NavTabId = 'dashboard' | 'cours' | 'annales' | 'problemes' | 'qcm' | 'contact'

export interface NavItemConfig {
  id: NavTabId
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  hasBadge?: string
}

export const MAIN_NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'cours', label: 'Cours & exercices', icon: BookOpen },
  { id: 'annales', label: 'Annales', icon: ScrollText },
  { id: 'problemes', label: 'Problèmes', icon: PenTool },
  { id: 'qcm', label: 'QCM', icon: Sparkles },
  { id: 'contact', label: 'Contact', icon: LifeBuoy },
]

export interface NavbarProps {
  /** Currently active tab identifier (e.g. 'dashboard', 'cours', etc.) */
  activeTab?: string
  /** Custom handler when an item is clicked (used in main dashboard) */
  onSelectTab?: (tabId: NavTabId) => void
  /** Custom handler for admin view toggle */
  onNavigateToAdmin?: () => void
  /** Custom handler for logout */
  onLogout?: () => void
  /** Optional custom user profile */
  currentUser?: UserProfile | null
  /** Optional streak count (defaults to 12) */
  streakDays?: number
}

export function Navbar({
  activeTab,
  onSelectTab,
  onNavigateToAdmin,
  onLogout,
  currentUser: initialUser,
  streakDays = 12,
}: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (initialUser !== undefined) return initialUser
    if (typeof window !== 'undefined') {
      return getStoredUser() || DEMO_STUDENT
    }
    return DEMO_STUDENT
  })

  // Keep user in sync with prop updates and global custom events
  useEffect(() => {
    if (initialUser !== undefined) {
      setUser(initialUser)
    }
  }, [initialUser])

  useEffect(() => {
    const handleUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>
      if (customEvent.detail) {
        setUser(customEvent.detail)
      } else {
        const u = getStoredUser()
        if (u) setUser(u)
      }
    }
    window.addEventListener('nexora-user-updated', handleUserUpdate)
    return () => window.removeEventListener('nexora-user-updated', handleUserUpdate)
  }, [])

  const handleTabClick = (tabId: NavTabId) => {
    setMobileMenuOpen(false)
    if (onSelectTab) {
      onSelectTab(tabId)
      return
    }
    // Navigation for pages outside the root dashboard (like /pochettes)
    if (pathname === '/') {
      if (tabId === 'dashboard') {
        router.push('/')
      } else {
        router.push(`/?tab=${tabId}`)
      }
    } else {
      if (tabId === 'dashboard') {
        router.push('/')
      } else {
        router.push(`/?tab=${tabId}`)
      }
    }
  }

  const handleAdminClick = () => {
    if (onNavigateToAdmin) {
      onNavigateToAdmin()
    } else {
      router.push('/admin')
    }
  }

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout()
    } else {
      router.push('/login')
    }
  }

  const displayInitials =
    user?.username === 'achraf' || user?.name?.toLowerCase().includes('achraf')
      ? 'AC'
      : user?.name
        ? user.name
            .trim()
            .split(/\s+/)
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'AC'

  return (
    <header className="app-navbar sticky top-0 z-30 border-b border-slate-200/60 dark:border-white/10 backdrop-blur-md bg-white/80 dark:bg-slate-900/75 text-[#101b33] dark:text-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
      {/* Combined Single Unified Navigation Bar */}
      <div className="app-navbar-inner mx-auto flex h-[62px] max-w-[1600px] items-center justify-between px-3 sm:px-6 gap-3">
        {/* LEFT: Logo Nexora + Filière Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleTabClick('dashboard')}
            className="flex items-center text-left transition hover:opacity-90 cursor-pointer"
            title="Retour au Tableau de bord"
          >
            <NexoraLogo size={32} showText className="pr-1" />
          </button>
          <span className="hidden 2xl:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 px-2.5 py-1 text-xs font-semibold text-[#3978F6] border border-[#3978F6]/25 dark:text-[#7ba9ff] ring-1 ring-inset ring-blue-500/20 shadow-xs">
            <GraduationCap className="size-3.5" strokeWidth={1.75} />
            <span>CPGE {user?.stream || 'MP'}</span>
          </span>
        </div>

        {/* CENTER: Navigation Items (Épurés, Sans Encombrement, Badge '15' sur QCM) */}
        <nav className="hidden xl:flex min-w-0 items-center justify-center gap-1" aria-label="Navigation principale">
          {MAIN_NAV_ITEMS.map(({ id, label, icon: Icon, hasBadge }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTabClick(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex h-[62px] shrink-0 items-center gap-2 border-b-2 px-3 text-xs font-semibold transition cursor-pointer whitespace-nowrap group ${
                  isActive
                    ? 'border-[#3978F6] text-[#3978F6] dark:border-[#3978F6] dark:text-white'
                    : 'border-transparent text-[#64748b] hover:border-slate-300 hover:text-[#101b33] dark:text-[#aab8d0] dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`size-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-[#3978F6] dark:text-blue-400' : 'text-slate-400 dark:text-slate-400'
                  }`}
                  strokeWidth={1.75}
                />
                <span>{label}</span>
                {hasBadge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-[#3978F6] text-white shadow-xs'
                        : 'bg-[#3978F6]/15 text-[#2866dc] dark:bg-[#3978F6]/30 dark:text-[#9cc0ff]'
                    }`}
                  >
                    {hasBadge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* RIGHT: Actions, Switch Admin, Streak, Theme & Profil */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <ThemeToggle />

          {/* Streak Badge with Custom Animated Vector Flame (Zero Native Emoji) */}
          <div className="hidden 2xl:flex items-center border-l border-slate-200/80 dark:border-white/15 pl-2">
            <StreakBadge count={streakDays} variant="navbar" />
          </div>

          {/* User Profile Popover Trigger */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsProfilePopoverOpen(!isProfilePopoverOpen)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200/90 bg-slate-100/70 px-3 py-1.5 text-sm hover:bg-slate-200/80 hover:border-slate-300 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-white/25 transition cursor-pointer text-left focus:outline-none"
              title="Mon compte"
              aria-label="Menu du profil utilisateur"
            >
              <div className="flex size-7 w-7 h-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#3978F6] to-indigo-600 text-xs font-bold text-white shadow-xs shrink-0 overflow-hidden border border-white/15">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  displayInitials
                )}
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-white hidden lg:inline truncate max-w-[120px]">
                {user?.username || (user?.name ? user.name.split(' ')[0].toLowerCase() : 'achraf')}
              </span>
              <ChevronDown className="size-3 text-slate-400 shrink-0" strokeWidth={2} />
            </button>

            <UserProfilePopover
              isOpen={isProfilePopoverOpen}
              onClose={() => setIsProfilePopoverOpen(false)}
              onNavigateToPochettes={() => {
                if (pathname !== '/pochettes') {
                  router.push('/pochettes')
                }
              }}
              onNavigateToSettings={() => {
                if (pathname !== '/parametres') {
                  router.push('/parametres')
                }
              }}
              onNavigateToAdmin={handleAdminClick}
              onLogout={handleLogoutClick}
            />
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="app-menu-trigger flex size-9 shrink-0 items-center justify-center rounded-lg text-[#64748b] hover:bg-black/5 dark:text-[#c4d0e4] dark:hover:bg-white/10 xl:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="student-mobile-navigation"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileMenuOpen ? <X className="size-5" strokeWidth={1.75} /> : <Menu className="size-5" strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div id="student-mobile-navigation" className="app-mobile-menu border-t border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1426]/95 xl:hidden animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-1">
            {MAIN_NAV_ITEMS.map(({ id, label, icon: Icon, hasBadge }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTabClick(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#3978F6] text-white shadow-md'
                      : 'text-[#64748b] hover:bg-slate-100 dark:text-[#aab8d0] dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                    <span>{label}</span>
                  </div>
                  {hasBadge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#3978F6]/15 text-[#2866dc] dark:bg-[#3978F6]/30 dark:text-[#9cc0ff]'
                      }`}
                    >
                      {hasBadge}
                    </span>
                  )}
                </button>
              )
            })}
            <div className="mt-2 border-t border-slate-200 pt-2 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleAdminClick()
                }}
                className="flex w-full items-center gap-2 rounded-xl bg-indigo-500/10 px-3.5 py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 transition cursor-pointer"
              >
                <ShieldCheck className="size-4" strokeWidth={1.75} />
                <span>Démo : espace administrateur</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
