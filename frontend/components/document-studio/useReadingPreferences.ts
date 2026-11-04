"use client"

// Gestion centralisée des préférences de lecture (zoom, disposition, panneaux),
// des signets et de la dernière position de lecture — persistées dans localStorage.
import { useCallback, useEffect, useState } from "react"
import type { SidebarPanel, StudioLayout, StudioMode, ZoomMode } from "./modes"

const PREFS_KEY = "document-studio:prefs:v1"
const BOOKMARKS_KEY = "document-studio:bookmarks:v1"
const POSITIONS_KEY = "document-studio:positions:v1"

export interface ReadingPreferences {
  zoomMode: ZoomMode
  scale: number
  layout: StudioLayout
  sidebarOpen: Record<StudioMode, boolean>
  panel: SidebarPanel
}

const DEFAULT_PREFS: ReadingPreferences = {
  zoomMode: "fit-width",
  scale: 1,
  layout: "continuous",
  sidebarOpen: { study: true, exam: false },
  panel: "pages",
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* stockage plein ou désactivé : on ignore */
  }
}

export function useReadingPreferences() {
  // Valeurs par défaut au premier rendu (SSR-safe), puis hydratation depuis localStorage
  const [prefs, setPrefs] = useState<ReadingPreferences>(DEFAULT_PREFS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = readJSON(PREFS_KEY, DEFAULT_PREFS)
    setPrefs({ ...stored, sidebarOpen: { ...DEFAULT_PREFS.sidebarOpen, ...stored.sidebarOpen } })
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) writeJSON(PREFS_KEY, prefs)
  }, [prefs, hydrated])

  const update = useCallback((patch: Partial<ReadingPreferences> | ((p: ReadingPreferences) => Partial<ReadingPreferences>)) => {
    setPrefs((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }))
  }, [])

  return { prefs, update, hydrated }
}

export function useBookmarks(docUrl: string) {
  const [bookmarks, setBookmarks] = useState<number[]>([])

  useEffect(() => {
    const all = readJSON<Record<string, number[]>>(BOOKMARKS_KEY, {})
    setBookmarks(all[docUrl] ?? [])
  }, [docUrl])

  const toggle = useCallback(
    (page: number) => {
      setBookmarks((prev) => {
        const next = prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page].sort((a, b) => a - b)
        const all = readJSON<Record<string, number[]>>(BOOKMARKS_KEY, {})
        all[docUrl] = next
        writeJSON(BOOKMARKS_KEY, all)
        return next
      })
    },
    [docUrl]
  )

  return { bookmarks, toggle }
}

export function readLastPosition(docUrl: string): number | null {
  const all = readJSON<Record<string, number>>(POSITIONS_KEY, {})
  return typeof all[docUrl] === "number" ? all[docUrl] : null
}

export function saveLastPosition(docUrl: string, page: number) {
  const all = readJSON<Record<string, number>>(POSITIONS_KEY, {})
  all[docUrl] = page
  writeJSON(POSITIONS_KEY, all)
}
