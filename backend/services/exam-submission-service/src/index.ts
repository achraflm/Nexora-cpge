import { createServiceApp, currentUser, HttpError, notImplemented, portEnv, requireEnv, requireUser, startService } from '@cnc/common'
import { raw, Router, type Request } from 'express'
import { z } from 'zod'
import { prisma } from './db'

/**
 * exam-submission-service (CDC 3.1 - service 3) — Sprint 3.
 * Banque de problemes, annales CNC 2010-2026, chronometre, "Mes Problemes Rediges" (UC06, UC07).
 */
const router = Router()
const todo = notImplemented('Sprint 3')

const studyWorkPath = '/exams/study-work'
const workTarget = z.object({
  kind: z.enum(['td', 'concours', 'probleme']),
  resourceId: z.string().trim().min(1).max(500).refine(value => !value.includes('\0')),
})
const workContent = z.object({
  latex: z.string().transform(value => value.replace(/\r\n?/g, '\n').trim())
    .pipe(z.string().max(130_000).refine(value => !value.includes('\0'))),
  title: z.string().trim().min(1).max(240).refine(value => !value.includes('\0')).optional(),
  transcriptionStatus: z.enum(['ok', 'partial', 'limited']).nullish().transform(value => value ?? null),
})
const workFields = { kind: true, resourceId: true, title: true, photoType: true, updatedAt: true } as const
const imageLimit = 15 * 1024 * 1024
const imageExtensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

function publicWork<T extends { photoType: string | null; latex: string }>(work: T) {
  const { photoType, ...details } = work
  return { ...details, imageExtension: photoType ? imageExtensions[photoType] ?? null : null, hasLatex: Boolean(work.latex) }
}

function imageType(photo: Buffer) {
  if (photo.length < 16) return null
  if (photo.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg'
  if (photo.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png'
  if (photo.toString('ascii', 0, 4) === 'RIFF' && photo.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  return null
}

async function depositInput(req: Request) {
  if (!req.is('multipart/form-data')) {
    const content = workContent.parse(req.body)
    if (!content.latex) throw new HttpError(400, 'Copie manquante.')
    return content
  }
  const contentType = req.get('content-type')
  if (!contentType || !Buffer.isBuffer(req.body)) throw new HttpError(400, 'Copie manquante.')
  const form = await new Response(new Uint8Array(req.body), { headers: { 'Content-Type': contentType } }).formData()
    .catch(() => { throw new HttpError(400, 'Le dépôt ne peut pas être lu.') })
  const content = workContent.parse({ latex: form.get('latex') ?? '', title: form.get('title') ?? undefined, transcriptionStatus: form.get('transcriptionStatus') })
  const image = form.get('photo')
  if (image === null) {
    if (!content.latex) throw new HttpError(400, 'Copie manquante.')
    return content
  }
  if (!(image instanceof File) || image.size === 0 || image.size > imageLimit) throw new HttpError(400, 'Photo absente ou trop volumineuse.')
  const photo = Buffer.from(await image.arrayBuffer())
  const photoType = imageType(photo)
  if (!photoType || photoType !== image.type) throw new HttpError(415, 'Format de photo non reconnu.')
  return { ...content, photo, photoType }
}

router.use(studyWorkPath, requireUser(), (_req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-store')
  next()
})
router.get(studyWorkPath, async (req, res) => {
  const userId = currentUser(req).id
  if (!Object.hasOwn(req.query, 'kind') && !Object.hasOwn(req.query, 'resourceId')) {
    const works = await prisma.studyWork.findMany({ where: { userId }, select: { ...workFields, latex: true }, orderBy: { updatedAt: 'desc' } })
    res.json(works.map(work => {
      const { latex: _latex, ...metadata } = publicWork(work)
      return metadata
    }))
    return
  }
  const key = { userId, ...workTarget.parse(req.query) }
  const work = await prisma.studyWork.findUnique({
    where: { userId_kind_resourceId: key },
    select: { ...workFields, latex: true, transcriptionStatus: true },
  })
  res.json(work ? publicWork(work) : null)
})
router.get(studyWorkPath + '/photo', async (req, res) => {
  const key = { userId: currentUser(req).id, ...workTarget.parse(req.query) }
  const work = await prisma.studyWork.findUnique({
    where: { userId_kind_resourceId: key }, select: { photo: true, photoType: true },
  })
  if (!work?.photo || !work.photoType || !imageExtensions[work.photoType]) throw new HttpError(404, 'Photo introuvable.')
  res.set('X-Content-Type-Options', 'nosniff')
  res.type(work.photoType).send(Buffer.from(work.photo))
})
router.put(studyWorkPath, raw({ type: 'multipart/form-data', limit: '16mb', inflate: false }), async (req, res) => {
  const key = { userId: currentUser(req).id, ...workTarget.parse(req.query) }
  const content = await depositInput(req)
  const work = await prisma.studyWork.upsert({
    where: { userId_kind_resourceId: key },
    update: content,
    create: { ...key, ...content },
    select: { ...workFields, latex: true, transcriptionStatus: true },
  })
  res.json(publicWork(work))
})

router.get('/exams', todo) // ?kind=CNC_ANNALE|PROBLEM&year&filiere&epreuve
router.get('/exams/:id', todo) // sans solution/bareme tant que non soumis
router.post('/exams/:id/sessions', todo) // UC07 etape 1 : demarrer une redaction (avec ou sans chrono)
router.post('/exams/sessions/:sessionId/submit', todo) // UC07 etapes 3-4 : soumettre -> archiver -> debloquer corrige
router.patch('/exams/submissions/:id', todo) // UC07 etape 5 : note d'auto-evaluation + notes perso
router.get('/exams/submissions/mine', todo) // portefeuille "Mes Problemes Rediges"

router.post('/exams', requireUser('ADMIN'), todo) // UC12 : publier une annale / un probleme
router.patch('/exams/:id', requireUser('ADMIN'), todo)

const app = createServiceApp({ name: 'exam-submission-service', internalSecret: requireEnv('INTERNAL_SECRET'), router })
startService(app, 'exam-submission-service', portEnv('EXAM_PORT', 4003))
