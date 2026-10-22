// Read and write the `contacts` and `prototypes` tables from the app's server code.
// Uses the service role client (agent/lib/db.ts), which is the only key RLS lets through,
// so call these only from Server Components, Route Handlers or Server Actions.
import { db, unwrap } from '@/agent/lib/db'

// The only values the database accepts (see the contacts_type_check / contacts_status_check rules).
export const CONTACT_TYPES = ['azienda', 'conversazione'] as const
export const CONTACT_STATUSES = [
  'grezzo',
  'da contattare',
  'attivo',
  'in trattativa',
  'spento',
  'rifiutato',
] as const

export type ContactType = (typeof CONTACT_TYPES)[number]
export type ContactStatus = (typeof CONTACT_STATUSES)[number]

export type Contact = {
  id: string
  name: string | null
  contact_person: string | null
  status: ContactStatus | null
  created_at: string | null
  last_update: string | null
  last_direction: string | null
  email: string | null
  link: string | null
  location: string | null
  timezone: string | null
  offer: string | null
  notes?: string | null
  summary: string | null
  next_step: string | null
  type: ContactType | null
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
  'id, name:company, contact_person:person, status, created_at, last_update, last_direction, email, link, location, timezone, offer, notes, summary, next_step, type'

const PROTOTYPE_COLUMNS = 'id, title, figma_url, status, sent_at, notes, created_at'

/**
 * Contacts, most recently updated first.
 * By default only companies (type "azienda"); pass `onlyCompanies: false` to include validation conversations.
 */
export async function listContacts(
  filters: { status?: ContactStatus; onlyCompanies?: boolean } = {},
): Promise<Contact[]> {
  const { status, onlyCompanies = true } = filters
  let query = db()
    .from('contacts')
    .select(CONTACT_COLUMNS)
    .order('last_update', { ascending: false, nullsFirst: false })
  if (status) query = query.eq('status', status)
  if (onlyCompanies) query = query.eq('type', 'azienda')
  return unwrap(await query) as unknown as Contact[]
}

export async function getContact(id: string): Promise<Contact | null> {
  return unwrap(await db().from('contacts').select(CONTACT_COLUMNS).eq('id', id).maybeSingle()) as unknown as Contact | null
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
