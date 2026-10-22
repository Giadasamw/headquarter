import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { Bricolage_Grotesque } from 'next/font/google'
import { listPrototypes } from '@/lib/prototypes'
import { PrototypeGrid } from './prototype-grid'
import styles from './prototipi.module.css'

const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: ['400', '500'] })
export const metadata: Metadata = { title: 'Prototipi | Quartier generale', description: 'Tutti i prototipi e quelli ancora da mandare, in sola lettura.', robots: { index: false, follow: false } }
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f7f5f2' }
export const dynamic = 'force-dynamic'

export default async function PrototipiPage() {
  let prototypes
  try {
    prototypes = await listPrototypes()
  } catch {
    return <main className={`${styles.page} ${bricolage.className}`}><div className={styles.container}><Link href="/" className={styles.home}>Quartier generale ↗</Link><h1 className={styles.title}>Prototipi</h1><p role="alert">Non riusciamo a caricare i prototipi in questo momento. Riprova tra poco.</p></div></main>
  }
  return <main className={`${styles.page} ${bricolage.className}`}><PrototypeGrid prototypes={prototypes} /></main>
}
