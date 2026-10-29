// Reads and writes for the Scrivania (app/motore/scrivania). Uses the service role client
// (agent/lib/db.ts), so call these only from Server Components or Server Actions.
//
// Concepts (see the rooms/tasks schema):
// - a container is a task that other tasks point to with parent_task_id; it is never "done" here;
// - a microtask is a task with parent_task_id;
// - the task in progress is rooms.current_task_id (not status = 'active');
// - for recurring tasks, status = 'active' means "switched on", and each time one is done
//   a row goes into recurring_done (one per task per day).
import { TIMEZONE, db, todayISO, unwrap, weekBounds } from '@/agent/lib/db'

export type Task = {
  id: string
  room_id: string
  title: string
  type: 'one_off' | 'recurring' | 'ongoing'
  status: 'todo' | 'active' | 'done' | 'paused'
  priority_order: number | null
  estimated_minutes: number | null
  depends_on_task_id: string | null
  frequency: 'daily' | 'weekly' | 'monthly' | null
  preferred_day: string | null
  parent_task_id: string | null
  completed_at: string | null
}

type Room = {
  id: string
  name: string
  notes: string | null
  weekly_hours_target: number
  current_task_id: string | null
}

const TASK_COLUMNS =
  'id, room_id, title, type, status, priority_order, estimated_minutes, depends_on_task_id, frequency, preferred_day, parent_task_id, completed_at'

/** The Motore room: the first room whose name starts with "Motore". */
async function motoreRoom(): Promise<Room | null> {
  const { data, error } = await db()
    .from('rooms')
    .select('id, name, notes, weekly_hours_target, current_task_id')
    .ilike('name', 'Motore%')
    .order('priority_order', { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? { ...data, weekly_hours_target: Number(data.weekly_hours_target) } : null
}

const byPlan = (a: Task, b: Task) =>
  (a.priority_order ?? Infinity) - (b.priority_order ?? Infinity) || a.title.localeCompare(b.title, 'it')

/** The room's tasks plus everything derived from their structure. */
export type Plan = {
  room: Room
  tasks: Task[]
  byId: Map<string, Task>
  /** Status of every task a room task depends on, even outside the room. */
  statusOf: Map<string, Task['status']>
  /** Containers in priority order. */
  containers: Task[]
  /** Microtasks in plan order: container by container, then by priority_order. */
  micro: Task[]
}

export async function loadPlan(): Promise<Plan | null> {
  const room = await motoreRoom()
  if (!room) return null
  const tasks = unwrap(await db().from('tasks').select(TASK_COLUMNS).eq('room_id', room.id)) as Task[]
  const byId = new Map(tasks.map((task) => [task.id, task]))
  const statusOf = new Map(tasks.map((task) => [task.id, task.status]))

  const outsideDeps = [...new Set(tasks.map((t) => t.depends_on_task_id).filter((id): id is string => !!id && !byId.has(id)))]
  if (outsideDeps.length) {
    const deps = unwrap(await db().from('tasks').select('id, status').in('id', outsideDeps)) as Pick<Task, 'id' | 'status'>[]
    for (const dep of deps) statusOf.set(dep.id, dep.status)
  }

  const parentIds = new Set(tasks.map((t) => t.parent_task_id).filter(Boolean))
  const containers = tasks.filter((t) => parentIds.has(t.id)).sort(byPlan)
  const rank = new Map(containers.map((c, index) => [c.id, index]))
  const micro = tasks
    .filter((t) => t.parent_task_id)
    .sort((a, b) => (rank.get(a.parent_task_id!) ?? Infinity) - (rank.get(b.parent_task_id!) ?? Infinity) || byPlan(a, b))
  return { room, tasks, byId, statusOf, containers, micro }
}

/**
 * First microtask not done, in plan order, whose dependency (if any) is done.
 * If every open microtask waits on something, the first open one: the list never looks stuck.
 */
export function nextMicrotask(plan: Plan, statusOf = plan.statusOf): Task | null {
  const open = plan.micro.filter((t) => statusOf.get(t.id) !== 'done')
  const ready = open.find((t) => !t.depends_on_task_id || statusOf.get(t.depends_on_task_id) === 'done')
  return ready ?? open[0] ?? null
}

/** The task shown as "in corso": the bookmark if it points to an open task, otherwise the next microtask. */
export function currentTask(plan: Plan): Task | null {
  const bookmarked = plan.room.current_task_id ? plan.byId.get(plan.room.current_task_id) : undefined
  if (bookmarked && bookmarked.status !== 'done') return bookmarked
  return nextMicrotask(plan)
}

/** A task that can go in the "Da fare una volta" list: not recurring and not a container. */
export function isListTask(plan: Plan, task: Task): boolean {
  return task.type !== 'recurring' && !plan.containers.some((c) => c.id === task.id)
}

// ---- Recurring tasks ----

/** First day of the period a recurring task belongs to today: today, this Monday, or the 1st of the month. */
export function periodStart(frequency: Task['frequency'], today = todayISO()): string {
  if (frequency === 'weekly') return weekBounds(today).monday
  if (frequency === 'monthly') return `${today.slice(0, 8)}01`
  return today
}

/** Ids of recurring tasks already done in their current period. */
export async function recurringDoneIds(tasks: Task[]): Promise<Set<string>> {
  if (!tasks.length) return new Set()
  const today = todayISO()
  const earliest = tasks.map((t) => periodStart(t.frequency, today)).sort()[0]
  const rows = unwrap(
    await db()
      .from('recurring_done')
      .select('task_id, done_on')
      .in('task_id', tasks.map((t) => t.id))
      .gte('done_on', earliest)
      .lte('done_on', today),
  ) as { task_id: string; done_on: string }[]
  const frequencyOf = new Map(tasks.map((t) => [t.id, t.frequency]))
  return new Set(rows.filter((row) => row.done_on >= periodStart(frequencyOf.get(row.task_id) ?? null, today)).map((row) => row.task_id))
}

// ---- Hours ----

type LogRow = {
  date: string
  room_id: string
  hours: number
  source: 'toggl' | 'journal' | 'manual'
  also_counts_for_room_id: string | null
  task: { counts_also_for_room_id: string | null } | null
}

/**
 * Hours logged this week (Monday to Sunday, London time) for the room, with the same rule Sophie
 * uses in the briefing (agent/tools/get_overview.ts), so the two numbers always match:
 * a row counts for its room and for also_counts_for_room_id; entries no longer on Toggl don't count;
 * journal hours don't count on a day that already has Toggl hours for the room.
 */
export async function hoursThisWeek(roomId: string): Promise<number> {
  const { monday, sunday } = weekBounds(todayISO())
  const rows = unwrap(
    await db()
      .from('time_log')
      .select('date, room_id, hours, source, also_counts_for_room_id, task:tasks(counts_also_for_room_id)')
      .is('toggl_missing_since', null)
      .gte('date', monday)
      .lte('date', sunday),
  ) as unknown as LogRow[]

  const countsForRoom = (row: LogRow) =>
    row.room_id === roomId ||
    row.also_counts_for_room_id === roomId ||
    (row.source !== 'toggl' && row.task?.counts_also_for_room_id === roomId)
  const mine = rows.filter(countsForRoom)
  const togglDays = new Set(mine.filter((row) => row.source === 'toggl').map((row) => row.date))
  const total = mine
    .filter((row) => !(row.source === 'journal' && togglDays.has(row.date)))
    .reduce((sum, row) => sum + Number(row.hours), 0)
  return Math.round(total * 100) / 100
}

// ---- Milestone ----

export async function nextMilestone(roomId: string) {
  const { data, error } = await db()
    .from('milestones')
    .select('title, due_date, success_criteria')
    .eq('room_id', roomId)
    .eq('status', 'pending')
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data as { title: string; due_date: string | null; success_criteria: string | null } | null
}

// ---- Formatting ----

const number = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 })

