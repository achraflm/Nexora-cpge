'use client'

import { useState } from 'react'
import { Calendar, Zap, Award } from 'lucide-react'
import { StreakBadge } from '@/components/ui/streak-badge'

interface ActivityCellData {
  date: string
  dayName: string
  level: number
  sessions: number
  duration: string
  subject?: string
}

export function ActivityBar() {
  const [hoveredCell, setHoveredCell] = useState<ActivityCellData | null>(null)

  const WEEKS = 52
  const DAYS_PER_WEEK = 7
  const dayLabels = ['L', '', 'M', '', 'V', '', 'D']
  const fullDayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

  // Month milestones distributed across the 52 weeks of the academic year
  const monthMilestones: { [weekIdx: number]: string } = {
    0: 'Sept.',
    4: 'Oct.',
    9: 'Nov.',
    13: 'Déc.',
    18: 'Janv.',
    22: 'Févr.',
    26: 'Mars',
    31: 'Avr.',
    35: 'Mai',
    39: 'Juin',
    44: 'Juil.',
    48: 'Août',
  }

  const monthStarts = [
    { week: 0, label: 'Sept.' },
    { week: 4, label: 'Oct.' },
    { week: 9, label: 'Nov.' },
    { week: 13, label: 'Déc.' },
    { week: 18, label: 'Janv.' },
    { week: 22, label: 'Févr.' },
    { week: 26, label: 'Mars' },
    { week: 31, label: 'Avr.' },
    { week: 35, label: 'Mai' },
    { week: 39, label: 'Juin' },
    { week: 44, label: 'Juil.' },
    { week: 48, label: 'Août' },
  ]

  const getMonthName = (w: number) => {
    let name = 'Sept.'
    for (const m of monthStarts) {
      if (w >= m.week) name = m.label
    }
    return name
  }

  // Pre-generate deterministic activity data
  const weeksData: ActivityCellData[][] = []
  const subjects = ['Data Mining', 'Machine Learning', 'Mathématiques', 'Informatique']

  for (let w = 0; w < WEEKS; w++) {
    const week: ActivityCellData[] = []
    for (let d = 0; d < DAYS_PER_WEEK; d++) {
      const seed = (w * 17 + d * 7 + 11) % 100
      let level = 0
      let sessions = 0
      let duration = '0 min'

      if (w >= 4 && w <= 16 && (d <= 5 || seed % 3 !== 0)) {
        level = (seed % 4) + 1
      } else if (seed > 65) {
        level = 4
      } else if (seed > 45) {
        level = 3
      } else if (seed > 25) {
        level = 2
      } else if (seed > 10) {
        level = 1
      } else {
        level = 0
      }

      if (d === 6 && seed % 2 === 0) level = Math.max(0, level - 1)

      if (level === 1) {
        sessions = 1
        duration = '35 min'
      } else if (level === 2) {
        sessions = 2
        duration = '1h 15'
      } else if (level === 3) {
        sessions = 3
        duration = '2h 10'
      } else if (level === 4) {
        sessions = 4
        duration = '3h 30'
      }

      const approxDay = ((w * 7 + d) % 28) + 1
      const monthName = getMonthName(w)

      week.push({
        date: `${approxDay} ${monthName}`,
        dayName: fullDayNames[d],
        level,
        sessions,
        duration,
        subject: sessions > 0 ? subjects[(w + d) % subjects.length] : undefined,
      })
    }
    weeksData.push(week)
  }

  return (
    <section
      className="glowing-card activity-card relative rounded-xl p-3 sm:p-3.5 shadow-md backdrop-blur-md bg-white/80 dark:bg-slate-900/75 border border-slate-200/60 dark:border-white/10"
      aria-labelledby="activity-title"
    >
      {/* Compact Header with glowing badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="flex size-6 items-center justify-center rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/25">
            <Calendar className="size-3.5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 id="activity-title" className="text-xs sm:text-[13px] font-bold tracking-[-0.01em] text-[#172033] dark:text-[#eaf2ff]">
              Activité d&apos;apprentissage & Régularité
            </h2>
          </div>
        </div>

        {/* Compact Right KPIs */}
        <div className="flex items-center gap-1.5 text-xs">
          <StreakBadge
            length={12}
            frequency="daily"
            size="sm"
            className="w-auto flex-row gap-1.5 whitespace-nowrap rounded-xl border-amber-500/25 bg-amber-500/10 px-2 py-1 text-amber-800 [--muted-foreground:#92400e] [--primary:#b45309] dark:text-amber-200 dark:[--muted-foreground:#fde68a] dark:[--primary:#fbbf24] [&_svg]:size-3.5 [&>span:nth-child(2)]:text-xs"
          />
          <div className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20">
            <Zap className="size-3 text-blue-500 animate-pulse" strokeWidth={1.75} />
            <span>76 sessions</span>
          </div>
          <span className="hidden text-xs font-medium text-[#71809A] sm:inline dark:text-[#91a9c8]">
            • Assiduité : <strong>86%</strong>
          </span>
        </div>
      </div>

      {/* Compact Heatmap Grid with Exact Square Cells */}
      <div className="mt-2.5 flex w-full justify-start overflow-x-auto pb-1 pt-0.5 sm:justify-center">
        <div className="inline-flex flex-col">
          {/* Months labels row: aligned with the week columns */}
          <div className="mb-1 flex pl-4 sm:pl-5 gap-[2.5px] sm:gap-[3px] text-[8.5px] font-semibold text-[#71809A] dark:text-[#91a9c8]">
            {Array.from({ length: WEEKS }).map((_, wIdx) => (
              <div
                key={wIdx}
                className="relative h-3 w-[11px] sm:w-[11.5px] lg:w-[12px] shrink-0"
              >
                {monthMilestones[wIdx] && (
                  <span className="absolute left-0 top-0 whitespace-nowrap leading-none">
                    {monthMilestones[wIdx]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Day labels + Week columns */}
          <div className="flex items-start gap-1 sm:gap-1.5">
            {/* Day labels on left (L, M, V, D) aligned row-for-row */}
            <div className="flex flex-col gap-[2.5px] sm:gap-[3px] shrink-0 w-[12px] sm:w-[14px] text-[8px] font-bold text-[#71809A] dark:text-[#91a9c8]">
              {dayLabels.map((day, i) => (
                <span
                  key={i}
                  className="flex h-[11px] sm:h-[11.5px] lg:h-[12px] items-center justify-end pr-0.5 leading-none"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* 52 Week columns */}
            <div className="flex gap-[2.5px] sm:gap-[3px]">
              {weeksData.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[2.5px] sm:gap-[3px] shrink-0">
                  {week.map((cell, dIdx) => (
                    <button
                      key={dIdx}
                      type="button"
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      onClick={() => setHoveredCell(cell)}
                      className={`activity-cell activity-${cell.level} relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#3978F6]`}
                      aria-label={`${cell.dayName} ${cell.date} : niveau ${cell.level}, ${cell.sessions} sessions`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Streamlined Bottom Row: Tooltip or Summary + Legend */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf2f9] pt-1.5 text-xs text-[#526484] dark:border-[#172a48] dark:text-[#94a3b8]">
        {/* Dynamic Tooltip Info */}
        <div className="flex items-center gap-1.5">
          {hoveredCell ? (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#172033] dark:text-white">
                {hoveredCell.dayName} {hoveredCell.date} :
              </span>
              {hoveredCell.sessions > 0 ? (
                <>
                  <span className="font-semibold text-[#2866dc] dark:text-[#74a5ff]">
                    {hoveredCell.sessions} session{hoveredCell.sessions > 1 ? 's' : ''} ({hoveredCell.duration})
                  </span>
                  {hoveredCell.subject && (
                    <span className="rounded bg-white/80 px-1.5 py-0.2 text-xs font-medium shadow-xs dark:bg-[#1a2d4f] dark:text-[#cbd5e1]">
                      {hoveredCell.subject}
                    </span>
                  )}
                </>
              ) : (
                <span className="italic text-[#94a3b8]">Repos</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[#71809A] dark:text-[#91a9c8]">
              <Award className="size-3.5 text-amber-500" strokeWidth={1.75} />
              <span>Survolez un jour pour afficher la durée et les sessions.</span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 text-xs text-[#71809A] dark:text-[#91a9c8]">
          <span className="mr-0.5">Moins</span>
          <span className="size-2.5 rounded-[2px] bg-[#edf4ff] border border-black/10 dark:bg-[#102342] dark:border-white/10" title="Niveau 0 (0 min)" />
          <span className="size-2.5 rounded-[2px] bg-[#b8d2ff] dark:bg-[#1a396d]" title="Niveau 1 (35 min)" />
          <span className="size-2.5 rounded-[2px] bg-[#76a7ff] dark:bg-[#2558a8]" title="Niveau 2 (1h15)" />
          <span className="size-2.5 rounded-[2px] bg-[#3978f6] dark:bg-[#3b82f6]" title="Niveau 3 (2h10)" />
          <span className="size-2.5 rounded-[2px] bg-[#1958cf] dark:bg-[#60a5fa]" title="Niveau 4 (3h30)" />
          <span className="ml-0.5">Plus</span>
        </div>
      </div>
    </section>
  )
}
