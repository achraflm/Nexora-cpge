import { NextRequest, NextResponse } from 'next/server'
import { gateway, getSession, publicProfile, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/server-auth'

const uuid = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i
const bodyLimit = 270_000
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { 'Cache-Control': 'no-store' } })

async function proxy(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const path = (await context.params).path ?? []
  const method = request.method
  const [id, action] = path
  const self = id === 'me'
  const validRoute = path.length === 0 ? ['GET', 'POST'].includes(method)
    : (self || uuid.test(id)) && (path.length === 1 ? ['GET', 'PATCH'].includes(method)
      : path.length === 2 && method === 'PATCH' && (self ? ['password', 'deactivate'].includes(action) : action === 'status'))
  if (!validRoute) return json({ message: 'Route inconnue.' }, 404)

  const mutating = method !== 'GET'
  if (mutating && (request.headers.get('origin') !== (process.env.APP_ORIGIN || 'http://localhost:3000') ||
    request.headers.get('sec-fetch-site') === 'cross-site')) return json({ message: 'Origine de la requête refusée.' }, 403)

  try {
    const session = await getSession()
    if (!session) return json({ message: 'Connexion requise.' }, 401)
    if (!self && session.user.role !== 'ADMIN') return json({ message: 'Administration uniquement.' }, 403)

    let body: Buffer | undefined
    if (mutating && action !== 'deactivate') {
      if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ message: 'JSON attendu.' }, 415)
      const reader = request.body?.getReader()
      if (!reader) return json({ message: 'Corps manquant.' }, 400)
      const chunks: Uint8Array[] = []
      let size = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > bodyLimit) {
          await reader.cancel()
          return json({ message: 'Requête trop volumineuse.' }, 413)
        }
        chunks.push(value)
      }
      body = Buffer.concat(chunks)
    }

    const response = await gateway(`/users${id ? '/' + path.join('/') : ''}${request.nextUrl.search}`, {
      method, body, headers: { Authorization: `Bearer ${session.accessToken}` },
    })
    if (response.status === 204) {
      const result = new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
      result.cookies.set(SESSION_COOKIE, '', { ...SESSION_COOKIE_OPTIONS, maxAge: 0 })
      return result
    }
    const data = await response.json()
    const result = json(response.ok && self ? publicProfile(data) : data, response.status)
    if (response.ok && id === session.user.id && action === 'status' && data.deactivatedAt) {
      result.cookies.set(SESSION_COOKIE, '', { ...SESSION_COOKIE_OPTIONS, maxAge: 0 })
    }
    return result
  } catch {
    return json({ message: 'Le service des comptes est momentanément indisponible.' }, 503)
  }
}

export { proxy as GET, proxy as POST, proxy as PATCH }
