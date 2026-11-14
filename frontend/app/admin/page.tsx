import { requireSession } from '@/lib/server-auth'
import { SessionProvider } from '@/components/SessionProvider'
import Screen from '@/components/AdminPage'

export default async function Page() {
  const session = await requireSession('ADMIN')
  return <SessionProvider user={session.user}><Screen /></SessionProvider>
}
