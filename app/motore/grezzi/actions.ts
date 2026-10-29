'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getContact, updateContact } from '@/lib/contacts'
import { isValidSessionToken, SESSION_COOKIE } from '@/lib/hq-auth'

export async function decideRawContact(id: string, status: 'da contattare' | 'rifiutato'): Promise<{ error?: string }> {
  const development = process.env.NODE_ENV === 'development' && !process.env.VERCEL_ENV
  if (!development && !await isValidSessionToken((await cookies()).get(SESSION_COOKIE)?.value)) return { error: 'Accedi al quartier generale per salvare.' }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || !['da contattare', 'rifiutato'].includes(status)) return { error: 'Scelta non valida.' }
  try {
    const contact = await getContact(id)
    if (!contact || contact.status !== 'grezzo') return { error: 'Questo contatto non è più da valutare. Ricarica la pagina.' }
    if (!await updateContact(id, { status })) return { error: 'Contatto non trovato.' }
  } catch {
    return { error: 'Non è stato possibile salvare. Riprova tra poco.' }
  }
  revalidatePath('/motore/grezzi')
  revalidatePath('/motore/lavagna')
  revalidatePath('/motore/lavagna/scheda')
  return {}
}
