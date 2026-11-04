import { errorHandler, notFoundHandler, optionalEnv, portEnv, requireEnv } from '@cnc/common'
import cors from 'cors'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { authenticate } from './authenticate'
import { SERVICE_ROUTES } from './routes'

/**
 * API Gateway (CDC 3.1) : point d'entree unique du frontend.
 * Responsabilites : CORS, limitation de debit, verification JWT, routage.
 * Elle ne parse PAS le corps JSON : le flux est transmis tel quel au service.
 */
const PORT = portEnv('GATEWAY_PORT', 4000)
const ACCESS_SECRET = requireEnv('JWT_ACCESS_SECRET')
const INTERNAL_SECRET = requireEnv('INTERNAL_SECRET')

const app = express()
app.disable('x-powered-by')
app.use(cors({ origin: optionalEnv('CORS_ORIGIN', 'http://localhost:3000').split(','), credentials: true }))

// Rate limiting : global + plus strict sur la connexion / inscription (anti brute-force).
app.use(rateLimit({ windowMs: 15 * 60_000, limit: 600, standardHeaders: 'draft-8', legacyHeaders: false }))
app.use(['/api/auth/login', '/api/auth/register'], rateLimit({ windowMs: 15 * 60_000, limit: 20 }))

// Etat de sante agrege de tous les microservices.
app.get('/api/health', async (_req, res) => {
  const unique = [...new Map(SERVICE_ROUTES.map((r) => [r.service, r])).values()]
  const services = await Promise.all(
    unique.map(async ({ service, target }) => {
      try {
        const r = await fetch(`${target}/health`, { signal: AbortSignal.timeout(1500) })
        return { service, status: r.ok ? 'up' : 'down' }
      } catch {
        return { service, status: 'down' }
      }
    }),
  )
  res.json({ gateway: 'ok', services })
})

app.use(authenticate(ACCESS_SECRET, INTERNAL_SECRET))

for (const route of SERVICE_ROUTES) {
  app.use(
    createProxyMiddleware({
      target: route.target,
      pathFilter: route.prefix,
      pathRewrite: { '^/api': '' },
      on: {
        error: (_err, _req, res) => {
          if ('writeHead' in res && !res.headersSent) {
            res.writeHead(503, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'SERVICE_UNAVAILABLE', message: `${route.service} indisponible` }))
          }
        },
      },
    }),
  )
}

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[gateway] a l'ecoute sur http://localhost:${PORT}`)
  for (const r of SERVICE_ROUTES) console.log(`  ${r.prefix.padEnd(15)} -> ${r.service} (${r.target})`)
})
