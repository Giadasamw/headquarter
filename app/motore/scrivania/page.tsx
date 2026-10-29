import type { Metadata, Viewport } from 'next'
import { Inter, Lora } from 'next/font/google'
import Link from 'next/link'
import {
  cadenceLabel, completedLabel, currentTask, dueLabel, formatMinutes, formatNumber, hoursThisWeek, isListTask, loadPlan,
  nextMilestone, priorityLine, recurringDoneIds, splitRoomName, todayLabel,
} from '@/lib/scrivania'
import { Scrivania, type DeskData } from './scrivania'
import styles from './scrivania.module.css'

const lora = Lora({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-lora' })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter' })
export const metadata: Metadata = {
  title: 'Scrivania | Quartier generale',
  description: 'La scrivania della stanza Motore: la task in corso, la lista, le ricorrenti e le ore della settimana.',
  robots: { index: false, follow: false },
}
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#fdf9f4' }
export const dynamic = 'force-dynamic'

const FREQUENCY_ORDER = { daily: 0, weekly: 1, monthly: 2 } as const

async function loadDesk(): Promise<DeskData | null> {
  const plan = await loadPlan()
  if (!plan) return null
  const { room, tasks, byId, containers, micro } = plan
  const recurring = tasks
    .filter((t) => t.type === 'recurring' && t.status === 'active')
    .sort((a, b) => (FREQUENCY_ORDER[a.frequency ?? 'monthly'] - FREQUENCY_ORDER[b.frequency ?? 'monthly']) || a.title.localeCompare(b.title, 'it'))
  const [hours, milestone, recurringDone] = await Promise.all([
    hoursThisWeek(room.id),
    nextMilestone(room.id),
    recurringDoneIds(recurring),
  ])

  const current = currentTask(plan)
  const groupOf = (parentId: string | null) => (parentId ? byId.get(parentId)?.title ?? null : null)
  const sumMinutes = (list: typeof micro) => list.reduce((sum, t) => sum + (t.estimated_minutes ?? 0), 0)
  const completed = tasks
    .filter((t) => t.status === 'done' && isListTask(plan, t))
    .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? '') || micro.indexOf(a) - micro.indexOf(b))

  return {
    ...splitRoomName(room.name),
    priority: priorityLine(room.notes),
    today: todayLabel(),
    hoursDone: hours,
    hoursDoneLabel: formatNumber(hours),
    hoursTarget: room.weekly_hours_target,
    hoursTargetLabel: formatNumber(room.weekly_hours_target),
    hoursLeftLabel: formatNumber(Math.max(0, Math.round((room.weekly_hours_target - hours) * 100) / 100)),
    current: current && { id: current.id, title: current.title, group: groupOf(current.parent_task_id), hours: formatMinutes(current.estimated_minutes) },
    groups: containers
      .map((container) => {
        const children = micro.filter((t) => t.parent_task_id === container.id)
        return {
          id: container.id,
          title: container.title,
          hours: formatMinutes(sumMinutes(children)),
          items: children
            .filter((t) => t.status !== 'done')
            .map((t) => ({ id: t.id, title: t.title, hours: formatMinutes(t.estimated_minutes), inProgress: t.id === current?.id })),
        }
      })
      .filter((group) => group.items.length > 0),
    recurring: recurring.map((t) => ({ id: t.id, title: t.title, cadence: cadenceLabel(t), hours: formatMinutes(t.estimated_minutes), done: recurringDone.has(t.id) })),
    milestone: milestone && { date: dueLabel(milestone.due_date), title: milestone.title, criteria: milestone.success_criteria },
    completed: completed.map((t) => ({ id: t.id, title: t.title, group: groupOf(t.parent_task_id), hours: formatMinutes(t.estimated_minutes), completedAt: completedLabel(t.completed_at) })),
  }
}

export default async function ScrivaniaPage() {
  let desk
  try {
    desk = await loadDesk()
  } catch {
    desk = undefined
  }
  const fonts = `${styles.page} ${lora.variable} ${inter.variable}`
  if (!desk) {
    return <main className={fonts}><div className={styles.container}><Link href="/" className={styles.back}>← Quartier generale</Link><p className={styles.eyebrow}>Scrivania</p><h1 className={styles.title}>Motore</h1><p role="alert" className={styles.muted}>{desk === null ? 'Non troviamo la stanza Motore nel database.' : 'Non riusciamo a caricare la scrivania. Riprova tra poco.'}</p></div></main>
  }
  return <main className={fonts}><Scrivania desk={desk} /></main>
}
