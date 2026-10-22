'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { db, todayISO } from '@/agent/lib/db'
import { isValidSessionToken, SESSION_COOKIE } from '@/lib/hq-auth'
import { currentTask, isListTask, loadPlan, nextMicrotask, recurringDoneIds, type Plan, type Task } from '@/lib/scrivania'

type Result = { error?: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const FAILED = 'Non è stato possibile salvare. Riprova tra poco.'
const STALE = 'Questa task è cambiata nel frattempo. Ricarica la pagina.'

async function signedIn(): Promise<boolean> {
  const development = process.env.NODE_ENV === 'development' && !process.env.VERCEL_ENV
  return development || isValidSessionToken((await cookies()).get(SESSION_COOKIE)?.value)
}

/** Checks access and the id, loads the room's tasks, and finds the task. Every write goes through here. */
async function withTask(id: string, run: (plan: Plan, task: Task) => Promise<Result>): Promise<Result> {
  if (!await signedIn()) return { error: 'Accedi al quartier generale per salvare.' }
  if (!UUID.test(id)) return { error: 'Task non valida.' }
  try {
    const plan = await loadPlan()
    const task = plan?.byId.get(id)
    if (!plan || !task) return { error: STALE }
    const result = await run(plan, task)
    if (!result.error) revalidatePath('/motore/scrivania')
    return result
  } catch {
    return { error: FAILED }
  }
}

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

/** Marks a task done. If it was the one in progress, the bookmark moves to the next ready microtask (or empties). */
export async function completeTask(id: string): Promise<Result> {
  return withTask(id, async (plan, task) => {
    if (!isListTask(plan, task) || task.status === 'done') return { error: STALE }
    const wasCurrent = currentTask(plan)?.id === task.id
    check((await db().from('tasks').update({ status: 'done' }).eq('id', task.id)).error)
    if (wasCurrent) {
      const statusOf = new Map(plan.statusOf).set(task.id, 'done')
      const next = nextMicrotask(plan, statusOf)
      check((await db().from('rooms').update({ current_task_id: next?.id ?? null }).eq('id', plan.room.id)).error)
    }
    return {}
  })
}

/** Puts a task in progress without completing it. The previous one goes back to its place in the list. */
export async function setCurrentTask(id: string): Promise<Result> {
  return withTask(id, async (plan, task) => {
    if (!isListTask(plan, task) || task.status === 'done') return { error: STALE }
    check((await db().from('rooms').update({ current_task_id: task.id }).eq('id', plan.room.id)).error)
    return {}
  })
}

/** "Rimetti in lista": a completed task goes back to todo. */
export async function restoreTask(id: string): Promise<Result> {
  return withTask(id, async (plan, task) => {
    if (!isListTask(plan, task) || task.status !== 'done') return { error: STALE }
    check((await db().from('tasks').update({ status: 'todo' }).eq('id', task.id)).error)
    return {}
  })
}

/** Records a recurring task as done today. Its status never changes. */
export async function checkRecurring(id: string): Promise<Result> {
  return withTask(id, async (_plan, task) => {
    if (task.type !== 'recurring' || task.status !== 'active') return { error: STALE }
    if ((await recurringDoneIds([task])).has(task.id)) return {}
    const { error } = await db().from('recurring_done').insert({ task_id: task.id, done_on: todayISO() })
    // 23505 = already a row for this task today (e.g. a double click): nothing to do.
    if (error && error.code !== '23505') throw new Error(error.message)
    return {}
  })
}
