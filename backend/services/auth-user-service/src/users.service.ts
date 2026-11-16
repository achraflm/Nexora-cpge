import { HttpError } from '@cnc/common'
import bcrypt from 'bcrypt'
import { config } from './config'
import { prisma } from './db'
import type { Prisma, Role } from './generated/prisma'
import type { AccountListInput, CreateAccountInput, UpdateProfileInput } from './schemas'
import { toPublicUser, withProfile } from './user-mapper'

const notFound = () => new HttpError(404, 'Compte introuvable.', 'USER_NOT_FOUND')
const inactive = () => new HttpError(401, 'Ce compte est désactivé.', 'ACCOUNT_DEACTIVATED')
const emailTaken = () => new HttpError(409, 'Un compte utilise déjà cette adresse e-mail.', 'EMAIL_TAKEN')
const hasCode = (error: unknown, code: string) => typeof error === 'object' && error !== null && 'code' in error && error.code === code

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: withProfile })
  if (!user) throw notFound()
  return toPublicUser(user)
}

export async function createAccount(input: CreateAccountInput, db: Prisma.TransactionClient = prisma) {
  const passwordHash = await bcrypt.hash(input.password, config.bcryptRounds)
  try {
    return await db.user.create({
      data: {
        firstName: input.firstName, lastName: input.lastName, email: input.email, passwordHash, role: input.role,
        student: input.role === 'STUDENT' ? { create: {
          cpgeCenter: input.cpgeCenter, enrolledYear: input.enrolledYear, filiere: input.filiere,
        } } : undefined,
        administrator: input.role === 'ADMIN' ? { create: { assignedSubjects: [] } } : undefined,
      },
      include: withProfile,
    })
  } catch (error) {
    if (hasCode(error, 'P2002')) throw emailTaken()
    throw error
  }
}

export async function updateProfile(userId: string, input: UpdateProfileInput, activeOnly: boolean) {
  const { cpgeCenter, filiere, enrolledYear, ...fields } = input
  const studentFields = { cpgeCenter, filiere, enrolledYear }
  const hasStudentFields = Object.values(studentFields).some(value => value !== undefined)
  if (hasStudentFields) {
    const current = await prisma.user.findUnique({
      where: { id: userId, ...(activeOnly ? { deactivatedAt: null } : {}) },
      select: { student: { select: { userId: true } } },
    })
    if (!current) throw activeOnly ? inactive() : notFound()
    if (!current.student) throw new HttpError(400, 'Ce compte ne possède pas de profil étudiant.', 'NOT_A_STUDENT')
  }
  try {
    const user = await prisma.user.update({
      where: { id: userId, ...(activeOnly ? { deactivatedAt: null } : {}) },
      data: { ...fields, student: hasStudentFields ? { update: studentFields } : undefined },
      include: withProfile,
    })
    return toPublicUser(user)
  } catch (error) {
    if (hasCode(error, 'P2002')) throw emailTaken()
    if (hasCode(error, 'P2025')) throw activeOnly ? inactive() : notFound()
    throw error
  }
}

export async function listUsers({ page, pageSize, q, role, status }: AccountListInput) {
  const where: Prisma.UserWhereInput = {
    role,
    deactivatedAt: status === 'active' ? null : status === 'deactivated' ? { not: null } : undefined,
    AND: q?.split(/\s+/).map(word => ({
      OR: [
        { firstName: { contains: word, mode: 'insensitive' } },
        { lastName: { contains: word, mode: 'insensitive' } },
        { email: { contains: word, mode: 'insensitive' } },
      ],
    })),
  }
  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where, include: withProfile, omit: { avatarUrl: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * pageSize, take: pageSize,
    }),
  ])
  return { total, page, pageSize, items: users.map(toPublicUser) }
}

export async function setAccountStatus(userId: string, active: boolean, actor: { id: string; role: Role }) {
  try {
    return await prisma.$transaction(async tx => {
      const operator = await tx.user.findFirst({
        where: { id: actor.id, role: actor.role, deactivatedAt: null }, select: { id: true },
      })
      if (!operator) throw inactive()

      const target = await tx.user.findUnique({ where: { id: userId }, include: withProfile })
      if (!target) throw notFound()
      if (active === (target.deactivatedAt === null)) return toPublicUser(target)

      if (!active && target.role === 'ADMIN' && await tx.user.count({ where: { role: 'ADMIN', deactivatedAt: null } }) <= 1) {
        throw new HttpError(409, 'Au moins un compte administrateur doit rester actif.', 'LAST_ACTIVE_ADMIN')
      }

      const changedAt = new Date()
      const user = await tx.user.update({
        where: { id: userId },
        data: active ? { deactivatedAt: null } : { deactivatedAt: changedAt, sessionVersion: { increment: 1 } },
        include: withProfile,
      })
      if (!active) {
        await tx.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: changedAt } })
      }
      return toPublicUser(user)
    }, { isolationLevel: 'Serializable' })
  } catch (error) {
    if (hasCode(error, 'P2034')) throw new HttpError(409, 'Le compte a changé entre-temps. Réessayez.', 'ACCOUNT_CHANGED')
    throw error
  }
}

export async function checkAccess({ userId, role, sessionVersion }: { userId: string; role: Role; sessionVersion: number }) {
  const active = await prisma.user.findFirst({ where: { id: userId, role, sessionVersion, deactivatedAt: null }, select: { id: true } })
  if (!active) throw new HttpError(401, 'Cette session n’est plus valide.', 'SESSION_REVOKED')
}
