'use client'

import { useEffect, useState } from 'react'

import {
  Zap,
  ArrowRight,
  LifeBuoy,
  Clock,
  PenTool,
  Sparkles,
  CheckCircle2,
  Award,
} from 'lucide-react'
import { AchievementBadgesCard } from '@/components/AchievementBadgesCard'
import { AnimatedFlameIcon } from '@/components/StreakBadge'
import { ActivityBar } from '@/components/ActivityBar'
import { ExercisePdfTemplate } from '@/components/ExercisePdfTemplate'
import { ContactAdminTemplate } from '@/components/ContactAdminTemplate'
import { CourseExerciseQcmDoubleMode } from '@/components/CourseExerciseQcmDoubleMode'
import { Footer } from '@/components/Footer'
import { LoginPage } from '@/components/LoginPage'
import { SignUpPage } from '@/components/SignUpPage'
import { AdminBackOffice } from '@/components/AdminBackOffice'
import { PersonalReportsHub } from '@/components/PersonalReportsHub'
import { Navbar } from '@/components/Navbar'
import { UserProfile, getStoredUser, DEMO_STUDENT } from '@/lib/auth'

const navItems = [
  { id: 'dashboard' as const, label: 'Tableau de bord' },
  { id: 'cours' as const, label: 'Cours & Exercices' },
  { id: 'annales' as const, label: 'Annales' },
  { id: 'problemes' as const, label: 'Problèmes' },
  { id: 'qcm' as const, label: 'QCM' },
  { id: 'contact' as const, label: 'Contact' },
]

export type StudentTabId = (typeof navItems)[number]['id'] | 'fiches'

const recentActivities = [
  { subject: 'Mathématiques', title: 'Réduction des endomorphismes', type: 'Cours · Spé', status: 'Maîtrisé', tone: 'green', duration: '48 min' },
  { subject: 'Physique / Chimie', title: 'Oscillations et régimes transitoires', type: 'Exercices · Spé', status: 'En cours', tone: 'amber', duration: '35 min' },
  { subject: 'Sciences industrielles', title: 'Asservissement des systèmes linéaires', type: 'Travaux dirigés · Spé', status: 'À revoir', tone: 'blue', duration: '1 h 15' },
  { subject: 'Informatique', title: 'Algorithmes de parcours de graphes', type: 'Exercices · Spé', status: 'Maîtrisé', tone: 'green', duration: '28 min' },
]

function SectionHeading({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#172033] dark:text-[#eaf2ff]">{title}</h2>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-semibold text-[#3978F6] transition hover:text-[#101B33] dark:text-[#6b9bff] dark:hover:text-white"
        >
          {action}
        </button>
      )}
    </div>
  )
}

function RevisionChart() {
  const subjects = [
    { name: 'Mathématiques', hours: 8.5, label: '8 h 30' },
    { name: 'Physique / Chimie', hours: 6, label: '6 h' },
    { name: 'Sciences industrielles', hours: 3, label: '3 h' },
    { name: 'Informatique', hours: 2.5, label: '2 h 30' },
  ]
  return (
    <div className="revision-chart">
      <div className="revision-chart-summary"><strong>20 h</strong><span>sur les 7 derniers jours</span></div>
      <ul aria-label="Temps de révision par matière, sur les 7 derniers jours">
        {subjects.map((subject) => (
          <li key={subject.name}>
            <div><span>{subject.name}</span><strong>{subject.label}</strong></div>
            <div className="revision-track" aria-hidden="true"><span style={{ width: `${subject.hours / 10 * 100}%` }} /></div>
          </li>
        ))}
      </ul>
      <p className="chart-note">Échelle commune : 0 à 10 heures · Données de démonstration</p>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: string }) {
  return (
    <div className="border-l border-[#e4eaf3] pl-4 first:border-l-0 first:pl-0 dark:border-[#1b3152]">
      <p className="text-xs font-medium text-[#71809A] dark:text-[#91a9c8]">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <Icon className="size-4 text-[#3978F6] dark:text-[#6b9bff] shrink-0" strokeWidth={1.75} />
        <p className="text-xl font-bold tracking-tight text-[#172033] dark:text-[#eaf2ff]">{value}</p>
      </div>
    </div>
  )
}

