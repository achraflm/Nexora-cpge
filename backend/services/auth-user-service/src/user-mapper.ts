import type { Administrator, Student, User } from './generated/prisma'

type UserWithProfile = User & { student: Student | null; administrator: Administrator | null }

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
