import { requireSession, gateway } from '@/lib/server-auth'
import { SessionProvider } from '@/components/SessionProvider'
import DashboardShell from '@/components/DashboardShell'

export default async function Page() {
  const session = await requireSession()
  let dashboard = null
  try {
    const response = await gateway('/analytics/me/summary', { headers: { Authorization: `Bearer ${session.accessToken}` } })
    if (response.ok) dashboard = await response.json()
  } catch { /* Le composant affiche un état d'indisponibilité et permet de réessayer. */ }
  return <SessionProvider user={session.user}><DashboardShell initialUser={session.user} dashboard={dashboard} /></SessionProvider>
}
