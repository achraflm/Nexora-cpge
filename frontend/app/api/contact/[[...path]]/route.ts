import { NextRequest } from 'next/server'
import { gateway, getSession } from '@/lib/server-auth'

async function proxy(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const json = (status: number, message: string) => Response.json({ message }, { status })
  const path = (await context.params).path ?? []
  if (path.length > 4 || path.some(segment => !/^[a-z0-9-]+$/i.test(segment))) return json(404, 'Route inconnue.')
  const mutating = request.method !== 'GET'
  if (mutating && (request.headers.get('origin') !== (process.env.APP_ORIGIN || 'http://localhost:3000') ||
    request.headers.get('sec-fetch-site') === 'cross-site')) return json(403, 'Origine refusée.')
  try {
    const session = await getSession()
    if (!session) return json(401, 'Connexion requise.')
    if (path[0] === 'admin' && session.user.role !== 'ADMIN') return json(403, 'Administration uniquement.')
    const headers = { Authorization: `Bearer ${session.accessToken}` }
    if (request.method === 'GET' && path.join('/') === 'admin/directory') {
      const people: { id: string; name: string }[] = []
      for (let page = 1; page <= 20; page++) {
        const result = await gateway(`/users?page=${page}&pageSize=100`, { headers })
        if (!result.ok) return json(503, 'Annuaire momentanément indisponible.')
        const users: { total: number; items: { id: string; role: string; firstName: string; lastName: string }[] } = await result.json()
        people.push(...users.items.filter(user => user.role === 'STUDENT').map(user => ({
          id: user.id, name: `${user.firstName} ${user.lastName}`,
        })))
        if (page * 100 >= users.total) break
      }
      return Response.json(people, { headers: { 'Cache-Control': 'private, no-store' } })
    }
    let body: string | undefined
    if (mutating && request.body) {
      const reader = request.body.getReader()
      const decoder = new TextDecoder()
      let size = 0
      body = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.length
        if (size > 48_000) {
          await reader.cancel()
          return json(413, 'Message trop volumineux.')
        }
        body += decoder.decode(value, { stream: true })
      }
      body += decoder.decode()
    }
    const upstream = await gateway('/contact/' + path.join('/') + request.nextUrl.search, {
      method: request.method, body, headers,
    })
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
    })
  } catch {
    return json(503, 'Service de messagerie momentanément indisponible.')
  }
}
export { proxy as GET, proxy as POST, proxy as PATCH }
