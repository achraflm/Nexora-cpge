'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { PochettesWorkspace } from '@/components/PochettesWorkspace'
import { getStoredUser, DEMO_STUDENT, UserProfile } from '@/lib/auth'

export default function PochettesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      return getStoredUser() || DEMO_STUDENT
    }
    return DEMO_STUDENT
  })

  useEffect(() => {
    const handleUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>
      if (customEvent.detail) {
        setCurrentUser(customEvent.detail)
      } else {
        const u = getStoredUser()
        if (u) setCurrentUser(u)
      }
    }
    window.addEventListener('nexora-user-updated', handleUserUpdate)
    return () => window.removeEventListener('nexora-user-updated', handleUserUpdate)
  }, [])

  return (
    <div className="learning-shell min-h-screen bg-transparent text-[#172033] dark:text-slate-100 flex flex-col font-sans">
      {/* Unified Global Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onNavigateToAdmin={() => router.push('/admin')}
        onLogout={() => router.push('/login')}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col">
        <PochettesWorkspace />
      </main>
    </div>
  )
}
