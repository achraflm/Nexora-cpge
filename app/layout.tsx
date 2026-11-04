import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import 'katex/dist/katex.min.css'
import './globals.css'
import './interface.css'
import { SilkBackground } from '@/components/SilkBackground'

export const metadata: Metadata = {
  title: 'Nexora — Plateforme d\'Excellence CPGE & Ingénierie',
  description: 'Nexora : Tableau de bord intelligent, cours structurés, annales et exercices pour la préparation au Concours National Commun (CNC) et Grandes Écoles.',
  generator: 'Nexora Platform',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/nexora-logo.png', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/nexora-logo.png',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#EFF6FF' },
    { media: '(prefers-color-scheme: dark)', color: '#070B14' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="nexora-app antialiased min-h-screen bg-transparent">
        <SilkBackground />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
