import '@cnc/common'
import bcrypt from 'bcrypt'
import { PrismaClient } from '../src/generated/prisma'

/** Comptes de demonstration (docs/test-accounts.md). Idempotent : upsert par e-mail. */
const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@learning-cnc.ma' },
    update: {},
    create: {
      firstName: 'Karim',
      lastName: 'Mansouri',
      email: 'admin@learning-cnc.ma',
      passwordHash: await bcrypt.hash('AdminPassword2026!', 12),
      role: 'ADMIN',
      administrator: {
        create: { privilegeLevel: 3, assignedSubjects: ['MATH', 'PHYS', 'SI', 'INFO'], department: 'Direction des Etudes' },
      },
    },
  })

  await prisma.user.upsert({
    where: { email: 'achraf.lemrani@cpge-cnc.ma' },
    update: {},
    create: {
      firstName: 'Achraf',
      lastName: 'Lemrani',
      email: 'achraf.lemrani@cpge-cnc.ma',
      passwordHash: await bcrypt.hash('StudentPassword2026!', 12),
      role: 'STUDENT',
      student: { create: { filiere: 'MP', enrolledYear: 'SPE', cpgeCenter: 'Lycee Omar Ibn Al-Khattab (Rabat)' } },
    },
  })
  console.log('Comptes de demonstration crees.')
}

main().finally(() => prisma.$disconnect())
