import resources from './catalog-sample.json'
import { cpgeProgramme, programmeSources } from './cpge-programme'

export type CourseDocument = Omit<(typeof resources)[number], 'localPdfUrl'> & { localPdfUrl: string | null }
export interface PdfCourseChapter {
  id: string
  course: CourseDocument
  td?: CourseDocument
  planned?: boolean
}

// Pair only related TD with their course; never fabricate missing documents.
const tdPairs: Record<string, string> = {
  'ensembles-et-applications': 'exercices-logique-et-ensembles',
  'reduction-dendomorphismes': 'exercices-reduction-des-endomorphismes',
  'circuits-lineaires': 'exoprob-courant-continu-1',
  'effet-dun-filtre-sur-un-signal-periodique': 'exoprob-fourier-et-filtrage',
}
const slug = (url: string) => new URL(url).pathname.split('/').filter(Boolean).at(-1)!
const subjects = { maths: 'MATH', physique: 'PHYS', si: 'SI', info: 'INFO' } as const

export const pdfCourseChapters: PdfCourseChapter[] = resources.filter(resource => resource.type === 'COURSE').map(course => ({
  id: `pdf-${course.subject}-${course.level}-${slug(course.sourceUrl)}`,
  course,
  td: resources.find(resource => resource.type === 'TD' && resource.subject === course.subject && resource.level === course.level && slug(resource.sourceUrl) === tdPairs[slug(course.sourceUrl)]),
}))

export function getPdfCourseChapters(subjectId: keyof typeof subjects, level: 'sup' | 'spe') {
  const existing = pdfCourseChapters.filter(chapter => chapter.course.subject === subjects[subjectId] && chapter.course.level === level.toUpperCase())
  const normalize = (title: string) => title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
  const remaining = new Set(existing)
  const chapters: PdfCourseChapter[] = cpgeProgramme[subjectId][level].map((title, index) => {
    const match = existing.find(chapter => normalize(chapter.course.title) === normalize(title))
    if (match) { remaining.delete(match); return match }
    const course: CourseDocument = {
      subject: subjects[subjectId], level: level.toUpperCase(), type: 'COURSE',
      title, category: 'Programme ' + (level === 'sup' ? 'MPSI' : 'MP'),
      sourceName: 'Programme ministériel CPGE Maroc', sourceUrl: programmeSources[level],
      orderIndex: index + 1, localPdfUrl: null, downloadStatus: 'not_added', pdfSourceUrl: '',
    }
    return {
      id: `programme-${subjectId}-${level}-${normalize(title)}`, course, planned: true,
      td: { ...course, title: `TD — ${title}`, type: 'TD' },
    }
  })
  return [...chapters, ...remaining]
}
