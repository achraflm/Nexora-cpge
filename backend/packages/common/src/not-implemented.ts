import type { RequestHandler } from 'express'

/**
 * Handler temporaire pour les endpoints prevus par le CDC mais pas encore codes.
 * Repond 501 avec le sprint prevu, pour que le frontend sache ce qui manque.
 */
export function notImplemented(sprint: string): RequestHandler {
  return (req, res) => {
    res.status(501).json({
      error: 'NOT_IMPLEMENTED',
      message: `${req.method} ${req.path} sera implemente au ${sprint}`,
    })
  }
}
