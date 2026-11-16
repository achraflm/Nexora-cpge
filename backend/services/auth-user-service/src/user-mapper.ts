import type { Administrator, Student, User } from './generated/prisma'

type UserWithProfile = Omit<User, 'avatarUrl'> & { avatarUrl?: string | null; student: Student | null; administrator: Administrator | null }

/** Inclusion Prisma standard pour charger le profil complet. */
export const withProfile = { student: true, administrator: true } as const

/** Representation publique d'un utilisateur : ne contient JAMAIS passwordHash. */
export function toPublicUser(user: UserWithProfile) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    deactivatedAt: user.deactivatedAt,
    username: user.username,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    badge: user.badge,
    targetConcours: user.targetConcours,
    notifyAnswers: user.notifyAnswers,
    notifyAnnales: user.notifyAnnales,
    notifyReminders: user.notifyReminders,
    student: user.student && {
      filiere: user.student.filiere,
      enrolledYear: user.student.enrolledYear,
      cpgeCenter: user.student.cpgeCenter,
      accessAllYears: user.student.accessAllYears,
    },
    administrator: user.administrator && {
      privilegeLevel: user.administrator.privilegeLevel,
      assignedSubjects: user.administrator.assignedSubjects,
      department: user.administrator.department,
    },
  }
}
export type PublicUser = ReturnType<typeof toPublicUser>
