'use client'

import { CalendarCheck, ChevronRight, Layers3, PenLine, Sigma, type LucideIcon } from 'lucide-react'

export interface AchievementItem {
  id: string
  title: string
  detail: string
  progress: number
  icon: LucideIcon
}

const ACHIEVEMENTS_DATA: AchievementItem[] = [
  {
    id: 'expert-data-mining',
    title: 'Algèbre linéaire',
    detail: 'Réduction et espaces euclidiens',
    progress: 85,
    icon: Layers3,
  },
  {
    id: 'regularite-de-fer',
    title: 'Objectif régularité',
    detail: '12 jours sur un objectif de 20',
    progress: 60,
    icon: CalendarCheck,
  },
  {
    id: 'redacteur-capstone',
    title: 'Rédaction soignée',
    detail: 'Démonstrations et raisonnement',
    progress: 75,
    icon: PenLine,
  },
  {
    id: 'maitrise-des-formules',
    title: 'Maîtrise des formules',
    detail: 'Analyse, algèbre et mécanique',
    progress: 92,
    icon: Sigma,
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
      <div className="mt-3 divide-y divide-slate-200/70 dark:divide-white/10">
        {ACHIEVEMENTS_DATA.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-500/8 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
              <item.icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </div>

            {/* Title, Detail & Progress */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-bold text-[#172033] dark:text-[#eaf2ff]">
                  {item.title}
                </p>
                <span className="text-xs font-semibold tabular-nums text-[#71809A] dark:text-[#91a9c8]">
                  {item.progress}%
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#71809A] dark:text-[#91a9c8] truncate">
                {item.detail}
              </p>
              <div
                role="progressbar"
                aria-label={item.title}
                aria-valuenow={item.progress}
                className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
              >
                <div
                  className="h-full rounded-full bg-blue-500 dark:bg-blue-400"
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
