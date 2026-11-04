'use client'

import { AdminBackOffice } from '@/components/AdminBackOffice'

export default function Page() {
  return (
    <AdminBackOffice
      onNavigateToStudentView={() => {
        window.location.href = '/'
      }}
      onLogout={() => {
        window.location.href = '/login'
      }}
    />
  )
}
