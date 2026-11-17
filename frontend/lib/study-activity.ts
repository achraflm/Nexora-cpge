'use client'

import { useEffect } from 'react'

export type StudySubject = 'MATH' | 'PHYS' | 'SI' | 'INFO' | 'LANG'
export const studySubjects = { maths: 'MATH', physique: 'PHYS', si: 'SI', info: 'INFO', langues: 'LANG' } as const

export type DocumentReference = { documentId: string } & (
  | { section: 'cours' | 'ressources'; part: 'course' | 'td' }
  | { section: 'annales' | 'problemes'; part: 'statement' | 'correction' }
)
export type StudyDocument = DocumentReference & { title: string; subjectCode: StudySubject }
export type RecentDocument = DocumentReference & { title: string; subject: string; openedAt: string }

type Activity = { subjectCode: StudySubject } & (
  | { type: 'document_opened'; eventId: string; document: DocumentReference & { title: string } }
  | { type: 'study_minute' | 'qcm_completed'; eventId: string }
  | { type: 'exercise_solved' | 'copy_submitted'; itemId: string }
)

export const studyActivityEvent = 'nexora-study-activity'

export async function sendStudyActivity(activity: Activity) {
  const send = () => fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity),
    keepalive: true,
  })
  try {
    let response = await send().catch(() => null)
    if (!response || response.status >= 500) response = await send()
    if (response.ok) window.dispatchEvent(new Event(studyActivityEvent))
  } catch { /* La lecture et les exercices restent disponibles pendant une panne des statistiques. */ }
}

export function useStudyDocument(studyDocument: StudyDocument | undefined, ready: boolean) {
  const { subjectCode, section, documentId, part, title } = studyDocument ?? {}
  useEffect(() => {
    if (!ready || !subjectCode || !section || !documentId || !part || !title) return
    let opened = false
    let activeMs = 0
    let lastTick = performance.now()
    let lastInteraction = lastTick
    const open = () => {
      if (opened || document.visibilityState !== 'visible') return
      opened = true
      const reference = { section, documentId, part } as DocumentReference
      void sendStudyActivity({ type: 'document_opened', eventId: crypto.randomUUID(), subjectCode, document: { ...reference, title } })
    }
    const markInteraction = () => { lastInteraction = performance.now() }
    const resetClock = () => { lastTick = performance.now(); markInteraction(); open() }
    open()
    const timer = window.setInterval(() => {
      const now = performance.now()
      if (document.visibilityState === 'visible' && document.hasFocus() && now - lastInteraction < 300_000) {
        activeMs += Math.min(now - lastTick, 1000)
      }
      lastTick = now
      if (activeMs < 60_000) return
      activeMs -= 60_000
      void sendStudyActivity({ type: 'study_minute', eventId: crypto.randomUUID(), subjectCode })
    }, 1000)
    document.addEventListener('visibilitychange', resetClock)
    window.addEventListener('focus', resetClock)
    window.addEventListener('keydown', markInteraction)
    window.addEventListener('pointerdown', markInteraction)
    window.addEventListener('scroll', markInteraction, true)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', resetClock)
      window.removeEventListener('focus', resetClock)
      window.removeEventListener('keydown', markInteraction)
      window.removeEventListener('pointerdown', markInteraction)
      window.removeEventListener('scroll', markInteraction, true)
    }
  }, [ready, subjectCode, section, documentId, part, title])
}
