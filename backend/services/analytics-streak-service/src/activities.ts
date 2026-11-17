import { z } from 'zod'
import { prisma } from './db'
import { localDate, updateStreak } from './streak'

const subjectCode = z.enum(['MATH', 'PHYS', 'SI', 'INFO', 'LANG'])
const itemId = z.string().trim().min(1).max(512)
const eventId = z.uuid()
const documentFields = { documentId: itemId, title: z.string().trim().min(1).max(500) }
const documentInput = z.discriminatedUnion('section', [
  z.strictObject({ ...documentFields, section: z.literal('cours'), part: z.enum(['course', 'td']) }),
  z.strictObject({ ...documentFields, section: z.literal('ressources'), part: z.enum(['course', 'td']) }),
  z.strictObject({ ...documentFields, section: z.literal('annales'), part: z.enum(['statement', 'correction']) }),
  z.strictObject({ ...documentFields, section: z.literal('problemes'), part: z.enum(['statement', 'correction']) }),
])

export const activityInput = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('document_opened'), eventId, subjectCode, document: documentInput }),
  z.strictObject({ type: z.literal('study_minute'), eventId, subjectCode }),
  z.strictObject({ type: z.literal('exercise_solved'), itemId, subjectCode }),
  z.strictObject({ type: z.literal('copy_submitted'), itemId, subjectCode }),
  z.strictObject({ type: z.literal('qcm_completed'), eventId, subjectCode }),
])

export async function recordActivity(userId: string, activity: z.infer<typeof activityInput>) {
  await prisma.$transaction(async tx => {
    // Serialize writes to a student's counters and history, including the first event.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`
    const now = new Date()
    const today = localDate(now)
    const activityDate = new Date(`${today}T00:00:00Z`)
    const key = 'eventId' in activity
      ? `${activity.type}:${activity.eventId}`
      : `${activity.type}:${today}:${activity.itemId}`
    const receipt = await tx.activityReceipt.createMany({ data: { userId, key }, skipDuplicates: true })
    if (receipt.count === 0) return

    let lessonsRead = 0
    const { subjectCode } = activity
    if (activity.type === 'document_opened') {
      const { section, documentId, part, title } = activity.document
      const documentKey = { userId, section, documentId, part }
      const where = { userId_section_documentId_part: documentKey }
      if (part === 'course') {
        const previous = await tx.recentDocument.findUnique({ where, select: { openedAt: true } })
        if (!previous || localDate(previous.openedAt) !== today) lessonsRead = 1
      }
      const details = { title, subjectCode, openedAt: now }
      await tx.recentDocument.upsert({ where, create: { ...documentKey, ...details }, update: details })
    }

    const counters = {
      lessonsRead,
      exercisesSolved: Number(activity.type === 'exercise_solved'),
      problemsWritten: Number(activity.type === 'copy_submitted'),
      qcmCompleted: Number(activity.type === 'qcm_completed'),
      studyMinutes: Number(activity.type === 'study_minute'),
    }
    const log = { userId, activityDate, subjectCode }
    await tx.dailyActivityLog.upsert({
      where: { userId_activityDate_subjectCode: log },
      create: { ...log, ...counters },
      update: {
        lessonsRead: { increment: counters.lessonsRead },
        exercisesSolved: { increment: counters.exercisesSolved },
        problemsWritten: { increment: counters.problemsWritten },
        qcmCompleted: { increment: counters.qcmCompleted },
        studyMinutes: { increment: counters.studyMinutes },
      },
    })

    const saved = await tx.userStreak.findUnique({ where: { userId } })
    const lastActiveDate = saved?.lastActiveDate?.toISOString().slice(0, 10) ?? null
    if (lastActiveDate === today) return
    const streak = updateStreak({ currentStreak: saved?.currentStreak ?? 0, longestStreak: saved?.longestStreak ?? 0, lastActiveDate }, today)
    const values = { currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, lastActiveDate: activityDate }
    await tx.userStreak.upsert({ where: { userId }, create: { userId, ...values }, update: values })
  })
}
