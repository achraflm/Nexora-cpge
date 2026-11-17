import type { CourseItem, CourseSection } from '@/components/CourseExerciseQcmDoubleMode'
import type { CourseDocument } from './pdf-course-chapters'
import { studySubjects } from './study-activity'
import { programmeChapters, programmeSubjects } from './cpge-programme'
import type { ChapterMaterial } from './chapter-materials'

export interface PublishedSource {
  book: string
  author: string
  url: string
  license: string
  licenseUrl: string
  attributionUrl?: string
}

type ResolutionStatus = 'MASTERED' | 'WITH_HINT' | 'TO_REVIEW'
const evaluationLabels = { MASTERED: 'mastered', WITH_HINT: 'with_help', TO_REVIEW: 'review' } as const
const subjectIds = { MATH: 'maths', PHYS: 'physique', SI: 'si', INFO: 'info', CHEM: 'physique' } as const
type Rating = typeof evaluationLabels[ResolutionStatus]
const resolutionStatuses = { mastered: 'MASTERED', with_help: 'WITH_HINT', review: 'TO_REVIEW' } as const

interface CatalogChapter {
  subject: { code: keyof typeof subjectIds }
  orderIndex: number
  studyLevel: 'SUP' | 'SPE'
  targetFilieres: string[]
  domainName: string
  lessons: {
    id: string
    title: string
    estimatedDurationMin: number
    contentLatex: string
    coursePdfUrl: string | null
    editorial: { source: PublishedSource | null; summary: string; legacyId: string | null;
      quiz: { question: string; answers: string[]; correct: number; explanation: string }[] }
    exercises: {
      id: string
      ref: string
      difficulty: number
      statementLatex: string
      hintsLatex: string[]
      solutionLatex: string
      statementPdfUrl: string | null
      corrPdfUrl: string | null
      editorial: { title: string; locator: string | null; url: string | null; position?: number }
      attempts: { resolutionStatus: ResolutionStatus }[]
    }[]
  }[]
}

function latexSections(text: string): CourseSection[] {
  const delimiters = text.split(/^\\section\*\{([^\r\n{}]+)\}[\t ]*\r?\n/gm)
  const sections: CourseSection[] = []
  for (let index = 1; index < delimiters.length; index += 2) {
    sections.push({ title: delimiters[index], content: delimiters[index + 1].trim() })
  }
  return sections
}

export async function getPublishedCourses(signal: AbortSignal): Promise<CourseItem[]> {
  const response = await fetch('/api/study', { signal, cache: 'no-store' })
  if (!response.ok) throw new Error('Les cours publiés sont momentanément indisponibles.')
  const { chapters, materials = [] }: { chapters: CatalogChapter[]; materials?: ChapterMaterial[] } = await response.json()
  const byChapter = new Map<string, ChapterMaterial[]>()
  for (const material of materials) {
    const key = chapterKey(material.subject, material.level, material.chapterTitle)
    const entries = byChapter.get(key) ?? []
    entries.push(material)
    byChapter.set(key, entries)
  }
  const courses: CourseItem[] = chapters.flatMap(chapter => chapter.lessons.map(lesson => {
    const { source, summary, quiz, legacyId } = lesson.editorial
    const fileName = lesson.coursePdfUrl?.split('/').at(-1) ?? ''
    const key = chapterKey(chapter.subject.code, chapter.studyLevel, lesson.title)
    const chapterMaterials = byChapter.get(key)
    byChapter.delete(key)
    return {
      id: lesson.id, subjectId: subjectIds[chapter.subject.code], level: chapter.studyLevel === 'SUP' ? 'sup' : 'spe',
      title: lesson.title, chapterNumber: chapter.orderIndex, subTitle: chapter.domainName, stream: chapter.targetFilieres.join(' · '),
      durationEstimate: `${lesson.estimatedDurationMin} min`, summary,
      difficultyStars: Math.max(1, ...lesson.exercises.map(exercise => exercise.difficulty)),
      pdfInfo: { fileName, officialTitle: lesson.title, epreuve: '', session: '', duration: '', totalPages: 0 },
      theorySections: latexSections(lesson.contentLatex),
      published: { source, pdfUrl: lesson.coursePdfUrl, legacyId },
      chapterMaterials,
      exercises: [...lesson.exercises].sort((a, b) => (a.editorial.position ?? 0) - (b.editorial.position ?? 0)).map(exercise => ({
        id: exercise.id, refCode: exercise.ref, title: exercise.editorial.title,
        source: source && exercise.editorial.locator ? `${source.book} · ${exercise.editorial.locator}` : '', difficultyStars: exercise.difficulty,
        statement: exercise.statementLatex, hints: exercise.hintsLatex,
        solutionSteps: latexSections(exercise.solutionLatex).map(section => ({ stepTitle: section.title, content: section.content })),
        evalStatus: exercise.attempts[0] ? evaluationLabels[exercise.attempts[0].resolutionStatus] : undefined,
        published: { sourceUrl: exercise.editorial.url, statementPdfUrl: exercise.statementPdfUrl, correctionPdfUrl: exercise.corrPdfUrl },
      })),
      qcmQuestions: quiz.map((entry, index) => ({
        id: `${lesson.id}-qcm-${index}`, questionText: entry.question, explanation: entry.explanation,
        options: entry.answers.map((answer, option) => ({ id: String(option), label: 'ABC'[option], math: answer })),
        correctOptionId: String(entry.correct), published: true,
      })),
    }
  }))
  for (const entries of byChapter.values()) {
    const { subject, level, chapterTitle } = entries[0]
    const chapterNumber = programmeChapters(subject, level).indexOf(chapterTitle) + 1
    if (chapterNumber === 0) continue
    courses.push({
      id: 'chapter-' + chapterKey(subject, level, chapterTitle), subjectId: programmeSubjects[subject],
      level: level === 'SUP' ? 'sup' : 'spe', title: chapterTitle, chapterNumber, subTitle: '',
      stream: level === 'SUP' ? 'MPSI' : 'MP', durationEstimate: '', difficultyStars: 0, summary: '',
      pdfInfo: { fileName: '', officialTitle: chapterTitle, epreuve: '', session: '', duration: '', totalPages: 0 },
      theorySections: [], exercises: [], qcmQuestions: [],
      published: { source: null, pdfUrl: null, legacyId: null }, chapterMaterials: entries,
    })
  }
  return courses
}

function chapterKey(subject: string, level: string, title: string) {
  return [subject, level, title].join('/')
}

export async function saveExerciseRating(id: string, rating: Rating, hintUsed: boolean, usedPdf: boolean) {
  const response = await fetch(`/api/study?exercise=${encodeURIComponent(id)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolutionStatus: resolutionStatuses[rating], hintUsed, usedMode: usedPdf ? 'PDF' : 'BIBMATH' }),
  })
  if (!response.ok) throw new Error('Auto-évaluation non enregistrée. Réessayez.')
}

export function publishedPdf(course: CourseItem, title: string, pdfUrl: string, type: 'COURSE' | 'TD'): CourseDocument {
  return {
    subject: studySubjects[course.subjectId], level: course.level === 'sup' ? 'SUP' : 'SPE', category: course.subTitle,
    type, title, sourceUrl: course.published?.source?.url ?? '', sourceName: course.published?.source?.author ?? '',
    orderIndex: course.chapterNumber, localPdfUrl: pdfUrl, pdfSourceUrl: '', downloadStatus: 'available',
  }
}
