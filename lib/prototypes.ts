import 'server-only'
import { db, unwrap } from '@/agent/lib/db'

export type PrototypeCard = {
  id: string
  title: string
  url: string | null
  contact_id: string | null
  status: string | null
  source: string | null
  sent_at: string | null
  created_at: string | null
  company: string | null
}

export async function listPrototypes(): Promise<PrototypeCard[]> {
  const prototypes = unwrap(await db().from('prototypes').select('id, title, url, contact_id, status, source, sent_at, created_at').order('created_at', { ascending: false, nullsFirst: false })) as Omit<PrototypeCard, 'company'>[]
  const contactIds = [...new Set(prototypes.flatMap(p => p.contact_id ? [p.contact_id] : []))]
  const contacts = contactIds.length ? unwrap(await db().from('contacts').select('id, company').in('id', contactIds)) as { id: string; company: string | null }[] : []
  const companies = new Map(contacts.map(c => [c.id, c.company]))
  return prototypes.map(p => ({ ...p, company: p.contact_id ? companies.get(p.contact_id) ?? null : null })).sort((a, b) => Number(a.status === 'mandato') - Number(b.status === 'mandato'))
}
