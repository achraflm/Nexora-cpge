import { gateway, getSession } from '@/lib/server-auth'
import { workTex, type StudyWork } from '@/lib/study-work'

const headers = { 'Cache-Control': 'private, no-store' }
const error = (message: string, status: number) => Response.json({ message }, { status, headers })

async function proxy(request: Request, body?: Uint8Array<ArrayBuffer>) {
  try {
    const session = await getSession()
    if (!session) return error('Connexion requise.', 401)
    const query = new URL(request.url).searchParams
    const target = new URLSearchParams()
    for (const key of ['kind', 'resourceId']) {
      if (query.has(key)) target.set(key, query.get(key) ?? '')
    }
    const photo = request.method === 'GET' && query.get('file') === 'photo'
    const upstream = await gateway('/exams/study-work' + (photo ? '/photo?' : '?') + target.toString(), {
      method: request.method,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': request.headers.get('content-type') ?? 'application/json',
      },
      body,
    })
    if (request.method === 'GET' && query.get('file') === 'latex' && upstream.ok) {
      if (target.size !== 2) return error('Copie introuvable.', 404)
      const work = await upstream.json() as StudyWork | null
      if (!work?.latex) return error('Transcription introuvable.', 404)
      return new Response(workTex(work), { headers: {
        ...headers,
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="copie.tex"',
        'X-Content-Type-Options': 'nosniff',
      } })
    }
    return new Response(upstream.body, { status: upstream.status, headers: {
      ...headers,
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
      'X-Content-Type-Options': 'nosniff',
    } })
  } catch {
    return error('Les copies sont momentanément indisponibles.', 503)
  }
}

export function GET(request: Request) {
  return proxy(request)
}

export async function PUT(request: Request) {
  if (request.headers.get('origin') !== (process.env.APP_ORIGIN || 'http://localhost:3000') ||
      request.headers.get('sec-fetch-site') === 'cross-site') return error('Origine refusée.', 403)
  const format = request.headers.get('content-type')?.split(';', 1)[0]
  if (format !== 'application/json' && format !== 'multipart/form-data') return error('Format de dépôt non reconnu.', 415)
  const maxBytes = format === 'multipart/form-data' ? 16 * 1024 * 1024 : 820_000
  if (Number(request.headers.get('content-length')) > maxBytes) return error('Copie trop volumineuse.', 413)
  const reader = request.body?.getReader()
  if (!reader) return error('Copie manquante.', 400)
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) {
        await reader.cancel()
        return error('Copie trop volumineuse.', 413)
      }
      chunks.push(value)
    }
  } catch {
    return error('La copie ne peut pas être lue.', 400)
  } finally {
    reader.releaseLock()
  }
  return proxy(request, new Uint8Array(Buffer.concat(chunks, size)))
}
