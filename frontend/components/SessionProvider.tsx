'use client'

import { createContext, useContext } from 'react'
import type { UserProfile } from '@/lib/auth'

const SessionContext = createContext<UserProfile | null>(null)

export function SessionProvider({ user, children }: { user: UserProfile; children: React.ReactNode }) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
}

export function useSessionUser() {
  const user = useContext(SessionContext)
  if (!user) throw new Error('Une session vérifiée est requise pour cet écran.')
  return user
}
