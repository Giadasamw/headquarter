import { Suspense } from 'react'
import { Chat } from '@/components/chat'
import { LatestBriefing } from '@/components/latest-briefing'

export default function Page() {
  return (
    <main>
      <Chat
        briefing={
          <Suspense fallback={null}>
            <LatestBriefing />
          </Suspense>
        }
      />
    </main>
  )
}
