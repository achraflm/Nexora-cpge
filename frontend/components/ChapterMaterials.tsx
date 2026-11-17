'use client'

import { FileText } from 'lucide-react'
import type { ChapterMaterial } from '@/lib/chapter-materials'
import { chapterLatexSections } from '@/lib/chapter-latex'
import { CourseLatex } from './CourseLatex'

export function ChapterLatexContent({ source }: { source: string }) {
  return <div className="space-y-4">
    {chapterLatexSections(source).map((section, index) => (
      <div key={index} className="space-y-2">
        {section.title && <div role="heading" aria-level={3} className="font-semibold"><CourseLatex value={section.title} /></div>}
        {section.content && <CourseLatex value={section.content} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300" />}
      </div>
    ))}
  </div>
}

export function ChapterMaterials({ entries, type, onOpenPdf }: {
  entries?: ChapterMaterial[]
  type: ChapterMaterial['type']
  onOpenPdf: (item: ChapterMaterial) => void
}) {
  const materials = entries?.filter(item => item.type === type) ?? []
  const pdfs = materials.filter(item => item.format === 'PDF')
  if (materials.length === 0) return null

  return <div className="space-y-5">
    {materials.map(item => item.format === 'LATEX' && item.latex && (
      <article key={item.id} className="glowing-card space-y-4 rounded-2xl p-5 shadow-lg sm:p-6">
        <h2 className="border-l-4 border-blue-500 pl-3 text-base font-bold">{item.title}</h2>
        <ChapterLatexContent source={item.latex} />
      </article>
    ))}
    {pdfs.length > 0 && <section className="glowing-card space-y-3 rounded-2xl p-5 shadow-lg sm:p-6" aria-label="Documents supplémentaires">
      <h2 className="text-base font-bold">Documents supplémentaires</h2>
      <ul className="space-y-2">
        {pdfs.map(item => <li key={item.id}>
          <button type="button" className="ui-button-secondary flex w-full justify-start text-left sm:w-auto" onClick={() => onOpenPdf(item)}>
            <FileText size={18} aria-hidden="true" />
            <span>{item.title}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">PDF</span>
          </button>
        </li>)}
      </ul>
    </section>}
  </div>
}