export default function Page() {
  // Navigation & View state: persistent student tabs + overlay views for admin and auth
  const [activeTab, setActiveTab] = useState<StudentTabId>('dashboard')
  const [currentView, setCurrentView] = useState<'student' | 'login' | 'signup' | 'admin'>('student')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [activeTab, currentView])

  const navigateToTab = (tabId: StudentTabId) => {
    setActiveTab(tabId)
    const url = new URL(window.location.href)
    if (tabId === 'dashboard') url.searchParams.delete('tab')
    else url.searchParams.set('tab', tabId)
    if (url.href !== window.location.href) window.history.pushState(null, '', url)
  }

  // Load and sync user profile & avatar across the app, and handle URL tab param
  useEffect(() => {
    const user = getStoredUser() || DEMO_STUDENT
    setCurrentUser(user)

    const handleUserUpdate = (e: any) => {
      const updated = e.detail || getStoredUser()
      if (updated) setCurrentUser(updated)
    }
    window.addEventListener('nexora-user-updated', handleUserUpdate)

    const syncTabFromUrl = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const tabParam = params.get('tab') as StudentTabId | null
        if (tabParam && ['dashboard', 'cours', 'annales', 'problemes', 'qcm', 'contact'].includes(tabParam)) {
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

  if (currentView === 'admin') {
    return (
      <AdminBackOffice
        onNavigateToStudentView={() => {
          setCurrentView('student')
          navigateToTab('dashboard')
        }}
        onLogout={() => {
          setCurrentUser(null)
          setCurrentView('login')
        }}
      />
    )
  }

  if (currentView === 'signup') {
    return (
      <SignUpPage
        onNavigateToLogin={() => setCurrentView('login')}
        onSignUpSuccess={(user) => {
          setCurrentUser(user)
          setCurrentView('student')
          navigateToTab('dashboard')
        }}
      />
    )
  }

  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={(role, user) => {
          setCurrentUser(user)
          if (role === 'ADMIN') {
            setCurrentView('admin')
          } else {
            setCurrentView('student')
            navigateToTab('dashboard')
          }
        }}
        onNavigateToSignUp={() => setCurrentView('signup')}
        onBackToApp={() => {
          setCurrentView('student')
          navigateToTab('dashboard')
        }}
      />
    )
  }

  return (
    <div className="learning-shell student-shell min-h-screen bg-transparent text-[#172033] dark:text-[#eaf2ff]">
      {/* Top Header / Persistent Task Bar across all tabs */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tabId) => navigateToTab(tabId)}
        onNavigateToAdmin={() => setCurrentView('admin')}
        onLogout={() => {
          setCurrentUser(null)
          setCurrentView('login')
        }}
        currentUser={currentUser}
      />

      {/* Main Dashboard Body */}
      {activeTab === 'dashboard' && (
        <main className="relative mx-auto max-w-[1440px] px-5 py-7 lg:px-8 lg:py-9">
          

          <div className="relative z-10">
            <div className="student-heading mb-7 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="ui-eyebrow">Mon espace étudiant</p>
                <h1 className="text-[26px] sm:text-[32px] text-[#101b33] dark:text-[#eaf2ff]">
                  Bonjour {currentUser?.name?.split(' ')[0] || 'Achraf'}.
                </h1>
                <p className="ui-page-description">Un cours à approfondir, un exercice à travailler. À vous de choisir.</p>
              </div>
              <div className="dashboard-actions flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => navigateToTab('cours')} className="ui-button-primary">
                  <Zap className="size-4" aria-hidden="true" /> Accéder aux cours <ArrowRight className="size-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => navigateToTab('annales')} className="ui-button-secondary">Consulter les annales</button>
              </div>
            </div>

            {/* Glowing divider under header */}
            <div className="glowing-divider mb-6" />

            {/* Top Row: Profile Card, Radar Chart, Achievements with Glowing Edges */}
            <div className="student-overview grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.45fr_1fr]">
              {/* Student Profile Card */}
              <section className="student-profile-card relative overflow-hidden rounded-2xl backdrop-blur-md bg-[#101b33]/85 dark:bg-slate-900/75 p-6 text-white shadow-none border border-[#3978F6]/35">

                <div className="relative">
                  <p className="text-xs font-medium text-[#aab8d0]">Ma progression</p>
                  <h2 className="mt-1 text-xl font-bold">{currentUser?.name || DEMO_STUDENT.name}</h2>
                  <p className="mt-0.5 text-xs text-[#aab8d0]">CPGE · {currentUser?.stream || 'MP'} · {currentUser?.year || '2e année Spé'}</p>

                  <div className="mt-9 flex items-center gap-4">
                    <div className="relative flex size-[64px] items-center justify-center rounded-full border border-[#729bf2] text-xs font-bold shadow-none">
                      <svg className="absolute inset-[-4px] size-[70px] -rotate-90">
                        <circle
                          cx="35"
                          cy="35"
                          r="31"
                          fill="none"
                          stroke="#3978F6"
                          strokeWidth="4"
                          strokeDasharray="195"
                          strokeDashoffset="55"
                          strokeLinecap="round"
                        />
                      </svg>
                      72%
                    </div>
                    <div>
                      <p className="text-xs text-[#aab8d0]">Progression globale</p>
                      <p className="mt-1 text-sm font-semibold">Continuez vos efforts</p>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-3 divide-x divide-white/15">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <AnimatedFlameIcon size={14} />
                        <p className="text-xs text-[#aab8d0]">Régularité</p>
                      </div>
                      <p className="mt-1 text-lg font-bold text-amber-300">12 jours</p>
                    </div>
                    <div className="pl-4">
                      <p className="text-xs text-[#aab8d0]">Annales</p>
                      <p className="mt-1 text-lg font-bold">
                        15 <span className="text-xs font-normal text-[#aab8d0]">résolues</span>
                      </p>
                    </div>
                    <div className="pl-4">
                      <p className="text-xs text-[#aab8d0]">Problèmes</p>
                      <p className="mt-1 text-lg font-bold">
                        8 <span className="text-xs font-normal text-[#aab8d0]">rédigés</span>
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Radar Chart Card */}
              <section className="glowing-card rounded-2xl p-5 shadow-lg backdrop-blur-md bg-white/80 dark:bg-slate-900/75 border border-slate-200/60 dark:border-white/10">
                <SectionHeading title="Mes révisions" />
                <RevisionChart />
              </section>

              {/* Thematic Achievement Badges Card (Linear / Raycast / Duolingo Pro Style) */}
              <AchievementBadgesCard />
            </div>

            <div className="my-6" />
            {/* Revision History & Global Statistics */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.7fr_1fr]">
              {/* Revision History Table */}
              <section className="recent-study-card glowing-card rounded-2xl p-5 shadow-lg backdrop-blur-md bg-white/80 dark:bg-slate-900/75 border border-slate-200/60 dark:border-white/10">
                <SectionHeading
                  title="Dernières activités"
                  action="Voir les cours"
                  onAction={() => navigateToTab('cours')}
                />
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[620px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[#e4eaf3] text-xs font-bold uppercase tracking-wider text-[#71809A] dark:border-[#1b3152] dark:text-[#91a9c8]">
                        <th className="pb-3 font-semibold">Matière</th>
                        <th className="pb-3 font-semibold">Leçon / Activité</th>
                        <th className="pb-3 font-semibold">Statut</th>
                        <th className="pb-3 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivities.map((activity) => (
                        <tr key={activity.title} className="border-b border-[#f0f3f8] last:border-0 dark:border-[#13233c]">
                          <td data-label="Matière" className="py-3 text-xs font-semibold text-[#172033] dark:text-[#eaf2ff]">
                            {activity.subject}
                          </td>
                          <td data-label="Contenu" className="py-3">
                            <p className="text-xs font-semibold text-[#172033] dark:text-[#eaf2ff]">{activity.title}</p>
                            <p className="mt-0.5 text-xs text-[#71809A] dark:text-[#91a9c8]">{activity.type}</p>
                          </td>
                          <td data-label="État" className="py-3">
                            <span
                              className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${
                                activity.tone === 'green'
                                  ? 'bg-[#e8f7f1] text-[#16825f] shadow-none dark:bg-[#064e3b]/30 dark:text-[#34d399]'
                                  : activity.tone === 'amber'
                                  ? 'bg-[#fff5e2] text-[#a36d1b] shadow-none dark:bg-[#78350f]/30 dark:text-[#fbbf24]'
                                  : 'bg-[#eaf1ff] text-[#2866dc] shadow-none dark:bg-[#1e3a8a]/30 dark:text-[#93c5fd]'
                              }`}
                            >
                              {activity.status}
                            </span>
                          </td>
                          <td data-label="Action" className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => navigateToTab('cours')}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#3978F6]/30 bg-[#edf4ff] px-2.5 py-1 text-xs font-bold text-[#3978F6] shadow-none transition hover:bg-[#3978F6] hover:text-white hover:shadow-none dark:border-white/10 dark:bg-[#102342] dark:text-[#8db5ff]"
                            >
                              <span>Ouvrir</span>
                              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Global Stats with Phosphor Icons */}
              <section className="glowing-card rounded-2xl p-5 shadow-lg backdrop-blur-md bg-white/80 dark:bg-slate-900/75 border border-slate-200/60 dark:border-white/10">
                <SectionHeading title="Cette année" />
                <div className="mt-5 grid grid-cols-2 gap-y-5">
                  <StatCard icon={Clock} label="Heures de révision" value="254h" />
                  <StatCard icon={PenTool} label="Copies rédigées" value="8" />
                  <StatCard icon={Sparkles} label="QCM complétés" value="14" />
                  <StatCard icon={CheckCircle2} label="Exercices validés" value="95" />
                </div>
                <div className="mt-5 flex items-center gap-2 border-t border-[#e4eaf3] pt-3.5 text-xs text-[#71809A] dark:border-[#1b3152] dark:text-[#91a9c8]">
                  <Award className="size-4 text-[#3978F6] dark:text-[#6b9bff] shrink-0" strokeWidth={1.75} />
                  <span>
                    <strong className="text-[#172033] dark:text-[#eaf2ff]">+18%</strong> de progression ce mois-ci
                  </span>
                </div>
              </section>
            </div>
            <div className="mt-6"><ActivityBar /></div>
          </div>
        </main>
      )}

      {/* Tab: Cours & Exercices (Double Mode) */}
      {activeTab === 'cours' && (
        <CourseExerciseQcmDoubleMode
          hideNavbar
          initialSection="cours"
          onNavigateToDashboard={() => navigateToTab('dashboard')}
          onNavigateToContact={() => navigateToTab('contact')}
          onNavigateToLogin={() => setCurrentView('login')}
        />
      )}

      {/* Tab: Annales CNC */}
      {activeTab === 'annales' && (
        <CourseExerciseQcmDoubleMode
          hideNavbar
          initialSection="annales"
          onNavigateToDashboard={() => navigateToTab('dashboard')}
          onNavigateToContact={() => navigateToTab('contact')}
          onNavigateToLogin={() => setCurrentView('login')}
        />
      )}

      {/* Tab: Banque de problèmes */}
      {activeTab === 'problemes' && (
        <ExercisePdfTemplate
          hideHeader
          onBackToDashboard={() => navigateToTab('dashboard')}
          onNavigateToContactAdmin={() => navigateToTab('contact')}
        />
      )}

      {/* Tab: Fiches, Khôlles & Corrigés Personnels (Glassmorphism TD UI) */}
      {activeTab === 'fiches' && (
        <PersonalReportsHub
          hideHeader
          onBackToDashboard={() => navigateToTab('dashboard')}
        />
      )}

      {/* Tab: QCM Adaptatif (Directement visible dans la barre de navigation) */}
      {activeTab === 'qcm' && (
        <CourseExerciseQcmDoubleMode
          hideNavbar
          initialSection="qcm"
          onNavigateToDashboard={() => navigateToTab('dashboard')}
          onNavigateToContact={() => navigateToTab('contact')}
          onNavigateToLogin={() => setCurrentView('login')}
        />
      )}

      {/* Tab: Contact Administration */}
      {activeTab === 'contact' && (
        <ContactAdminTemplate
          hideHeader
          onBackToDashboard={() => navigateToTab('dashboard')}
        />
      )}

      {/* Footer featuring Learning branding */}
      <Footer
        onNavigateToExoPdf={() => navigateToTab('cours')}
        onNavigateToContactAdmin={() => navigateToTab('contact')}
      />
    </div>
  )
}
