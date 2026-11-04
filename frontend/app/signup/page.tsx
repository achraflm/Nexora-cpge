'use client'

import { SignUpPage } from '@/components/SignUpPage'

export default function Page() {
  return (
    <SignUpPage
      onNavigateToLogin={() => {
        window.location.href = '/login'
      }}
      onSignUpSuccess={() => {
        window.location.href = '/'
      }}
    />
  )
}
