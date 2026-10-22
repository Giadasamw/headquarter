import { Suspense } from 'react'
import Link from 'next/link'

const navigationPages = [
  { href: '/motore/lavagna', label: 'Lavagna contatti' },
]
import { Chat } from '@/components/chat'
import { LatestBriefing } from '@/components/latest-briefing'

export default function Page() {
  return (
    <main>
      <Chat
        briefing={
          <>
            <nav aria-label="Pagine del quartier generale" className="mt-4 flex flex-wrap gap-2">
              {navigationPages.map(page => (
                <Link key={page.href} href={page.href} className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                  {page.label}
                </Link>
              ))}
            </nav>
            <Suspense fallback={null}>
              <LatestBriefing />
            </Suspense>
          </>
        }
      />
    </main>
  )
}
