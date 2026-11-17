import { gateway, getSession } from '@/lib/server-auth'

const headers = { 'Cache-Control': 'private, no-store' }
const error = (message: string, status: number) => Response.json({ message }, { status, headers })

async function proxy(path: string, options: RequestInit = {}) {
  try {
    const session = await getSession()
    if (!session) return error('Connexion requise.', 401)
    const response = await gateway(path, { ...options, headers: { Authorization: `Bearer ${session.accessToken}` } })
    return new Response(response.body, { status: response.status, headers: { ...headers, 'Content-Type': 'application/json' } })
  } catch {
    return error('Le contenu pédagogique est momentanément indisponible.', 503)
  }
}

export function GET() {
  return proxy('/catalog/chapters')
}

export async function POST(request: Request) {
  if (request.headers.get('origin') !== (process.env.APP_ORIGIN || 'http://localhost:3000') ||
    request.headers.get('sec-fetch-site') === 'cross-site') return error('Origine refusée.', 403)
  const exerciseId = new URL(request.url).searchParams.get('exercise') ?? ''
  if (!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(exerciseId)) return error('Exercice introuvable.', 404)
  if (!request.headers.get('content-type')?.startsWith('application/json')) return error('Format JSON requis.', 415)
  const reader = request.body?.getReader()
  if (!reader) return error('Évaluation manquante.', 400)
  const decoder = new TextDecoder()
  let body = ''
  let actualLength = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    actualLength += value.byteLength
    if (actualLength > 1024) {
      await reader.cancel()
      return error('Évaluation trop volumineuse.', 413)
    }
    body += decoder.decode(value, { stream: true })
  }
  return proxy(`/catalog/exercises/${exerciseId}/attempts`, { method: 'POST', body: body + decoder.decode() })
}
