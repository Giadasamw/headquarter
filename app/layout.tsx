import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import { Suspense } from 'react'
import { LatestBriefing } from '@/components/latest-briefing'
import { SophieProvider } from '@/components/sophie'
import './globals.css'

// Font principale del design system, usato dalla chat di Sophie
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: ['400', '500'] })

export const metadata: Metadata = {
  title: 'Assistente di Giada',
  description: "Executive assistant di prova costruito con eve",
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body className="antialiased">
        {/* Sophie (bollino + pannello della chat) è disponibile su tutte le pagine */}
        <SophieProvider
          font={bricolage.className}
          briefing={
            <Suspense fallback={null}>
              <LatestBriefing />
            </Suspense>
          }
        >
          {children}
        </SophieProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
