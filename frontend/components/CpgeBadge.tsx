'use client'

import { useEffect, useState } from 'react'

export const cpgeBadges = [
  { id: 'MP', label: 'Major MP*' },
  { id: 'PC', label: 'Physicienne' },
  { id: 'INF', label: 'Informatique' },
  { id: 'SII', label: 'Ingénieur SII' },
  { id: 'CNC', label: 'Lauréat CNC' },
] as const
export type CpgeBadgeId = typeof cpgeBadges[number]['id']

const key = (id: string) => `nexora:cpge-badge:${id}`
export function readCpgeBadge(id: string) {
  try {
    const value = window.localStorage.getItem(key(id))
    return cpgeBadges.find(badge => badge.id === value)?.id ?? ''
  } catch { return '' }
}
export function saveCpgeBadge(id: string, badge: CpgeBadgeId | '') {
  if (badge) window.localStorage.setItem(key(id), badge)
  else window.localStorage.removeItem(key(id))
  window.dispatchEvent(new Event('nexora-badge-updated'))
}

export function CpgeBadge({ badge, userId }: { badge?: CpgeBadgeId | ''; userId?: string }) {
  const [saved, setSaved] = useState<CpgeBadgeId | ''>('')
  useEffect(() => {
    if (!userId) return
    const sync = () => setSaved(readCpgeBadge(userId))
    sync()
    window.addEventListener('nexora-badge-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('nexora-badge-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [userId])
  const item = cpgeBadges.find(option => option.id === (badge ?? saved))
  if (!item) return null
  return <span title={item.label} aria-label={item.label} className="inline-flex shrink-0 items-center rounded-md border border-indigo-500/25 bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-bold leading-none text-indigo-600 dark:text-indigo-300">{item.id}</span>
}
