import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import type { CpgeBadgeId, UserProfile } from './auth'

export const SESSION_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-nexora-session' : 'nexora-session'
export const SESSION_COOKIE_OPTIONS = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' }
const gatewayUrl = process.env.API_GATEWAY_URL || 'http://127.0.0.1:4000'

export async function gateway(path: string, options: RequestInit = {}) {
  return fetch(`${gatewayUrl}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  })
}

interface ApiUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'STUDENT' | 'ADMIN'
  username: string | null
  bio: string
  avatarUrl: string | null
  badge: CpgeBadgeId | '' | null
  targetConcours: string[]
  notifyAnswers: boolean
  notifyAnnales: boolean
  notifyReminders: boolean
  student: { filiere: 'MP' | 'PSI' | 'TSI'; enrolledYear: 'SUP' | 'SPE'; cpgeCenter: string } | null
}

export function publicProfile(user: ApiUser): UserProfile {
  return {
    id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role,
    firstName: user.firstName, lastName: user.lastName,
    username: user.username ?? undefined,
    bio: user.bio, avatarUrl: user.avatarUrl ?? undefined, badge: user.badge ?? undefined,
    targetConcours: user.targetConcours,
    notifyAnswers: user.notifyAnswers, notifyAnnales: user.notifyAnnales, notifyReminders: user.notifyReminders,
    stream: user.student?.filiere,
    year: user.student ? (user.student.enrolledYear === 'SUP' ? '1re année Sup' : '2e année Spé') : undefined,
    center: user.student?.cpgeCenter,
  }
}

// React cache déduplique uniquement les appels d'un même rendu serveur.
export const getSession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null
  const response = await gateway('/auth/session', { method: 'POST', body: JSON.stringify({ refreshToken: token }) })
  if (response.status === 401 || response.status === 400) return null
  if (!response.ok) throw new Error('Le service de connexion est momentanément indisponible.')
  const session = await response.json()
  return { user: publicProfile(session.user), accessToken: session.accessToken as string }
})

export async function requireSession(role?: 'ADMIN') {
  const session = await getSession()
  if (!session) redirect('/login')
  if (role && session.user.role !== role) redirect('/')
  return session
}
