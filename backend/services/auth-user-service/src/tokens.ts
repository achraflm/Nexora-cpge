import type { AccessTokenPayload, Role } from '@cnc/common'
import { createHash, randomBytes } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { config } from './config'

/**
 * Deux jetons (CDC 2.1) :
 *  - Access token : JWT signe, courte duree (15 min), verifie par la gateway.
 *  - Refresh token : chaine aleatoire opaque, longue duree (30 j), stockee hachee en base,
 *    renouvelee a chaque utilisation (rotation).
 */

export function signAccessToken(userId: string, role: Role): string {
  const payload: AccessTokenPayload = { sub: userId, role }
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.accessTokenTtl as jwt.SignOptions['expiresIn'],
  })
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url')
}

/** On ne stocke jamais le refresh token en clair : seulement son empreinte SHA-256. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function refreshTokenExpiry(from = new Date()): Date {
  return new Date(from.getTime() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000)
}
