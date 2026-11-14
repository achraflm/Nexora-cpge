import { currentUser, HttpError, requireUser } from '@cnc/common'
import { Router, type Request } from 'express'
import { z } from 'zod'
import { prisma } from './db'
import type { Prisma } from './generated/prisma'

const category = z.enum(['ERRATUM', 'PEDAGOGICAL_QUESTION', 'TECHNICAL_ISSUE', 'TECHNICAL_PROBLEM', 'BOOK_SUGGESTION'])
const normalizeCategory = (value: z.infer<typeof category>) => value === 'TECHNICAL_PROBLEM' ? 'TECHNICAL_ISSUE' : value
const status = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED'])
const content = z.string().trim().min(1).max(6000)
const create = z.object({
  title: z.string().trim().min(3).max(160),
  category,
  description: content,
  targetEntityRef: z.string().trim().min(1).max(180).optional(),
}).strict()
const filters = z.object({
  category: category.optional(), status: status.optional(), q: z.string().trim().max(160).optional(),
  studentId: z.uuid().optional(), date: z.iso.date().optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
}).strict()
const pageSize = 20
const messagePageSize = 50
const router = Router()
const ticketId = (req: Request) => z.uuid().parse(req.params.id)
const notFound = () => new HttpError(404, 'Demande introuvable.')

async function ticket(req: Request, db: Prisma.TransactionClient = prisma) {
  const user = currentUser(req)
  const found = await db.contactTicket.findFirst({
    where: { id: ticketId(req), ...(user.role === 'STUDENT' ? { userId: user.id } : {}) },
    omit: { adminReply: true, repliedBy: true, messageBody: true },
  })
  if (!found) throw notFound()
  return found
}

router.use('/contact', requireUser(), (_req, res, next) => {
  res.set('Cache-Control', 'private, no-store')
  next()
})
// L’historique est conservé : aucune suppression n’est exposée aux comptes de l’application.
router.use('/contact', (req, _res, next) => {
  if (req.method === 'DELETE') return next(new HttpError(403, 'La suppression des messages et des demandes est interdite.'))
  next()
})
router.use('/contact/admin', requireUser('ADMIN'))

router.post('/contact/tickets', requireUser('STUDENT'), async (req, res) => {
  const input = create.parse(req.body)
  const userId = currentUser(req).id
  const result = await prisma.contactTicket.create({
    data: {
      userId, title: input.title, category: normalizeCategory(input.category),
      messageBody: input.description, targetEntityRef: input.targetEntityRef,
      messages: { create: { senderId: userId, senderRole: 'STUDENT', content: input.description } },
    },
    select: { id: true },
  })
  res.status(201).json(result)
})

async function list(req: Request) {
  const user = currentUser(req)
  const query = filters.parse(req.query)
  const date = query.date && new Date(query.date + 'T00:00:00Z')
  const unread = { senderRole: user.role === 'ADMIN' ? 'STUDENT' as const : 'ADMIN' as const, readAt: null }
  const where: Prisma.ContactTicketWhereInput = {
    userId: user.role === 'STUDENT' ? user.id : query.studentId,
    category: query.category && normalizeCategory(query.category),
    status: query.status,
    createdAt: date ? { gte: date, lt: new Date(date.getTime() + 86_400_000) } : undefined,
    ...(query.q ? { OR: [
      { title: { contains: query.q, mode: 'insensitive' } },
      { targetEntityRef: { contains: query.q, mode: 'insensitive' } },
      ...(z.uuid().safeParse(query.q).success ? [{ id: query.q }, ...(user.role === 'ADMIN' ? [{ userId: query.q }] : [])] : []),
    ] } : {}),
  }
  const [items, count] = await prisma.$transaction([
    prisma.contactTicket.findMany({
      where, skip: (query.page - 1) * pageSize, take: pageSize,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      omit: { adminReply: true, repliedBy: true, messageBody: true },
      include: {
        messages: { take: 1, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { content: true } },
        _count: { select: { messages: { where: unread } } },
      },
    }),
    prisma.contactTicket.count({ where }),
  ])
  return { items, count, pageSize }
}
router.get(['/contact/tickets/mine', '/contact/admin/tickets'], async (req, res) => res.json(await list(req)))

