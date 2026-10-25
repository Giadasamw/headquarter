import { cookies } from 'next/headers'
import { connection } from 'next/server'
import { db, TIMEZONE } from '@/agent/lib/db'
import { TestoFormattato } from '@/components/testo-formattato'
import { isValidSessionToken, SESSION_COOKIE } from '@/lib/hq-auth'

export async function LatestBriefing() {
  await connection()

  // The briefing now lives in the root layout, so it also renders on /login: show it only after login.
  const development = process.env.NODE_ENV === 'development' && !process.env.VERCEL_ENV
  if (!development && !(await isValidSessionToken((await cookies()).get(SESSION_COOKIE)?.value))) return null

  // Shown on every page now: a failure here must never break the page around it.
  let result
  try {
    result = await db()
      .from('briefings')
      .select('date, text')
      .order('date', { ascending: false })
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle()
  } catch (error) {
    console.error('Failed to load latest briefing:', error instanceof Error ? error.message : error)
    return null
  }
  const { data, error } = result

  if (error) {
    console.error('Failed to load latest briefing:', error.message)
    return null
  }
  if (!data) return null

  const label = new Date(`${data.date}T12:00:00Z`).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
  const isToday =
    data.date ===
    new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date())

  return (
    <details open className="group shrink-0 rounded-(--raggio-lg) border border-border">
      <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 px-6 py-4">
        <span className="font-medium">
          {isToday ? 'Briefing di oggi' : 'Ultimo briefing'}
        </span>
        <span className="text-[13px] capitalize text-muted-foreground">{label}</span>
      </summary>
      <div className="max-h-64 overflow-y-auto px-6 pb-4 text-foreground">
        <TestoFormattato testo={data.text} />
      </div>
    </details>
  )
}
