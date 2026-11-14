import { prisma } from './db'
import { daysBetween, localDate } from './streak'

const subjects = { MATH: 'Mathématiques', PHYS: 'Physique', SI: 'Sciences de l’ingénieur', INFO: 'Informatique' }

export async function dashboard(userId: string) {
  const today = localDate(new Date())
  const start = new Date(`${today.slice(0, 4)}-01-01T00:00:00Z`)
  const [logs, savedStreak] = await prisma.$transaction([
    prisma.dailyActivityLog.findMany({ where: { userId, activityDate: { gte: start, lte: new Date(`${today}T00:00:00Z`) } }, orderBy: { activityDate: 'desc' } }),
    prisma.userStreak.findUnique({ where: { userId } }),
  ])
  const totals = { studyMinutes: 0, lessonsRead: 0, exercisesSolved: 0, problemsWritten: 0, qcmCompleted: 0 }
  const bySubject = Object.entries(subjects).map(([code, name]) => ({ code, name, studyMinutes: 0, lessonsRead: 0, exercisesSolved: 0 }))
  const heatmap = new Map<string, number>()
  for (const log of logs) {
    for (const key of Object.keys(totals) as (keyof typeof totals)[]) totals[key] += log[key]
    const subject = bySubject.find(item => item.code === log.subjectCode)!
    subject.studyMinutes += log.studyMinutes
    subject.lessonsRead += log.lessonsRead
    subject.exercisesSolved += log.exercisesSolved
    const date = log.activityDate.toISOString().slice(0, 10)
    heatmap.set(date, (heatmap.get(date) || 0) + log.studyMinutes)
  }
  const lastActive = savedStreak?.lastActiveDate?.toISOString().slice(0, 10)
  return {
    today, year: Number(today.slice(0, 4)), totals, subjects: bySubject,
    streak: { current: lastActive && daysBetween(lastActive, today) <= 1 ? savedStreak!.currentStreak : 0, longest: savedStreak?.longestStreak || 0 },
    heatmap: [...heatmap].map(([date, minutes]) => ({ date, minutes })),
    recent: logs.slice(0, 8).map(log => ({ date: log.activityDate.toISOString().slice(0, 10), subject: subjects[log.subjectCode], minutes: log.studyMinutes, lessons: log.lessonsRead, exercises: log.exercisesSolved })),
  }
}
