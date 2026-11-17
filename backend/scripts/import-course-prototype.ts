import '../packages/common/src/env'
import { createHash } from 'node:crypto'
import { open } from 'node:fs/promises'
import { coursePrototype } from '../content/courses/prototype'
import { pdfUrl, sectionsLatex } from '../content/courses/format'
import { prisma } from '../services/catalog-course-service/src/db'
import { cpgeProgramme } from '../../frontend/lib/cpge-programme'

const subjects = { MATH: 'Mathématiques', PHYS: 'Physique-Chimie', SI: 'Sciences industrielles de l’ingénieur' }
const programmeSubjects = { MATH: 'maths', PHYS: 'physique', SI: 'si' } as const

function stableId(key: string) {
  const hash = createHash('sha256').update('nexora-course-prototype:' + key).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`
}

async function requirePdf(url: string) {
  const handle = await open(new URL('../../frontend/public' + url, import.meta.url), 'r')
  try {
    const header = Buffer.alloc(5)
    await handle.read(header, 0, 5, 0)
    if (header.toString() !== '%PDF-') throw new Error('PDF invalide : ' + url)
  } finally { await handle.close() }
}

try {
  for (const course of coursePrototype) {
    await requirePdf(pdfUrl(course.slug, 'cours'))
    for (const exercise of course.exercises) {
      await requirePdf(pdfUrl(course.slug, exercise.ref + '-enonce'))
      await requirePdf(pdfUrl(course.slug, exercise.ref + '-corrige'))
    }
  }
  await prisma.$transaction(async tx => {
    for (const course of coursePrototype) {
      const chapterTitles = cpgeProgramme[programmeSubjects[course.subject]][course.level === 'SUP' ? 'sup' : 'spe']
      const orderIndex = chapterTitles.indexOf(course.title) + 1
      if (orderIndex === 0) throw new Error('Chapitre absent du programme : ' + course.title)
      const subject = await tx.subject.upsert({
        where: { code: course.subject }, update: {},
        create: { code: course.subject, name: subjects[course.subject], coeffMP: 1, coeffPSI: 1, coeffTSI: 1 },
      })
      const key = { subjectId: subject.id, studyLevel: course.level, title: course.title }
      const chapterId = stableId(course.slug + ':chapter')
      const existing = await tx.chapter.findFirst({ where: key, orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }] })
      const chapter = existing ?? await tx.chapter.upsert({
        where: { id: chapterId }, update: {},
        create: { id: chapterId, ...key, domainName: course.domain, targetFilieres: [course.level === 'SUP' ? 'MPSI' : 'MP'], orderIndex },
      })
      const lessonId = stableId(course.slug + ':lesson')
      const lesson = {
        chapterId: chapter.id, title: course.title, estimatedDurationMin: course.minutes, orderIndex: 1,
        contentLatex: sectionsLatex(course.sections), coursePdfUrl: pdfUrl(course.slug, 'cours'),
        editorial: { source: course.source ? { ...course.source } : null, summary: course.summary, legacyId: course.legacyId ?? null, quiz: course.quiz },
      }
      await tx.lesson.upsert({ where: { id: lessonId }, create: { id: lessonId, ...lesson }, update: lesson })
      for (const [position, exercise] of course.exercises.entries()) {
        const definition = {
          lessonId, difficulty: exercise.difficulty, statementLatex: exercise.statement, hintsLatex: exercise.hints,
          solutionLatex: sectionsLatex(exercise.solution),
          statementPdfUrl: pdfUrl(course.slug, exercise.ref + '-enonce'), corrPdfUrl: pdfUrl(course.slug, exercise.ref + '-corrige'),
          editorial: { title: exercise.title, locator: exercise.locator ?? null, url: exercise.url ?? null, position },
        }
        await tx.exercise.upsert({ where: { ref: exercise.ref }, create: { ref: exercise.ref, ...definition }, update: definition })
      }
    }
  }, { timeout: 20000 })
  console.log(`${coursePrototype.length} leçons et ${coursePrototype.reduce((total, course) => total + course.exercises.length, 0)} exercices importés.`)
} finally { await prisma.$disconnect() }
