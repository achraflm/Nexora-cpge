import { HttpError } from '@cnc/common'
import bcrypt from 'bcrypt'
import { config } from './config'
import { prisma } from './db'
import type { Role } from './generated/prisma'
import type { LoginInput, RegisterInput } from './schemas'
import { generateRefreshToken, hashToken, refreshTokenExpiry, signAccessToken } from './tokens'
import { toPublicUser, withProfile } from './user-mapper'

/** Hash bcrypt factice : compare() prend le meme temps que l'utilisateur existe ou non. */
const DUMMY_HASH = bcrypt.hashSync('timing-attack-protection', 10)

/** Cree une paire access/refresh token et enregistre le refresh token (hache). */
async function issueTokens(userId: string, role: Role) {
  const refreshToken = generateRefreshToken()
  await prisma.refreshToken.create({
    data: { userId, tokenHash: hashToken(refreshToken), expiresAt: refreshTokenExpiry() },
  })
  return { accessToken: signAccessToken(userId, role), refreshToken }
}

/** UC01 : inscription d'un etudiant CPGE. */
export async function register(input: RegisterInput) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } })
  if (exists) throw new HttpError(409, 'Un compte existe deja avec cet e-mail', 'EMAIL_TAKEN')

  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, config.bcryptRounds),
      role: 'STUDENT',
      student: {
        create: {
          filiere: input.filiere,
          enrolledYear: input.enrolledYear,
          cpgeCenter: input.cpgeCenter,
          accessAllYears: true,
        },
      },
    },
    include: withProfile,
  })

  return { user: toPublicUser(user), ...(await issueTokens(user.id, user.role)) }
}

/** Connexion etudiant ou administrateur. Message d'erreur volontairement generique. */
export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email }, include: withProfile })
  const valid = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !valid) throw new HttpError(401, 'E-mail ou mot de passe incorrect', 'INVALID_CREDENTIALS')

  return { user: toPublicUser(user), ...(await issueTokens(user.id, user.role)) }
}

/**
 * Renouvellement avec rotation : l'ancien refresh token est revoque et un nouveau est emis.
 * Si un token deja revoque est presente (vol probable), tous les tokens de l'utilisateur
 * sont revoques : il devra se reconnecter.
 */
export async function refresh(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
    include: { user: true },
  })
  if (!stored) throw new HttpError(401, 'Refresh token invalide', 'INVALID_REFRESH_TOKEN')

  if (stored.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    throw new HttpError(401, 'Refresh token deja utilise : session revoquee', 'REFRESH_TOKEN_REUSED')
  }
  if (stored.expiresAt < new Date()) throw new HttpError(401, 'Refresh token expire', 'REFRESH_TOKEN_EXPIRED')

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } })
  return issueTokens(stored.userId, stored.user.role)
}

/** Deconnexion : revoque le refresh token (l'access token expire seul en 15 min). */
export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
