'use client'

import { useState } from 'react'
import { Calendar, Zap, Award } from 'lucide-react'
import { StreakBadge } from '@/components/ui/streak-badge'

interface ActivityCellData {
  date: string
  dayName: string
  level: number
  active: boolean
  duration: string
}

export function ActivityBar({activity=[],today=new Date().toISOString().slice(0,10),streak=0}:{activity?:{date:string;minutes:number}[];today?:string;streak?:number}) {
  const [hoveredCell, setHoveredCell] = useState<ActivityCellData | null>(null)

 const dayLabels=['L','','M','','V','','D']
 const names=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']
 const year=Number(today.slice(0,4)), start=new Date(Date.UTC(year,0,1))
 start.setUTCDate(start.getUTCDate()-((start.getUTCDay()+6)%7))
 const weeks=Math.ceil((Date.UTC(year+1,0,1)-start.getTime())/(7*86400000))
 const lookup=new Map(activity.map(d=>[d.date,d.minutes]))
 const monthMilestones:Record<number,string>={}
 let month=-1
 const weeksData:ActivityCellData[][]=Array.from({length:weeks},(_,w)=>Array.from({length:7},(_,d)=>{
 const date=new Date(start);date.setUTCDate(start.getUTCDate()+w*7+d)
 const key=date.toISOString().slice(0,10), minutes=date.getUTCFullYear()===year && key<=today ? lookup.get(key)||0 : 0
 const active=key<=today && date.getUTCFullYear()===year && lookup.has(key)
 if(date.getUTCFullYear()===year && month!==date.getUTCMonth()){monthMilestones[w]=date.toLocaleDateString('fr-FR',{month:'short',timeZone:'UTC'});month=date.getUTCMonth()}
 return {date:key,dayName:names[d],level:!active?0:minutes<45?1:minutes<90?2:minutes<150?3:4,active,duration:minutes ? `${minutes} min` : 'Moins d’une minute chronométrée'}
 }))
 const activeDays=activity.length
 const elapsed=Math.max(1,Math.floor((Date.parse(today)-Date.UTC(year,0,1))/86400000)+1)
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
            length={streak}
            frequency="daily"
            size="sm"
            className="w-auto flex-row gap-1.5 whitespace-nowrap rounded-xl border-amber-500/25 bg-amber-500/10 px-2 py-1 text-amber-800 [--muted-foreground:#92400e] [--primary:#b45309] dark:text-amber-200 dark:[--muted-foreground:#fde68a] dark:[--primary:#fbbf24] [&_svg]:size-3.5 [&>span:nth-child(2)]:text-xs"
          />
          <div className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20">
            <Zap className="size-3 text-blue-500 animate-pulse" strokeWidth={1.75} />
            <span>{activeDays} jours actifs</span>
          </div>
          <span className="hidden text-xs font-medium text-[#71809A] sm:inline dark:text-[#91a9c8]">
            • Assiduité : <strong>{Math.round(activeDays/elapsed*100)}%</strong>
          </span>
        </div>
      </div>

      {/* Compact Heatmap Grid with Exact Square Cells */}
      <div className="mt-2.5 flex w-full justify-start overflow-x-auto pb-1 pt-0.5 sm:justify-center">
        <div className="inline-flex flex-col">
          {/* Months labels row: aligned with the week columns */}
          <div className="mb-1 flex pl-4 sm:pl-5 gap-[2.5px] sm:gap-[3px] text-[8.5px] font-semibold text-[#71809A] dark:text-[#91a9c8]">
            {Array.from({ length: weeks }).map((_, wIdx) => (
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
                      onFocus={() => setHoveredCell(cell)}
                      className={`activity-cell activity-${cell.level} relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#3978F6]`}
                      aria-label={`${cell.dayName} ${cell.date} · ${cell.active ? cell.duration : 'Aucune activité'}`}
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
              {hoveredCell.active ? (
                <span className="font-semibold text-[#2866dc] dark:text-[#74a5ff]">{hoveredCell.duration}</span>
              ) : (
                <span className="italic text-[#94a3b8]">Repos</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[#71809A] dark:text-[#91a9c8]">
              <Award className="size-3.5 text-amber-500" strokeWidth={1.75} />
              <span>Sélectionnez un jour pour afficher la durée de révision.</span>
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