export const formatNumber = (value: number) => number.format(value)

/** Minutes as words: "45 minuti", "1 ora", "1,5 ore". Null when there is no estimate. */
export function formatMinutes(minutes: number | null): string | null {
  if (minutes === null || minutes <= 0) return null
  if (minutes < 60) return `${minutes} minuti`
  const hours = minutes / 60
  return hours === 1 ? '1 ora' : `${number.format(hours)} ore`
}

/** "Giovedì 22 ottobre 2026", in London time. */
export function todayLabel(): string {
  const label = new Date().toLocaleDateString('it-IT', {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** "Finita il 28 ottobre alle 14:32" (with the year when it isn't this year), in London time. */
export function completedLabel(completedAt: string | null): string | null {
  if (!completedAt) return null
  const date = new Date(completedAt)
  if (Number.isNaN(date.getTime())) return null
  const sameYear = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric' }).format(date) === todayISO().slice(0, 4)
  const day = date.toLocaleDateString('it-IT', { timeZone: TIMEZONE, day: 'numeric', month: 'long', ...(sameYear ? {} : { year: 'numeric' }) })
  const time = date.toLocaleTimeString('it-IT', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit' })
  return `Finita il ${day} alle ${time}`
}

/** "Entro il 30 novembre" (with the year when it isn't this year). */
export function dueLabel(dueDate: string | null): string {
  if (!dueDate) return 'Senza scadenza'
  const date = new Date(`${dueDate}T12:00:00Z`)
  const sameYear = dueDate.slice(0, 4) === todayISO().slice(0, 4)
  const label = date.toLocaleDateString('it-IT', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
  return `Entro il ${label}`
}

export function cadenceLabel(task: Task): string {
  if (task.frequency === 'daily') return 'Ogni giorno'
  if (task.frequency === 'monthly') return 'Ogni mese'
  if (task.frequency === 'weekly') return task.preferred_day?.trim() ? `Ogni settimana, ${task.preferred_day.trim()}` : 'Ogni settimana'
  return 'Ricorrente'
}

/** "Motore: siti per aziende a impatto" → title "Motore", subtitle "siti per aziende a impatto" (capitalised). */
export function splitRoomName(name: string): { title: string; subtitle: string | null } {
  const colon = name.indexOf(':')
  if (colon === -1) return { title: name.trim(), subtitle: null }
  const subtitle = name.slice(colon + 1).trim()
  return {
    title: name.slice(0, colon).trim(),
    subtitle: subtitle ? subtitle.charAt(0).toUpperCase() + subtitle.slice(1) : null,
  }
}

/** The sentence of the room notes that mentions "priorità", or null. */
export function priorityLine(notes: string | null): string | null {
  if (!notes) return null
  return notes.split(/(?<=[.!?])\s+/).find((sentence) => /priorit[àa]/i.test(sentence))?.trim() ?? null
}
