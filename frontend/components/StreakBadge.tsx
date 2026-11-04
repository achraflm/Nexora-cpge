'use client'

import React from 'react'

export interface StreakBadgeProps {
  /** Number of days in the streak (default: 12) */
  count?: number
  /** Visual variant: 'navbar' (compact with border), 'compact' (just badge), 'card' (larger with label), 'detailed' (full label) */
  variant?: 'navbar' | 'compact' | 'card' | 'detailed'
  /** Optional custom class name */
  className?: string
  /** Whether to show the "Streak" word */
  showLabel?: boolean
}

/**
 * Custom Biton Vector Flame Icon with subtle ambient glow and micro-pulsation.
 * Unifies the strokeWidth={1.75} design system without any native emojis.
 */
export function AnimatedFlameIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Ambient background glow */}
      <span className="absolute inset-0 rounded-full bg-amber-500/30 blur-[4px] animate-pulse pointer-events-none" />

      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-transform duration-300 group-hover:scale-110"
      >
        <defs>
          {/* Outer flame gradient: orange-red to fiery amber */}
          <linearGradient id="streakOuterFlame" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>

          {/* Inner ember core gradient: radiant yellow to warm amber */}
          <linearGradient id="streakInnerFlame" x1="12" y1="12" x2="12" y2="21" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Outer stylized flame body */}
        <path
          d="M12 2C9.5 5.5 8 8.5 8 11.5C8 13 8.6 14.3 9.5 15.3C8.5 14 7.5 12.3 7.5 10C5 12.5 4 15 4 17C4 20.3 7.6 22 12 22C16.4 22 20 20.3 20 17C20 13.5 17 9.5 14.5 7C14.5 9 13.5 10.5 12 11.5C12.8 9 13.2 6.5 12 2Z"
          fill="url(#streakOuterFlame)"
          fillOpacity="0.9"
          stroke="#ea580c"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />

        {/* Inner radiant ember heart */}
        <path
          d="M12 13C10.8 14.5 10 16 10 17.5C10 19.4 10.9 20.5 12 20.5C13.1 20.5 14 19.4 14 17.5C14 16 13.2 14.5 12 13Z"
          fill="url(#streakInnerFlame)"
          fillOpacity="0.95"
          className="animate-[pulse_2s_ease-in-out_infinite]"
        />
      </svg>
    </span>
  )
}

export function StreakBadge({
  count = 12,
  variant = 'compact',
  className = '',
  showLabel,
}: StreakBadgeProps) {
  const shouldShowLabel = showLabel !== undefined ? showLabel : variant === 'detailed' || variant === 'card'

  if (variant === 'navbar') {
    return (
      <div
        className={`group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-200 
        bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 
        border border-amber-500/35 text-amber-600 dark:text-amber-400 
        shadow-xs shadow-amber-500/10 ring-1 ring-inset ring-amber-500/25 
        hover:border-amber-500/55 hover:shadow-amber-500/20 hover:scale-105 cursor-pointer ${className}`}
        title={`Régularité de révision : ${count} jours consécutifs`}
      >
        <AnimatedFlameIcon size={14} />
        <span className="font-mono tracking-tight font-black">{count}j</span>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div
        className={`group flex items-center justify-between rounded-xl p-3 
        bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 
        border border-amber-500/30 ring-1 ring-inset ring-amber-500/20 
        backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-inset ring-amber-500/30">
            <AnimatedFlameIcon size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Régularité</p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {count} jours <span className="text-xs font-normal text-slate-500">consécutifs</span>
            </p>
          </div>
        </div>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-300 border border-amber-500/30">
          En feu
        </span>
      </div>
    )
  }

  // Default 'compact' or 'detailed'
  return (
    <div
      className={`group inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all duration-200 
      bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 
      border border-amber-500/35 text-amber-700 dark:text-amber-300 
      shadow-xs ring-1 ring-inset ring-amber-500/25 
      hover:border-amber-500/55 hover:scale-105 cursor-pointer select-none ${className}`}
      title={`${count} jours de révision consécutifs`}
    >
      <AnimatedFlameIcon size={13} />
      <span>{shouldShowLabel ? `Streak : ${count}j` : `${count}j`}</span>
    </div>
  )
}

export default StreakBadge
