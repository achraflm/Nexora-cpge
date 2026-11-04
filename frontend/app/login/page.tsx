'use client'

import { LoginPage } from '@/components/LoginPage'
import { UserRole, UserProfile } from '@/lib/auth'

export default function Page() {
  const handleLoginSuccess = (role: UserRole, user: UserProfile) => {
    if (role === 'ADMIN') {
      window.location.href = '/admin'
    } else {
      window.location.href = '/'
    }
  }

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onNavigateToSignUp={() => {
        window.location.href = '/signup'
      }}
      onBackToApp={() => {
        window.location.href = '/'
      }}
    />
  )
}
