import { optionalEnv } from '@cnc/common'

/**
 * Table de routage de la gateway (CDC 3.1).
 * Chaque prefixe public /api/<x> est redirige vers un microservice.
 * Le prefixe "/api" est retire : /api/auth/login -> http://auth:4001/auth/login
 */
export interface ServiceRoute {
  prefix: string
  service: string
  target: string
}

/** URL d'un service : variable XXX_URL si definie (Docker/prod), sinon localhost:XXX_PORT. */
function serviceUrl(name: string, defaultPort: number): string {
  return optionalEnv(`${name}_URL`, `http://127.0.0.1:${optionalEnv(`${name}_PORT`, String(defaultPort))}`)
}

export const SERVICE_ROUTES: ServiceRoute[] = [
  { prefix: '/api/auth', service: 'auth-user-service', target: serviceUrl('AUTH', 4001) },
  { prefix: '/api/users', service: 'auth-user-service', target: serviceUrl('AUTH', 4001) },
  { prefix: '/api/catalog', service: 'catalog-course-service', target: serviceUrl('CATALOG', 4002) },
  { prefix: '/api/exams', service: 'exam-submission-service', target: serviceUrl('EXAM', 4003) },
  { prefix: '/api/analytics', service: 'analytics-streak-service', target: serviceUrl('ANALYTICS', 4004) },
  { prefix: '/api/contact', service: 'admin-contact-service', target: serviceUrl('CONTACT', 4005) },
  { prefix: '/api/qcm', service: 'adaptive-qcm-service', target: serviceUrl('QCM', 4006) },
]

/** Routes accessibles sans access token (tout le reste exige un JWT valide). */
export const PUBLIC_ROUTES: Array<{ method: string; path: string }> = [
  { method: 'POST', path: '/api/auth/register' },
  { method: 'POST', path: '/api/auth/login' },
  { method: 'POST', path: '/api/auth/refresh' },
  { method: 'POST', path: '/api/auth/logout' },
  { method: 'GET', path: '/api/health' },
]

export function isPublicRoute(method: string, path: string): boolean {
  const cleanPath = path.replace(/\/+$/, '') || '/'
  return PUBLIC_ROUTES.some((r) => r.method === method && r.path === cleanPath)
}
