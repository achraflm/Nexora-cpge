'use client'

import { logout } from '@/lib/auth'
import { AdminBackOffice } from '@/components/AdminBackOffice'

export default function Page() {
  return (
    <AdminBackOffice
      onNavigateToStudentView={() => {
        window.location.href = '/'
      }}
      onLogout={() => { void logout() }}
    />
  )
}
