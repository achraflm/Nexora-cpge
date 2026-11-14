import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { gateway, publicProfile, SESSION_COOKIE } from '@/lib/server-auth'

const allowedActions = new Set(['login', 'register', 'logout', 'refresh'])
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' }

export async function POST(request: NextRequest, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params
  const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
  if (!allowedActions.has(action)) return json({ message: 'Route inconnue.' }, 404)
  const origin = process.env.APP_ORIGIN || 'http://localhost:3000'
  if (request.headers.get('origin') !== origin || request.headers.get('sec-fetch-site') === 'cross-site') {
    return json({ message: 'Origine de la requête refusée.' }, 403)
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ message: 'JSON attendu.' }, 415)
  if (Number(request.headers.get('content-length') || 0) > 8192) return json({ message: 'Requête trop volumineuse.' }, 413)
  let body: Record<string, unknown>
  try {
    const reader = request.body?.getReader()
    if (!reader) return json({ message: 'Corps manquant.' }, 400)
    const chunks: Uint8Array[] = []
    let length = 0
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > 8192) { await reader.cancel(); return json({ message: 'Requête trop volumineuse.' }, 413) }
      chunks.push(value)
    }
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ message: 'Objet JSON attendu.' }, 400)
  } catch { return json({ message: 'Corps JSON invalide.' }, 400) }

  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  const remember = body.rememberMe === true
  delete body.rememberMe
  if (action === 'refresh' || action === 'logout') {
    if (!token) return json({ message: 'Session absente.' }, 401)
    body = { refreshToken: token }
  }
  try {
    const response = await gateway(`/auth/${action}`, { method: 'POST', body: JSON.stringify(body) })
    if (action === 'logout' && response.ok) {
      jar.set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 })
      return json({ ok: true })
    }
    const result = await response.json()
    if (!response.ok) return json({ message: result.message || 'Connexion refusée.', details: result.details }, response.status)
    // Une nouvelle connexion remplace et révoque la session précédente de ce navigateur.
    if (token && (action === 'login' || action === 'register')) {
      await gateway('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: token }) })
    }
    jar.set(SESSION_COOKIE, result.refreshToken, { ...cookieOptions, ...(remember ? { maxAge: 30 * 86400 } : {}) })
    return json({ user: result.user ? publicProfile(result.user) : undefined }, response.status)
  } catch {
    return json({ message: 'Le service de connexion est indisponible. Réessayez dans un instant.' }, 503)
  }
}
