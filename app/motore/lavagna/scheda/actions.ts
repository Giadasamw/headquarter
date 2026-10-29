'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { CONTACT_STATUSES, updateContact, type ContactStatus } from '@/lib/contacts'
import { isValidSessionToken, SESSION_COOKIE } from '@/lib/hq-auth'

export async function saveContactAction(id: string, _previous: { message: string }, form: FormData) {
  const development = process.env.NODE_ENV === 'development' && !process.env.VERCEL_ENV
  if (!development && !await isValidSessionToken((await cookies()).get(SESSION_COOKIE)?.value)) return { message: 'Accedi al quartier generale per salvare.' }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return { message: 'Contatto non valido.' }
  const operation = form.get('operation')
  try {
    if (operation === 'status') {
      const status = form.get('status')
      if (typeof status !== 'string' || !CONTACT_STATUSES.includes(status as ContactStatus)) return { message: 'Scegli uno stato valido.' }
      const updated = await updateContact(id, { status: status as ContactStatus })
      if (!updated) return { message: 'Contatto non trovato.' }
    } else if (operation === 'in' || operation === 'out') {
      const updated = await updateContact(id, { last_direction: operation, last_update: new Date().toISOString() })
      if (!updated) return { message: 'Contatto non trovato.' }
    } else return { message: 'Operazione non valida.' }
  } catch {
    return { message: 'Non è stato possibile salvare. Riprova tra poco.' }
  }
  revalidatePath('/motore/lavagna')
  revalidatePath('/motore/lavagna/scheda')
  return { message: 'Aggiornamento salvato.' }
}
