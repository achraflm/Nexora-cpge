import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'

/** Erreur metier avec code HTTP. Lancer `throw new HttpError(404, '...')` dans un service. */
export class HttpError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, message: string, code = 'ERROR') {
    super(message)
    this.status = status
    this.code = code
  }
}

/** Route inconnue -> 404 JSON. */
export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: `Route inconnue : ${req.method} ${req.path}` })
}

/**
 * Gestionnaire d'erreurs central. Express 5 transmet automatiquement les
 * promesses rejetees des handlers async ici.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.code, message: err.message })
    return
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Donnees invalides',
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Erreur interne du serveur' })
}
