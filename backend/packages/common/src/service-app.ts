import express, { type Express, type Router } from 'express'
import { requireGateway } from './auth-context'
import { errorHandler, notFoundHandler } from './errors'

interface ServiceOptions {
  /** Nom du microservice (affiche dans /health et les logs). */
  name: string
  /** Secret partage avec la gateway. */
  internalSecret: string
  /** Routeur Express contenant les routes metier du service. */
  router: Router
}

/**
 * Construit l'application Express standard d'un microservice :
 *   GET /health (public) -> verification de vie
 *   tout le reste       -> uniquement via la gateway, JSON, gestion d'erreurs commune
 */
export function createServiceApp({ name, internalSecret, router }: ServiceOptions): Express {
  const app = express()
  app.disable('x-powered-by')

  app.get('/health', (_req, res) => {
    res.json({ service: name, status: 'ok', time: new Date().toISOString() })
  })

  app.use(requireGateway(internalSecret))
  app.use(express.json({ limit: '1mb' }))
  app.use(router)

  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}

export function startService(app: Express, name: string, port: number): void {
  app.listen(port, () => console.log(`[${name}] a l'ecoute sur http://localhost:${port}`))
}
