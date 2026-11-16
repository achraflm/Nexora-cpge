import {
  HEADER_INTERNAL_SECRET,
  HEADER_USER_ID,
  HEADER_USER_ROLE,
  HttpError,
  type AccessTokenPayload,
} from '@cnc/common'
import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { authServiceUrl, isPublicRoute } from './routes'

/**
 * Middleware central de securite de la gateway :
 *  1. supprime les en-tetes d'identite envoyes par le client (anti-usurpation) ;
 *  2. verifie l'access token JWT (Authorization: Bearer <token>) ;
 *  3. injecte x-user-id / x-user-role / x-internal-secret pour les microservices.
 */
export function authenticate(accessSecret: string, internalSecret: string): RequestHandler {
  const accessUrl = `${authServiceUrl.replace(/\/+$/, '')}/internal/access`
  return async (req, _res, next) => {
    delete req.headers[HEADER_USER_ID]
    delete req.headers[HEADER_USER_ROLE]
    req.headers[HEADER_INTERNAL_SECRET] = internalSecret

    const header = req.header('authorization')
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null

    if (!token) {
      if (isPublicRoute(req.method, req.path)) return next()
      throw new HttpError(401, 'Authentification requise', 'UNAUTHORIZED')
    }

    let payload: AccessTokenPayload
    try {
      payload = jwt.verify(token, accessSecret, {
        algorithms: ['HS256'], issuer: 'nexora-auth', audience: 'nexora-api',
      }) as AccessTokenPayload
      if (typeof payload.sub !== 'string' || !payload.sub || !['STUDENT', 'ADMIN'].includes(payload.role)) {
        throw new Error('Invalid claims')
      }
    } catch {
      throw new HttpError(401, 'Jeton d’accès invalide ou expiré.', 'INVALID_TOKEN')
    }

    // Vérifie aussi les JWT émis avant une désactivation ou un changement de mot de passe.
    const response = await fetch(accessUrl, {
      method: 'POST', signal: AbortSignal.timeout(2500),
      headers: { 'Content-Type': 'application/json', [HEADER_INTERNAL_SECRET]: internalSecret },
      body: JSON.stringify({ userId: payload.sub, role: payload.role, sessionVersion: payload.sessionVersion ?? 0 }),
    }).catch(() => null)
    if (response?.status === 401 || response?.status === 400) {
      throw new HttpError(401, 'Cette session n’est plus valide.', 'SESSION_REVOKED')
    }
    if (response?.status !== 204) throw new HttpError(503, 'Service de connexion indisponible.', 'AUTH_UNAVAILABLE')

    req.headers[HEADER_USER_ID] = payload.sub
    req.headers[HEADER_USER_ROLE] = payload.role
    next()
  }
}
