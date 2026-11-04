'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'

export interface AchievementItem {
  id: string
  title: string
  detail: string
  progress: number
  icon: React.ReactNode
  progressGradient: string
}

const ACHIEVEMENTS_DATA: AchievementItem[] = [
  {
    id: 'expert-data-mining',
    title: 'Algèbre linéaire',
    detail: 'Réduction et espaces euclidiens',
    progress: 85,
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <path d="M12 7L20 12L12 17L4 12L12 7Z" className="fill-indigo-500/35" transform="translate(0, 4)" />
        <path d="M12 4L20 9L12 14L4 9L12 4Z" className="fill-indigo-600 dark:fill-indigo-400" />
      </svg>
    ),
    progressGradient: 'from-indigo-500 to-violet-500',
  },
  {
    id: 'regularite-de-fer',
    title: 'Objectif régularité',
    detail: '12 jours sur un objectif de 20',
    progress: 60,
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <rect x="4" y="13" width="4" height="7" rx="2" className="fill-amber-500/30" />
        <rect x="10" y="9" width="4" height="11" rx="2" className="fill-amber-500/55" />
        <rect x="16" y="4" width="4" height="16" rx="2" className="fill-orange-500 dark:fill-amber-400" />
      </svg>
    ),
    progressGradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'redacteur-capstone',
    title: 'Rédaction soignée',
    detail: 'Démonstrations et raisonnement',
    progress: 75,
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <rect x="8" y="8" width="12" height="12" rx="3" className="fill-emerald-500/30" />
        <rect x="4" y="4" width="12" height="12" rx="3" className="fill-emerald-600 dark:fill-emerald-400" />
      </svg>
    ),
    progressGradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'maitrise-des-formules',
    title: 'Maîtrise des Formules',
    detail: 'Analyse, algèbre et mécanique',
    progress: 92,
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <circle cx="15" cy="12" r="6" className="fill-cyan-500/35" />
        <circle cx="9.5" cy="12" r="6" className="fill-blue-600 dark:fill-blue-400" />
      </svg>
    ),
    progressGradient: 'from-blue-500 to-cyan-500',
  },
]

export function AchievementBadgesCard({
  onViewAll,
  className = '',
}: {
  onViewAll?: () => void
  className?: string
}) {
  return (
    <section
      className={`glowing-card rounded-2xl p-5 shadow-lg backdrop-blur-md bg-white/80 dark:bg-slate-900/75 border border-slate-200/60 dark:border-white/10 ${className}`}
      aria-label="Mes objectifs"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-1">
        <h2 className="text-lg font-bold tracking-tight text-[#172033] dark:text-[#eaf2ff]">
          Mes objectifs
        </h2>
        {onViewAll && <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#3978F6] transition-colors hover:text-[#101B33] dark:text-[#6b9bff] dark:hover:text-white group/btn"
        >
          <span>Tous les succès</span>
          <ChevronRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" strokeWidth={2} />
        </button>}
      </div>

      {/* List of Thematic Objectives */}
      <div className="mt-4 space-y-3">
        {ACHIEVEMENTS_DATA.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-3.5 rounded-xl hover:bg-slate-500/5 dark:hover:bg-white/5 transition-all duration-200"
          >
            {/* Conteneur d'icône Verre Neutre (Stripe / Figma style) */}
            <div className="w-11 h-11 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/10 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              {item.icon}
            </div>

            {/* Title, Detail & Progress */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-bold text-[#172033] dark:text-[#eaf2ff] group-hover:text-[#3978F6] dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </p>
                <span className="font-mono text-xs font-bold text-[#71809A] dark:text-[#91a9c8]">
                  {item.progress}%
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#71809A] dark:text-[#91a9c8] truncate">
                {item.detail}
              </p>

              {/* Fine Progress Bar (h-1.5, clean, no white dot) */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.progressGradient} transition-all duration-500 ease-out`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default AchievementBadgesCard
