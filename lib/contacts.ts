// Read and write the `contacts` and `prototypes` tables from the app's server code.
// Uses the service role client (agent/lib/db.ts), which is the only key RLS lets through,
// so call these only from Server Components, Route Handlers or Server Actions.
import { db, unwrap } from '@/agent/lib/db'

/** Contacts of this type are real leads; any other type is a validation conversation. */
export const REAL_CONTACT_TYPE = 'realtà'

export type Contact = {
  id: string
  name: string | null
  contact_person: string | null
  status: string | null
  last_update: string | null
  last_direction: string | null
  email: string | null
  location: string | null
  timezone: string | null
  offer: string | null
  summary: string | null
  next_step: string | null
  type: string | null
}

export type ContactChanges = Partial<Omit<Contact, 'id'>>

export type Prototype = {
  id: string
  title: string
  figma_url: string | null
  status: string | null
  sent_at: string | null
  notes: string | null
  created_at: string | null
}

// In the table the company is `company` and the person is `person` (Sophie writes those),
// so the app's `name` and `contact_person` are aliases of those two columns.
const CONTACT_COLUMNS =
  'id, name:company, contact_person:person, status, last_update, last_direction, email, location, timezone, offer, summary, next_step, type'

const PROTOTYPE_COLUMNS = 'id, title, figma_url, status, sent_at, notes, created_at'

/**
 * Contacts, most recently updated first.
 * By default only real contacts (type "realtà"); pass `onlyReal: false` to include validation conversations.
 */
export async function listContacts(
  filters: { status?: string; onlyReal?: boolean } = {},
): Promise<Contact[]> {
  const { status, onlyReal = true } = filters
  let query = db()
    .from('contacts')
    .select(CONTACT_COLUMNS)
    .order('last_update', { ascending: false, nullsFirst: false })
  if (status) query = query.eq('status', status)
  if (onlyReal) query = query.eq('type', REAL_CONTACT_TYPE)
  return unwrap(await query) as unknown as Contact[]
}

/** Updates only the fields provided and returns the contact as it is now. */
export async function updateContact(id: string, changes: ContactChanges): Promise<Contact> {
  const { name, contact_person, ...rest } = changes
  const row: Record<string, unknown> = { ...rest }
  if (name !== undefined) row.company = name
  if (contact_person !== undefined) row.person = contact_person
  if (Object.keys(row).length === 0) throw new Error('Nothing to update.')

  return unwrap(
    await db().from('contacts').update(row).eq('id', id).select(CONTACT_COLUMNS).maybeSingle(),
  ) as unknown as Contact
}

/** Prototypes linked to a contact, newest first. */
export async function listPrototypesForContact(contactId: string): Promise<Prototype[]> {
  return unwrap(
    await db()
      .from('prototypes')
      .select(PROTOTYPE_COLUMNS)
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false }),
  ) as Prototype[]
}
