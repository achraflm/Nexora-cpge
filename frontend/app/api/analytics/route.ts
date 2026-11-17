import { gateway, getSession } from '@/lib/server-auth'

const headers = { 'Cache-Control': 'private, no-store' }
const error = (message: string, status: number) => Response.json({ message }, { status, headers })

async function proxy(path: string, options: RequestInit = {}) {
  try {
    const session = await getSession()
    if (!session) return error('Connexion requise.', 401)
    const upstream = await gateway(path, { ...options, headers: { Authorization: `Bearer ${session.accessToken}` } })
    return new Response(upstream.body, { status: upstream.status, headers: { ...headers, 'Content-Type': 'application/json' } })
  } catch {
    return error('Statistiques momentanément indisponibles.', 503)
  }
}

export function GET() {
  return proxy('/analytics/me/summary')
}

export async function POST(request: Request) {
  if (request.headers.get('origin') !== (process.env.APP_ORIGIN || 'http://localhost:3000') ||
      request.headers.get('sec-fetch-site') === 'cross-site') return error('Origine refusée.', 403)
  if (!request.headers.get('content-type')?.startsWith('application/json')) return error('Format JSON requis.', 415)
  const reader = request.body?.getReader()
  if (!reader) return error('Activité manquante.', 400)
  const decoder = new TextDecoder()
  let body = ''
  let length = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    length += value.byteLength
    if (length > 4096) {
      await reader.cancel()
      return error('Activité trop volumineuse.', 413)
    }
    body += decoder.decode(value, { stream: true })
  }
  return proxy('/analytics/activities', { method: 'POST', body: body + decoder.decode() })
}
