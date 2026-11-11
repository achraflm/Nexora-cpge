import resources from './catalog-sample.json'

export type CourseDocument = Omit<(typeof resources)[number], 'localPdfUrl'> & { localPdfUrl: string | null }
export interface PdfCourseChapter {
  id: string
  course: CourseDocument
  td?: CourseDocument
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
  return pdfCourseChapters.filter(chapter => chapter.course.subject === subjects[subjectId] && chapter.course.level === level.toUpperCase())
}