router.get('/contact/admin/tickets/statistics', async (_req, res) => {
  const [open, pending, resolved, recent] = await prisma.$transaction([
    prisma.contactTicket.count({ where: { status: 'OPEN' } }),
    prisma.contactTicket.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.contactTicket.count({ where: { status: 'RESOLVED' } }),
    prisma.contactTicket.findMany({ take: 5, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { id: true, title: true, createdAt: true } }),
  ])
  res.json({ counts: { OPEN: open, IN_PROGRESS: pending, RESOLVED: resolved }, recent })
})

const paths = ['/contact/tickets/:id', '/contact/admin/tickets/:id']
router.get(paths, async (req, res) => res.json(await ticket(req)))
router.get(paths.map(path => path + '/messages'), async (req, res) => {
  const { id } = await ticket(req)
  const { before } = z.object({ before: z.uuid().optional() }).strict().parse(req.query)
  if (before && !await prisma.contactMessage.findFirst({ where: { id: before, ticketId: id }, select: { id: true } })) throw notFound()
  const messages = await prisma.contactMessage.findMany({
    where: { ticketId: id }, take: messagePageSize + 1,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    ...(before ? { cursor: { id: before }, skip: 1 } : {}),
  })
  const hasMore = messages.length > messagePageSize
  if (hasMore) messages.pop()
  res.json({ before: hasMore ? messages.at(-1)?.id : null, messages: messages.reverse() })
})
router.post(paths.map(path => path + '/messages'), async (req, res) => {
  const { text } = z.object({ text: content }).strict().parse(req.body)
  const user = currentUser(req)
  const message = await prisma.$transaction(async db => {
    const found = await ticket(req, db)
    const active = await db.contactTicket.updateMany({
      where: { id: found.id, status: { not: 'RESOLVED' } }, data: { updatedAt: new Date() },
    })
    if (!active.count) throw new HttpError(409, 'Cette demande est résolue.')
    const message = await db.contactMessage.create({
      data: { ticketId: found.id, senderId: user.id, senderRole: user.role, content: text },
    })
    if (user.role === 'ADMIN') await db.notification.create({
      data: { ticketId: found.id, userId: found.userId, message: 'Nouvelle réponse de l’administration', createdAt: message.createdAt },
    })
    return message
  })
  res.status(201).json(message)
})
router.patch(paths.map(path => path + '/read'), async (req, res) => {
  const { through } = z.object({ through: z.uuid() }).strict().parse(req.body)
  const user = currentUser(req)
  const { id } = await ticket(req)
  const seen = await prisma.contactMessage.findFirst({ where: { ticketId: id, id: through } })
  if (!seen) throw notFound()
  const readAt = new Date()
  await prisma.$transaction([
    prisma.contactMessage.updateMany({ where: {
      ticketId: id, readAt: null, senderRole: user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN',
      OR: [{ createdAt: { lt: seen.createdAt } }, { createdAt: seen.createdAt, id: { lte: seen.id } }],
    }, data: { readAt } }),
    ...(user.role === 'STUDENT' ? [prisma.notification.updateMany({
      where: { ticketId: id, userId: user.id, readAt: null, createdAt: { lte: seen.createdAt } }, data: { readAt },
    })] : []),
  ])
  res.json({ ok: true })
})
router.patch('/contact/admin/tickets/:id/status', async (req, res) => {
  const input = z.object({ status }).strict().parse(req.body)
  const found = await ticket(req)
  if (input.status === found.status) return res.json(found)
  if (!((found.status === 'OPEN' && input.status === 'IN_PROGRESS') ||
    (found.status === 'IN_PROGRESS' && input.status === 'RESOLVED'))) {
    throw new HttpError(409, 'Transition de statut non autorisée.')
  }
  const changed = await prisma.contactTicket.updateMany({
    where: { id: found.id, status: found.status },
    data: { status: input.status, resolvedAt: input.status === 'RESOLVED' ? new Date() : null },
  })
  if (!changed.count) throw new HttpError(409, 'Le statut a déjà changé.')
  res.json(await ticket(req))
})
router.get('/contact/notifications', async (req, res) => {
  const userId = currentUser(req).id
  const [items, unread] = await prisma.$transaction([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ])
  res.json({ items, unread })
})
router.patch('/contact/notifications/:id/read', async (req, res) => {
  const updated = await prisma.notification.updateMany({
    where: { id: ticketId(req), userId: currentUser(req).id }, data: { readAt: new Date() },
  })
  if (!updated.count) throw notFound()
  res.json({ ok: true })
})

export default router
