'use server'

import { cookies } from 'next/headers'
import { db } from '@/agent/lib/db'
import { isValidSessionToken, SESSION_COOKIE } from '@/lib/hq-auth'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const TASK_STATUS: Record<string, string> = {
  active: 'Attivo',
  todo: 'Rimetto tra i da fare',
  done: 'Segno come fatto',
  paused: 'Metto in pausa',
}

async function nameOf(table: 'tasks' | 'rooms', column: 'title' | 'name', id: unknown): Promise<string | null> {
  if (typeof id !== 'string' || !UUID.test(id)) return null
  const { data } = await db().from(table).select(column).eq('id', id).maybeSingle()
  const value = (data as Record<string, unknown> | null)?.[column]
  return typeof value === 'string' && value ? value : null
}

function joinItalian(parts: string[]): string {
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}` : parts[0]
}

/**
 * The sentence the confirmation card shows: what will be written, and on which row,
 * with the real name read from the database. Null when the call can't be described.
 */
export async function describeApproval(toolName: string, input: unknown): Promise<string | null> {
  const development = process.env.NODE_ENV === 'development' && !process.env.VERCEL_ENV
  if (!development && !(await isValidSessionToken((await cookies()).get(SESSION_COOKIE)?.value))) return null
  if (!input || typeof input !== 'object') return null
  const args = input as Record<string, unknown>

  try {
    if (toolName === 'update_task') {
      const title = await nameOf('tasks', 'title', args.task_id)
      if (!title) return null
      const progress = typeof args.progress_percent === 'number' ? `porto l'avanzamento al ${args.progress_percent}%` : null
      const status = typeof args.status === 'string' ? TASK_STATUS[args.status] : undefined
      if (status) return `${status} il task "${title}"${progress ? ` e ${progress}` : ''}`
      return progress ? `Sul task "${title}" ${progress}` : null
    }

    if (toolName === 'update_room') {
      const name = await nameOf('rooms', 'name', args.room_id)
      if (!name) return null
      const parts: string[] = []
      if (typeof args.weekly_hours_target === 'number') parts.push(`porto le ore settimanali previste a ${args.weekly_hours_target}`)
      if (typeof args.is_active === 'boolean') parts.push(args.is_active ? 'la segno come attiva' : 'la segno come non attiva')
      if (typeof args.priority_order === 'number') parts.push(`metto la priorità a ${args.priority_order}`)
      return parts.length ? `Sulla stanza ${name} ${joinItalian(parts)}` : null
    }
  } catch {
    return null
  }
  return null
}
