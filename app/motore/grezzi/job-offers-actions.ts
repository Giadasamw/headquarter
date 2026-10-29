'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import {
  createJobOffer, deleteJobOffer, updateJobOffer,
  JOB_OFFER_STATUSES, type JobOffer, type JobOfferChanges,
} from '@/lib/job-offers'
import { isValidSessionToken, SESSION_COOKIE } from '@/lib/hq-auth'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATE = /^\d{4}-\d{2}-\d{2}$/

async function signedIn() {
  const development = process.env.NODE_ENV === 'development' && !process.env.VERCEL_ENV
  return development || isValidSessionToken((await cookies()).get(SESSION_COOKIE)?.value)
}

// The columns the table can edit, each with the rule its value must follow.
const FIELDS: Record<keyof JobOfferChanges, (value: string) => string | null | undefined> = {
  job_title: (value) => value.trim().slice(0, 300),
  job_offer_link: (value) => value.trim().slice(0, 2000) || null,
  company_link: (value) => value.trim().slice(0, 2000) || null,
  deadline: (value) => (value === '' ? null : DATE.test(value) ? value : undefined),
  applied_on: (value) => (value === '' ? null : DATE.test(value) ? value : undefined),
  status: (value) => ((JOB_OFFER_STATUSES as readonly string[]).includes(value) ? value : undefined),
}

export async function addJobOffer(): Promise<{ offer?: JobOffer; error?: string }> {
  if (!(await signedIn())) return { error: 'Sign in to the headquarter to save.' }
  try {
    const offer = await createJobOffer()
    revalidatePath('/motore/grezzi')
    return { offer }
  } catch {
    return { error: 'Could not add the job offer. Try again in a moment.' }
  }
}

export async function saveJobOfferField(id: string, field: string, value: string): Promise<{ value?: string | null; error?: string }> {
  if (!(await signedIn())) return { error: 'Sign in to the headquarter to save.' }
  const clean = Object.hasOwn(FIELDS, field) && typeof value === 'string' ? FIELDS[field as keyof JobOfferChanges](value) : undefined
  if (!UUID.test(id) || clean === undefined) return { error: 'This value is not valid.' }
  try {
    if (!(await updateJobOffer(id, { [field]: clean }))) return { error: 'Job offer not found. Reload the page.' }
  } catch {
    return { error: 'Could not save. Try again in a moment.' }
  }
  revalidatePath('/motore/grezzi')
  return { value: clean }
}

export async function removeJobOffer(id: string): Promise<{ error?: string }> {
  if (!(await signedIn())) return { error: 'Sign in to the headquarter to save.' }
  if (!UUID.test(id)) return { error: 'This job offer is not valid.' }
  try {
    await deleteJobOffer(id)
  } catch {
    return { error: 'Could not delete. Try again in a moment.' }
  }
  revalidatePath('/motore/grezzi')
  return {}
}
