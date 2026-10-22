import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import { CONTACT_STATUSES, listContacts } from '@/lib/contacts'
import { ContactBoard } from './contact-board'
import styles from './lavagna.module.css'

const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: ['400', '500'] })
export const metadata: Metadata = {
  title: 'Lavagna contatti | Quartier generale',
  description: 'La lavagna dei contatti del quartier generale, in sola lettura.',
  robots: { index: false, follow: false },
}
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f7f5f2' }
export const dynamic = 'force-dynamic'

export default async function LavagnaPage() {
  let contacts
  try {
    contacts = await listContacts({ onlyCompanies: false })
  } catch {
    return <main className={`${styles.page} ${bricolage.className}`}><div className={styles.container}><p className={styles.eyebrow}>Quartier generale / Motore</p><h1 className={styles.title}>Lavagna contatti</h1><p role="alert">Non riusciamo a caricare i contatti in questo momento. Riprova tra poco.</p></div></main>
  }
  const now = Date.now()
  const weekStart = now - 7 * 24 * 60 * 60 * 1000
  const weeklyCount = contacts.filter(contact => {
    const createdAt = contact.created_at ? Date.parse(contact.created_at) : NaN
    return contact.status === 'da contattare' && createdAt >= weekStart && createdAt <= now
  }).length
  return <main className={`${styles.page} ${bricolage.className}`}><ContactBoard weeklyCount={weeklyCount} statuses={CONTACT_STATUSES} contacts={contacts.map(({ id, name, contact_person, status, last_update, last_direction }) => ({ id, name, contact_person, status, last_update, last_direction }))} /></main>
}
