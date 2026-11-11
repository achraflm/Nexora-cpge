'use client'

import { BookOpen, FileText, PenLine } from 'lucide-react'
import type { CourseDocument, PdfCourseChapter } from '@/lib/pdf-course-chapters'

export function PdfCourseChapterCard({ chapter, onOpen }: {
  chapter: PdfCourseChapter
  onOpen: (document: CourseDocument) => void
}) {
  const { course, td } = chapter
  return (
    <article className="glowing-card flex flex-col justify-between rounded-3xl border border-slate-200/90 p-6 shadow-xl dark:border-white/10">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-md bg-blue-500/15 px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">{course.level === 'SUP' ? 'Sup' : 'Spé'} · {course.category}</span>
          <FileText size={19} className="text-blue-500" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-lg font-bold leading-snug text-slate-900 dark:text-white">{course.title}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{course.localPdfUrl ? 'Cours PDF · Lecture intégrée dans Nexora' : 'Le document PDF de ce cours est momentanément indisponible.'}</p>
        {td && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">TD associé : {td.title.replace('Exercices — ', '').replace('Exercices et problèmes — ', '')}</p>}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Source : {course.sourceName}</p>
      </div>
      <div className="mt-6 grid gap-3 border-t border-slate-200/80 pt-4 sm:grid-cols-2 dark:border-white/10">
        <button type="button" disabled={!course.localPdfUrl} onClick={() => onOpen(course)} className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-xs font-bold text-blue-700 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-300">
          <BookOpen size={16} aria-hidden="true" />{course.localPdfUrl ? 'Ouvrir Partie Cours' : 'Cours PDF indisponible'}
        </button>
        <button type="button" disabled={!td?.localPdfUrl} onClick={() => td && onOpen(td)} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400">
          <PenLine size={16} aria-hidden="true" />{td?.localPdfUrl ? 'Ouvrir Partie TD' : td ? 'TD PDF indisponible' : 'TD non disponible'}
        </button>
      </div>
    </article>
  )
}
