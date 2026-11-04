import { PrismaClient } from './generated/prisma'

/** Client Prisma du service (schema PostgreSQL dedie, variable _DATABASE_URL). */
export const prisma = new PrismaClient()