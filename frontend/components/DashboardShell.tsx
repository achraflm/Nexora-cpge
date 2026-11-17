'use client'

import type { ResourceReference } from '@/components/TicketInbox'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { UserProfile, getStoredUser, logout } from '@/lib/auth'
import { ResourceCatalog } from '@/components/ResourceCatalog'
import { HomeDashboard, type DashboardData } from '@/components/HomeDashboard'
import { studyActivityEvent, type DocumentReference } from '@/lib/study-activity'

function TabLoading() {
  return <p role="status" className="mx-auto max-w-[1440px] px-5 py-8">Ouverture de l’onglet…</p>
}

const loadCourses = () => import('@/components/CourseExerciseQcmDoubleMode')
const CourseExerciseQcmDoubleMode = dynamic(() => loadCourses().then(m => m.CourseExerciseQcmDoubleMode), { loading: TabLoading })
const ClassicalLibrary = dynamic(() => import('@/components/ClassicalLibrary').then(m => m.ClassicalLibrary), { loading: TabLoading })
const TicketInbox = dynamic(() => import('@/components/TicketInbox').then(m => m.TicketInbox), { loading: TabLoading })
const PersonalReportsHub = dynamic(() => import('@/components/PersonalReportsHub').then(m => m.PersonalReportsHub), { loading: TabLoading })

const navItems = [
  { id: 'dashboard' as const, label: 'Tableau de bord' },
  { id: 'ressources' as const, label: 'Ressources' },
  { id: 'cours' as const, label: 'Cours & Exercices' },
  { id: 'annales' as const, label: 'Annales' },
  { id: 'problemes' as const, label: 'Problèmes' },
  { id: 'qcm' as const, label: 'QCM' },
  { id: 'contact' as const, label: 'Contact' },
]

export type StudentTabId = (typeof navItems)[number]['id'] | 'fiches'

export default function DashboardShell({ initialUser, dashboard }: { initialUser: UserProfile; dashboard: DashboardData | null }) {
  const [reference, setReference] = useState<ResourceReference>()
  const [activeTab, setActiveTab] = useState<StudentTabId>('dashboard')
  const [currentUser, setCurrentUser] = useState(initialUser)
  const [data, setData] = useState(dashboard)
  const [initialDocument, setInitialDocument] = useState<DocumentReference>()
  const [refresh, setRefresh] = useState(0)
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [activeTab])

  // Courses, past exams and quizzes share this module. Warm it after the dashboard paints.
  useEffect(() => {
    if (!window.requestIdleCallback) return
    const warmCourses = () => { void loadCourses().catch(() => {}) }
    const id = window.requestIdleCallback(warmCourses)
    return () => window.cancelIdleCallback(id)
  }, [])

  const navigateToTab = (tabId: StudentTabId, document?: DocumentReference) => {
    setReference(undefined)
    setInitialDocument(document)
    setActiveTab(tabId)
    const url = new URL(window.location.href)
    if (tabId === 'dashboard') url.searchParams.delete('tab')
    else url.searchParams.set('tab', tabId)
    if (url.href !== window.location.href) window.history.pushState(null, '', url)
  }

  function reportResource(reference: ResourceReference) {
    navigateToTab('contact')
    setReference(reference)
  }

  // Load and sync user profile & avatar across the app, and handle URL tab param
  useEffect(() => {
    const user = initialUser
    setCurrentUser(user)

    const handleUserUpdate = (e: any) => {
      const updated = e.detail || getStoredUser()
      if (updated) setCurrentUser(updated)
    }
    window.addEventListener('nexora-user-updated', handleUserUpdate)

    const syncTabFromUrl = () => {
      setInitialDocument(undefined)
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const tabParam = params.get('tab') as StudentTabId | null
        if (tabParam && ['dashboard', 'ressources', 'cours', 'annales', 'problemes', 'qcm', 'contact'].includes(tabParam)) {
          setActiveTab(tabParam)
        } else {
          setActiveTab('dashboard')
        }
      }
    }

    syncTabFromUrl()
    window.addEventListener('popstate', syncTabFromUrl)

    return () => {
      window.removeEventListener('nexora-user-updated', handleUserUpdate)
      window.removeEventListener('popstate', syncTabFromUrl)
    }
  }, [])

  useEffect(() => {
    let controller: AbortController | undefined
    const update = async () => {
      controller?.abort()
      const request = new AbortController()
      controller = request
      try {
        const response = await fetch('/api/analytics', { signal: request.signal, cache: 'no-store' })
        if (response.ok) {
          const next: DashboardData = await response.json()
          if (!request.signal.aborted) setData(next)
        }
      } catch { /* Les dernières statistiques reçues restent affichées. */ }
    }
    const dateInCasablanca = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca', year: 'numeric', month: '2-digit', day: '2-digit' })
    let lastDay = dateInCasablanca.format(new Date())
    const checkDay = () => {
      const today = dateInCasablanca.format(new Date())
      if (today !== lastDay) {
        lastDay = today
        void update()
      }
    }
    if (activeTab === 'dashboard') void update()
    window.addEventListener(studyActivityEvent, update)
    window.addEventListener('focus', update)
    const timer = window.setInterval(checkDay, 60_000)
    return () => {
      controller?.abort()
      window.removeEventListener(studyActivityEvent, update)
      window.removeEventListener('focus', update)
      window.clearInterval(timer)
    }
  }, [activeTab, refresh])

  return (
    <div className="learning-shell student-shell min-h-screen bg-transparent text-[#172033] dark:text-[#eaf2ff]">
      {/* Top Header / Persistent Task Bar across all tabs */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tabId) => navigateToTab(tabId)}
        onNavigateToAdmin={() => window.location.assign('/admin')}
        onLogout={() => { void logout() }}
        currentUser={currentUser}
        streakDays={data?.streak.current || 0}
      />

      {activeTab === 'dashboard' && <HomeDashboard user={currentUser} data={data} onNavigate={navigateToTab}
        onOpenDocument={document => navigateToTab(document.section, document)} onRetry={() => setRefresh(value => value + 1)} />}

      {activeTab === 'ressources' && <ResourceCatalog onReport={reportResource} initialDocument={initialDocument} />}
      {/* Tab: Cours & Exercices (Double Mode) */}
      {(activeTab === 'cours' || activeTab === 'annales' || activeTab === 'qcm') && (
        <CourseExerciseQcmDoubleMode
          key={activeTab}
          hideNavbar
          initialSection={activeTab}
          initialDocument={initialDocument}
          onNavigateToDashboard={() => navigateToTab('dashboard')}
          onNavigateToContact={() => navigateToTab('contact')}
          onReport={reportResource}
          onNavigateToLogin={() => window.location.assign('/login')}
        />
      )}

      {/* Tab: Banque de problèmes */}
      {activeTab === 'problemes' && (
        <ClassicalLibrary
          initialDocument={initialDocument}
          onBackToDashboard={() => navigateToTab('dashboard')}
          onReport={reportResource}
        />
      )}

      {/* Tab: Fiches, Khôlles & Corrigés Personnels (Glassmorphism TD UI) */}
      {activeTab === 'fiches' && (
        <PersonalReportsHub
          hideHeader
          onBackToDashboard={() => navigateToTab('dashboard')}
        />
      )}

      {/* Tab: Contact Administration */}
      {activeTab === 'contact' && <TicketInbox key={reference?.ref || 'inbox'} reference={reference} />}

      {/* Footer featuring Learning branding */}
      <Footer
        onNavigateToExoPdf={() => navigateToTab('cours')}
        onNavigateToContactAdmin={() => navigateToTab('contact')}
      />
    </div>
  )
}
