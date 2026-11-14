'use client'
import { Zap, ArrowRight, Clock, PenTool, Sparkles, CheckCircle2, Award, Layers3, CalendarCheck, PenLine, Sigma } from 'lucide-react'
import { AchievementBadgesCard } from './AchievementBadgesCard'
import { ActivityBar } from './ActivityBar'
import { StreakBadge } from './ui/streak-badge'
import type { UserProfile } from '@/lib/auth'
export interface DashboardData {
  today: string
  year: number
  totals: { studyMinutes: number; lessonsRead: number; exercisesSolved: number; problemsWritten: number; qcmCompleted: number }
  subjects: { code: string; name: string; studyMinutes: number; lessonsRead: number; exercisesSolved: number }[]
  streak: { current: number; longest: number }
  heatmap: { date: string; minutes: number }[]
  recent: { date: string; subject: string; minutes: number; lessons: number; exercises: number }[]
}

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

function RevisionChart({data}:{data:DashboardData|null}) {
  const axes=[{code:'MATH',name:'Mathématiques'},{code:'PHYS',name:'Physique-Chimie'},{code:'SI',name:'SII'},{code:'INFO',name:'Informatique'}].map(axis=>({...axis,minutes:data?.subjects.find(s=>s.code===axis.code)?.studyMinutes || 0}))
  const maximum=Math.max(60,Math.ceil(Math.max(...axes.map(a=>a.minutes))/60)*60)
  const point=(index:number,ratio:number)=>{const angle=-Math.PI/2+index*Math.PI/2;return [200+Math.cos(angle)*108*ratio,150+Math.sin(angle)*108*ratio]}
  const polygon=(ratio:number)=>axes.map((_,i)=>point(i,ratio).join(',')).join(' ')
  const duration=(minutes:number)=>`${Math.floor(minutes/60)} h ${String(minutes%60).padStart(2,'0')}`
  return <div className="mt-4">
    <div className="flex items-baseline gap-2"><strong className="text-3xl font-bold">{duration(data?.totals.studyMinutes || 0)}</strong><span className="text-xs text-slate-500 dark:text-slate-400">cette année</span></div>
    <svg viewBox="0 0 400 310" className="mx-auto w-full max-w-[420px] text-slate-500 dark:text-slate-400" role="img" aria-label={`Diagramme radar du temps de révision : ${axes.map(a=>`${a.name} ${duration(a.minutes)}`).join(', ')}`}>
      {[0.25,0.5,0.75,1].map(r=><polygon key={r} points={polygon(r)} fill="none" stroke="currentColor" strokeOpacity="0.2"/>)}
      {axes.map((a,i)=>{const [x,y]=point(i,1);return <line key={a.code} x1="200" y1="150" x2={x} y2={y} stroke="currentColor" strokeOpacity="0.25"/>})}
      {[0.5,1].map(r=><text key={r} x="205" y={150-108*r+12} fontSize="9" fill="currentColor">{maximum*r/60} h</text>)}
      <polygon points={axes.map((a,i)=>point(i,a.minutes/maximum).join(',')).join(' ')} fill="#3978f6" fillOpacity="0.2" stroke="#6096ff" strokeWidth="2.5" strokeLinejoin="round"/>
      {axes.map((axis, index) => {
        const [x, y] = point(index, axis.minutes / maximum)
        return (
          <circle key={axis.code} cx={x} cy={y} r="4" fill="#6096ff" stroke="white" strokeWidth="1.5">
            <title>{`${axis.name} : ${duration(axis.minutes)}`}</title>
          </circle>
        )
      })}
      <text x="200" y="21" textAnchor="middle" fontSize="12" fill="currentColor">Mathématiques</text>
      <text x="318" y="146" fontSize="11" fill="currentColor"><tspan x="318">Physique</tspan><tspan x="318" dy="15">Chimie</tspan></text>
      <text x="200" y="285" textAnchor="middle" fontSize="12" fill="currentColor">SII</text>
      <text x="82" y="153" textAnchor="end" fontSize="11" fill="currentColor">Informatique</text>
    </svg>
    <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-xs">{axes.map(a=><div key={a.code} className="flex justify-between gap-2"><span className="text-slate-500 dark:text-slate-400">{a.name}</span><strong>{duration(a.minutes)}</strong></div>)}</div>
    <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">Même échelle sur les quatre axes · 0 à {maximum/60} h</p>
  </div>
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

export function HomeDashboard({user,data,onNavigate}: {user:UserProfile; data:DashboardData|null; onNavigate:(tab:'cours'|'annales'|'problemes'|'qcm')=>void}) {
 const progress=Math.min(100,Math.round((data?.totals.lessonsRead || 0)/40*100))
 const recentActivities=(data?.recent || []).map(d=>({subject:d.subject,title:d.date,type:`${d.lessons} leçons · ${d.exercises} exercices · ${d.minutes} min`,status:'Enregistré',tone:'green'}))
 const goals=[
 {id:'lessons',title:'Approfondir les cours',detail:`${data?.totals.lessonsRead || 0} leçons sur 40`,progress,icon:Layers3},
 {id:'regularity',title:'Objectif régularité',detail:`${data?.streak.current || 0} jours sur 20`,progress:Math.min(100,(data?.streak.current || 0)*5),icon:CalendarCheck},
 {id:'writing',title:'Rédaction soignée',detail:`${data?.totals.problemsWritten || 0} problèmes sur 20`,progress:Math.min(100,(data?.totals.problemsWritten || 0)*5),icon:PenLine},
 {id:'practice',title:'Pratique des exercices',detail:`${data?.totals.exercisesSolved || 0} exercices sur 100`,progress:Math.min(100,data?.totals.exercisesSolved || 0),icon:Sigma}]
 return (
        <main className="relative mx-auto max-w-[1440px] px-5 py-7 lg:px-8 lg:py-9">
          <div className="relative z-10">
            <div className="student-heading mb-7 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="ui-eyebrow">Mon espace étudiant</p>
                <h1 className="text-[26px] sm:text-[32px] text-[#101b33] dark:text-[#eaf2ff]">
                  Bonjour {user?.name?.split(' ')[0] || 'Achraf'}.
                </h1>
                <p className="ui-page-description">Un cours à approfondir, un exercice à travailler. À vous de choisir.</p>
              </div>
              <div className="dashboard-actions flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => onNavigate('cours')} className="ui-button-primary">
                  <Zap className="size-4" aria-hidden="true" /> Accéder aux cours <ArrowRight className="size-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => onNavigate('annales')} className="ui-button-secondary">Consulter les annales</button>
              </div>
            </div>

            {/* Glowing divider under header */}
            <div className="glowing-divider mb-6" />{!data && <p role="alert">Statistiques indisponibles. <button onClick={() => window.location.reload()}>Réessayer</button></p>}{user.email.endsWith("@example.test") && <p className="mb-4 text-sm text-blue-500">Compte de démonstration · activités fictives.</p>}

            {/* Top Row: Profile Card, Radar Chart, Achievements with Glowing Edges */}
            <div className="student-overview grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.45fr_1fr]">
              {/* Student Profile Card */}
              <section className="student-profile-card relative overflow-hidden rounded-2xl backdrop-blur-md bg-[#101b33]/85 dark:bg-slate-900/75 p-6 text-white shadow-none border border-[#3978F6]/35">
                {/* Image de fond décorative (bibliothèque) + voile pour la lisibilité du texte */}
                <img
                  src="/images/dashboard-bibliotheque.jpg"
                  alt=""
                  aria-hidden="true"
                  className="profile-card-bg"
                  draggable={false}
                />
                <div className="profile-card-overlay" aria-hidden="true" />

                <div className="relative">
                  <p className="text-xs font-medium text-[#aab8d0]">Ma progression</p>
                  <h2 className="mt-1 text-xl font-bold">{user?.name || user.name}</h2>
                  <p className="mt-0.5 text-xs text-[#aab8d0]">CPGE · {user?.stream || 'MP'} · {user?.year || '2e année Spé'}</p>

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
                          strokeDashoffset={195*(1-progress/100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      {progress}%
                    </div>
                    <div>
                      <p className="text-xs text-[#aab8d0]">Objectif : 40 leçons</p>
                      <p className="mt-1 text-sm font-semibold">Continuez vos efforts</p>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-3 divide-x divide-white/15">
                    <StreakBadge
                      length={data?.streak.current || 0}
                      frequency="daily"
                      size="sm"
                      className="w-full min-w-0 gap-1 rounded-xl border-white/15 bg-white/5 p-1.5 text-amber-300 [--muted-foreground:#d1def2] [--primary:#fbbf24] [&_svg]:size-5 [&>span:nth-child(2)]:text-base"
                    />
                    <div className="pl-4">
                      <p className="text-xs text-[#aab8d0]">Leçons</p>
                      <p className="mt-1 text-lg font-bold">
                        {data?.totals.lessonsRead || 0} <span className="text-xs font-normal text-[#aab8d0]">étudiées</span>
                      </p>
                    </div>
                    <div className="pl-4">
                      <p className="text-xs text-[#aab8d0]">Problèmes</p>
                      <p className="mt-1 text-lg font-bold">
                        {data?.totals.problemsWritten || 0} <span className="text-xs font-normal text-[#aab8d0]">rédigés</span>
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Radar Chart Card */}
              <section className="glowing-card rounded-2xl p-5 shadow-lg backdrop-blur-md bg-white/80 dark:bg-slate-900/75 border border-slate-200/60 dark:border-white/10">
                <SectionHeading title="Mes révisions" />
                <RevisionChart data={data} />
              </section>

              {/* Thematic Achievement Badges Card (Linear / Raycast / Duolingo Pro Style) */}
              <AchievementBadgesCard items={goals} />
            </div>

            <div className="my-6" />
            {/* Revision History & Global Statistics */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.7fr_1fr]">
              {/* Revision History Table */}
              <section className="recent-study-card glowing-card rounded-2xl p-5 shadow-lg backdrop-blur-md bg-white/80 dark:bg-slate-900/75 border border-slate-200/60 dark:border-white/10">
                <SectionHeading
                  title="Dernières activités"
                  action="Voir les cours"
                  onAction={() => onNavigate('cours')}
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
                    <tbody>{!recentActivities.length && <tr><td colSpan={4} className="py-5">Vos prochaines activités apparaîtront ici.</td></tr>}
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
                              onClick={() => onNavigate('cours')}
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
                  <StatCard icon={Clock} label="Heures de révision" value={`${Math.floor((data?.totals.studyMinutes || 0)/60)}h`} />
                  <StatCard icon={PenTool} label="Copies rédigées" value={String(data?.totals.problemsWritten || 0)} />
                  <StatCard icon={Sparkles} label="QCM complétés" value={String(data?.totals.qcmCompleted || 0)} />
                  <StatCard icon={CheckCircle2} label="Exercices validés" value={String(data?.totals.exercisesSolved || 0)} />
                </div>
                <div className="mt-5 flex items-center gap-2 border-t border-[#e4eaf3] pt-3.5 text-xs text-[#71809A] dark:border-[#1b3152] dark:text-[#91a9c8]">
                  <Award className="size-4 text-[#3978F6] dark:text-[#6b9bff] shrink-0" strokeWidth={1.75} />
                  <span>
                    <strong className="text-[#172033] dark:text-[#eaf2ff]">{data?.streak.longest || 0} jours</strong> : votre meilleure série
                  </span>
                </div>
              </section>
            </div>
            <div className="mt-6"><ActivityBar activity={data?.heatmap || []} today={data?.today} streak={data?.streak.current || 0} /></div>
          </div>
        </main>

 )
}
