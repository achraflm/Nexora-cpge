import { HttpError } from '@cnc/common'
import { prisma } from './db'
import type { UpdateProfileInput } from './schemas'
import { toPublicUser, withProfile } from './user-mapper'

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: withProfile })
  if (!user) throw new HttpError(404, 'Utilisateur introuvable', 'USER_NOT_FOUND')
  return toPublicUser(user)
}

/** Mise a jour du profil : nom/prenom pour tous, champs CPGE pour les etudiants. */
export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const { firstName, lastName, ...studentFields } = input
  const current = await prisma.user.findUnique({ where: { id: userId }, include: { student: true } })
  if (!current) throw new HttpError(404, 'Utilisateur introuvable', 'USER_NOT_FOUND')

  const hasStudentFields = Object.values(studentFields).some((v) => v !== undefined)
  if (hasStudentFields && !current.student) {
    throw new HttpError(400, 'Seuls les etudiants ont un profil CPGE', 'NOT_A_STUDENT')
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      student: hasStudentFields ? { update: studentFields } : undefined,
    },
    include: withProfile,
  })
  return toPublicUser(user)
}

/** Back-office (ADMIN) : liste paginee des utilisateurs. */
export async function listUsers(page: number, pageSize: number) {
  const [total, users] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.findMany({
      include: withProfile,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])
  return { total, page, pageSize, items: users.map(toPublicUser) }
}
