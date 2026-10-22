import 'server-only'
import { db, unwrap } from '@/agent/lib/db'

export type TemplateItem = {
  id: string
  title: string
  category: string | null
  body: string | null
  notes: string | null
  works: boolean | null
  used: number
  replies: number
}

type TemplateRow = Omit<TemplateItem, 'used' | 'replies'>

export async function listTemplates(): Promise<TemplateItem[]> {
  const templates: TemplateRow[] = []
  for (let offset = 0; ; offset += 500) {
    const rows = unwrap(await db().from('templates')
      .select('id, title, category, body, notes, works')
      .order('created_at', { ascending: false }).order('id')
      .range(offset, offset + 499)) as TemplateRow[]
    templates.push(...rows)
    if (rows.length < 500) break
  }
  return Promise.all(templates.map(async template => {
    const [used, replies] = await Promise.all([
      db().from('contacts').select('id', { count: 'exact', head: true }).eq('template_id', template.id),
      db().from('contacts').select('id', { count: 'exact', head: true }).eq('template_id', template.id).eq('last_direction', 'in'),
    ])
    if (used.error || replies.error) throw new Error('Impossibile contare le risposte ai template.')
    return { ...template, used: used.count ?? 0, replies: replies.count ?? 0 }
  }))
}
