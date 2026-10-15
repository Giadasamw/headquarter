import { connection } from 'next/server'
import { db, TIMEZONE } from '@/agent/lib/db'

export async function LatestBriefing() {
  await connection()

  const { data, error } = await db()
    .from('briefings')
    .select('date, text')
    .order('date', { ascending: false })
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()

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
    <details open className="group mt-4 rounded-2xl border border-border bg-muted/50">
      <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 px-4 py-3 text-sm">
        <span className="font-medium">
          {isToday ? 'Briefing di oggi' : 'Ultimo briefing'}
        </span>
        <span className="text-xs capitalize text-muted-foreground">{label}</span>
      </summary>
      <div className="max-h-64 overflow-y-auto whitespace-pre-wrap px-4 pb-4 text-sm leading-relaxed text-foreground">
        {data.text}
      </div>
    </details>
  )
}
