// Read and write the `job_offers` table from the app's server code (service role client,
// the only key RLS lets through): call these only from Server Components or Server Actions.
import { db, unwrap } from '@/agent/lib/db'

// The only values the database accepts (see the job_offers status check).
export const JOB_OFFER_STATUSES = ['contacted', 'rejected', 'in_negotiation'] as const
export type JobOfferStatus = (typeof JOB_OFFER_STATUSES)[number]

export type JobOffer = {
  id: string
  job_title: string
  job_offer_link: string | null
  company_link: string | null
  deadline: string | null
  applied_on: string | null
  status: JobOfferStatus
  created_at: string
}

export type JobOfferChanges = Partial<Omit<JobOffer, 'id' | 'created_at'>>

const COLUMNS = 'id, job_title, job_offer_link, company_link, deadline, applied_on, status, created_at'

/** Most recent application first; rows without an application date (just added) on top. */
export async function listJobOffers(): Promise<JobOffer[]> {
  const { data, error } = await db()
    .from('job_offers')
    .select(COLUMNS)
    .order('applied_on', { ascending: false, nullsFirst: true })
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as JobOffer[]
}

export async function createJobOffer(): Promise<JobOffer> {
  return unwrap(await db().from('job_offers').insert({}).select(COLUMNS).single()) as JobOffer
}

/** False when no row has that id. */
export async function updateJobOffer(id: string, changes: JobOfferChanges): Promise<boolean> {
  const { data, error } = await db().from('job_offers').update(changes).eq('id', id).select('id')
  if (error) throw new Error(error.message)
  return (data ?? []).length > 0
}

export async function deleteJobOffer(id: string): Promise<void> {
  const { error } = await db().from('job_offers').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
