import {
  HEADER_INTERNAL_SECRET,
  HEADER_USER_ID,
  HEADER_USER_ROLE,
  HttpError,
  type AccessTokenPayload,
} from '@cnc/common'
import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { isPublicRoute } from './routes'

/**
 * Middleware central de securite de la gateway :
 *  1. supprime les en-tetes d'identite envoyes par le client (anti-usurpation) ;
 *  2. verifie l'access token JWT (Authorization: Bearer <token>) ;
 *  3. injecte x-user-id / x-user-role / x-internal-secret pour les microservices.
 */
export function authenticate(accessSecret: string, internalSecret: string): RequestHandler {
  return (req, _res, next) => {
    delete req.headers[HEADER_USER_ID]
    delete req.headers[HEADER_USER_ROLE]
    req.headers[HEADER_INTERNAL_SECRET] = internalSecret

    const header = req.header('authorization')
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null

    if (token) {
      try {
        const payload = jwt.verify(token, accessSecret) as AccessTokenPayload
        req.headers[HEADER_USER_ID] = payload.sub
        req.headers[HEADER_USER_ROLE] = payload.role
      } catch {
        return next(new HttpError(401, 'Access token invalide ou expire', 'INVALID_TOKEN'))
      }
    }

    if (!token && !isPublicRoute(req.method, req.path)) {
      return next(new HttpError(401, 'Authentification requise', 'UNAUTHORIZED'))
    }
    next()
  }
}
