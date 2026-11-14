import { requireSession } from '@/lib/server-auth'
import { SessionProvider } from '@/components/SessionProvider'
import Screen from '@/components/FoldersPage'

export default async function Page() {
  const session = await requireSession()
  return <SessionProvider user={session.user}><Screen /></SessionProvider>
}
