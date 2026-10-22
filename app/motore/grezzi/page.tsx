import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import Link from 'next/link'
import { listContacts } from '@/lib/contacts'
import { RawContacts } from './raw-contacts'
import styles from './grezzi.module.css'

const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: ['400', '500'] })
export const metadata: Metadata = {
  title: 'Contatti grezzi | Quartier generale',
  description: 'Valuta i contatti grezzi, uno alla volta oppure in lista.',
  robots: { index: false, follow: false },
}
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f7f5f2' }
export const dynamic = 'force-dynamic'

export default async function GrezziPage() {
  let contacts
  try {
    contacts = await listContacts({ status: 'grezzo', onlyCompanies: false })
  } catch {
    return <main className={`${styles.page} ${bricolage.className}`}><div className={styles.container}><Link href="/" className={styles.back}>Quartier generale</Link><h1 className={styles.title}>Contatti grezzi</h1><p role="alert">Non riusciamo a caricare i contatti. Riprova tra poco.</p></div></main>
  }
  return <main className={`${styles.page} ${bricolage.className}`}><div className={styles.container}><Link href="/" className={styles.back}>← Quartier generale</Link><RawContacts contacts={contacts.map(({ id, name, contact_person, link, location, timezone, notes }) => ({ id, name, contact_person, link, location, timezone, notes: notes ?? null }))} /></div></main>
}
