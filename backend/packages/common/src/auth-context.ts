import type { Request, RequestHandler } from 'express'
import { HttpError } from './errors'

/**
 * Le JWT est verifie UNE seule fois, dans l'API Gateway.
 * La gateway transmet ensuite l'identite aux microservices via des en-tetes :
 *   x-user-id, x-user-role, x-internal-secret
 * Les microservices ne sont pas exposes publiquement ; le secret interne
 * empeche un client de forger ces en-tetes en appelant un service directement.
 */
export const HEADER_USER_ID = 'x-user-id'
export const HEADER_USER_ROLE = 'x-user-role'
export const HEADER_INTERNAL_SECRET = 'x-internal-secret'

export type Role = 'STUDENT' | 'ADMIN'

export interface AuthUser {
  id: string
  role: Role
}

/** Payload contenu dans l'access token JWT. */
export interface AccessTokenPayload {
  sub: string
  role: Role
}

/** Refuse toute requete qui ne provient pas de la gateway. */
export function requireGateway(internalSecret: string): RequestHandler {
  return (req, _res, next) => {
    if (req.header(HEADER_INTERNAL_SECRET) !== internalSecret) {
      next(new HttpError(403, 'Acces direct au microservice interdit', 'FORBIDDEN'))
      return
    }
    next()
  }
}

/** Retourne l'utilisateur authentifie (transmis par la gateway) ou null. */
export function getAuthUser(req: Request): AuthUser | null {
  const id = req.header(HEADER_USER_ID)
  const role = req.header(HEADER_USER_ROLE)
  if (!id || (role !== 'STUDENT' && role !== 'ADMIN')) return null
  return { id, role }
}

/** Middleware : exige un utilisateur connecte, eventuellement avec un role precis. */
export function requireUser(role?: Role): RequestHandler {
  return (req, _res, next) => {
    const user = getAuthUser(req)
    if (!user) return next(new HttpError(401, 'Authentification requise', 'UNAUTHORIZED'))
    if (role && user.role !== role) return next(new HttpError(403, 'Droits insuffisants', 'FORBIDDEN'))
    next()
  }
}

/** Version "assertion" a utiliser dans un handler apres requireUser(). */
export function currentUser(req: Request): AuthUser {
  const user = getAuthUser(req)
  if (!user) throw new HttpError(401, 'Authentification requise', 'UNAUTHORIZED')
  return user
}
