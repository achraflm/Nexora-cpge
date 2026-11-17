import { Router } from 'express'
import { z } from 'zod'
import { currentUser, HttpError, requireUser } from '@cnc/common'
import { Prisma } from './generated/prisma'
import { prisma } from './db'
import { materialFields, materialOrder } from './chapter-materials'

export const publishedCourses = Router()
publishedCourses.use(requireUser(), (_req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-store')
  next()
})

const editorial = { not: Prisma.DbNull }
const filters = z.strictObject({
  subject: z.enum(['MATH', 'PHYS', 'SI', 'INFO', 'CHEM']).optional(),
  level: z.enum(['SUP', 'SPE']).optional(),
  filiere: z.enum(['MPSI', 'MP', 'PSI', 'TSI']).optional(),
})

publishedCourses.get('/chapters', async (req, res) => {
  const { subject, level, filiere } = filters.parse(req.query)
  const chapters = await prisma.chapter.findMany({
    where: {
      subject: subject ? { code: subject } : undefined,
      studyLevel: level,
      targetFilieres: filiere ? { has: filiere } : undefined,
      lessons: { some: { editorial } },
    },
    orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }],
    include: {
      subject: { select: { code: true } },
      lessons: {
        where: { editorial },
        orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }],
        include: {
          exercises: {
            where: { editorial },
            orderBy: { ref: 'asc' },
            include: {
              attempts: {
                where: { userId: currentUser(req).id },
                select: { resolutionStatus: true },
                orderBy: [{ attemptedAt: 'desc' }, { id: 'desc' }],
                take: 1,
              },
            },
          },
        },
      },
    },
  })
  const materials = filiere === 'PSI' || filiere === 'TSI' ? [] : await prisma.chapterMaterial.findMany({
    where: { status: 'PUBLISHED', subject, level, AND: filiere ? [{ level: filiere === 'MPSI' ? 'SUP' : 'SPE' }] : undefined },
    select: materialFields,
    orderBy: [...materialOrder],
  })
  res.json({ chapters, materials })
})

const attemptInput = z.strictObject({
  resolutionStatus: z.enum(['MASTERED', 'WITH_HINT', 'TO_REVIEW']),
  usedMode: z.enum(['BIBMATH', 'PDF']),
  hintUsed: z.boolean(),
})

publishedCourses.post('/exercises/:id/attempts', requireUser('STUDENT'), async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const attempt = attemptInput.parse(req.body)
  const exercise = await prisma.exercise.findFirst({
    where: { id, editorial, lesson: { editorial } },
    select: { id: true },
  })
  if (!exercise) throw new HttpError(404, 'Exercice indisponible.', 'NOT_FOUND')
  await prisma.exerciseAttempt.create({
    data: { ...attempt, exerciseId: id, userId: currentUser(req).id, timeSpentSec: 0 },
  })
  res.sendStatus(204)
})
