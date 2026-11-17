import { Router, type ErrorRequestHandler, type Request } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { currentUser, HttpError, requireUser } from '@cnc/common'
import { programmeChapters } from '../../../../frontend/lib/cpge-programme'
import { chapterLatexSections } from '../../../../frontend/lib/chapter-latex'
import { prisma } from './db'
import { detectDocument, MAX_FILE } from './resource-files'

export const chapterMaterials = Router()
export const materialFields = {
  id: true, subject: true, level: true, chapterTitle: true, type: true, title: true,
  format: true, status: true, latex: true, fileName: true, revision: true,
} as const
export const materialOrder = [{ createdAt: 'asc' }, { id: 'asc' }] as const

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE, fieldSize: 512 * 1024, files: 1, fields: 1, parts: 3 },
}).single('file')

const metadataSchema = z.strictObject({
  subject: z.enum(['MATH', 'PHYS', 'SI', 'INFO']),
  level: z.enum(['SUP', 'SPE']),
  chapterTitle: z.string().min(1).max(200),
  type: z.enum(['COURSE', 'TD']),
  title: z.string().trim().min(1).max(200),
  format: z.enum(['LATEX', 'PDF']),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  latex: z.string().trim().max(65_536).optional(),
  revision: z.int().positive().optional(),
})

async function readMaterial(req: Request, existing?: { format: 'LATEX' | 'PDF' }) {
  let raw: unknown
  try { raw = JSON.parse(req.body?.metadata) } catch { throw new HttpError(400, 'Métadonnées du chapitre invalides.') }
  const { latex, revision, ...metadata } = metadataSchema.parse(raw)
  if (!programmeChapters(metadata.subject, metadata.level).includes(metadata.chapterTitle)) {
    throw new HttpError(400, 'Sélectionnez un chapitre du programme de cette matière.')
  }
  if (existing && existing.format !== metadata.format) throw new HttpError(400, 'Le format d’un contenu existant est fixe.')

  if (metadata.format === 'LATEX') {
    if (req.file || !latex || !chapterLatexSections(latex).length) throw new HttpError(400, 'Saisissez le contenu LaTeX à afficher.')
    return { data: { ...metadata, latex }, revision }
  }

  const file = req.file
  if (latex || (!file && !existing)) throw new HttpError(400, 'Sélectionnez un fichier PDF.')
  if (!file) return { data: metadata, revision }
  const detected = await detectDocument(file.originalname, file.mimetype, file.buffer)
  if (detected.format !== 'PDF' || !file.buffer.subarray(-8192).includes('%%EOF')) {
    throw new HttpError(400, 'Le fichier doit être un PDF lisible.')
  }
  return { data: { ...metadata, pdf: new Uint8Array(file.buffer), fileName: file.originalname.slice(0, 200) }, revision }
}

chapterMaterials.use(requireUser(), (_req, res, next) => {
  res.set('Cache-Control', 'private, no-store')
  next()
})

chapterMaterials.get('/', requireUser('ADMIN'), async (_req, res) => {
  const materials = await prisma.chapterMaterial.findMany({ select: materialFields, orderBy: [...materialOrder] })
  res.json({ materials })
})

chapterMaterials.post('/', requireUser('ADMIN'), upload, async (req, res) => {
  const { data } = await readMaterial(req)
  const material = await prisma.chapterMaterial.create({ data, select: materialFields })
  res.status(201).json(material)
})

chapterMaterials.patch('/:id', requireUser('ADMIN'), upload, async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const existing = await prisma.chapterMaterial.findUnique({ where: { id }, select: { format: true } })
  if (!existing) throw new HttpError(404, 'Contenu introuvable.')
  const { data, revision } = await readMaterial(req, existing)
  const material = await prisma.$transaction(async tx => {
    if (!revision) throw new HttpError(400, 'Version du contenu manquante.')
    const result = await tx.chapterMaterial.updateMany({ where: { id, revision }, data: { ...data, revision: { increment: 1 } } })
    if (!result.count) throw new HttpError(409, 'Ce contenu a changé. Actualisez la liste avant de le modifier.')
    return tx.chapterMaterial.findUniqueOrThrow({ where: { id }, select: materialFields })
  })
  res.json(material)
})

chapterMaterials.delete('/:id', requireUser('ADMIN'), async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const revision = z.coerce.number().int().positive().parse(req.query.revision)
  const result = await prisma.chapterMaterial.deleteMany({ where: { id, revision } })
  if (!result.count) throw new HttpError(409, 'Ce contenu a changé. Actualisez la liste avant de le supprimer.')
  res.status(204).end()
})

chapterMaterials.get('/:id/file', async (req, res) => {
  const id = z.uuid().parse(req.params.id)
  const material = await prisma.chapterMaterial.findFirst({
    where: { id, format: 'PDF', status: currentUser(req).role === 'ADMIN' ? undefined : 'PUBLISHED' },
    select: { pdf: true },
  })
  if (!material?.pdf) throw new HttpError(404, 'PDF indisponible.')
  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="document.pdf"', 'X-Content-Type-Options': 'nosniff' })
  res.send(Buffer.from(material.pdf))
})

const uploadError: ErrorRequestHandler = (error, _req, _res, next) => {
  if (!(error instanceof multer.MulterError)) return next(error)
  const tooLarge = error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_FIELD_VALUE'
  next(new HttpError(tooLarge ? 413 : 400, tooLarge ? 'Le PDF ou le texte LaTeX dépasse la taille autorisée.' : 'Import invalide.'))
}
chapterMaterials.use(uploadError)
