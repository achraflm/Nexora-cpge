import { PrismaClient } from './generated/prisma'

/** Client Prisma unique du service (schema PostgreSQL "auth"). */
export const prisma = new PrismaClient()
