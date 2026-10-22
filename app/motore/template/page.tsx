import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { Bricolage_Grotesque } from 'next/font/google'
import { listTemplates } from '@/lib/templates'
import { TemplateBrowser } from './template-browser'
import styles from './template.module.css'

const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: ['400', '500'] })
export const metadata: Metadata = { title: 'Template | Quartier generale', description: 'Messaggi, oggetti e risposte dei template, in sola lettura.', robots: { index: false, follow: false } }
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f7f5f2' }
export const dynamic = 'force-dynamic'

export default async function TemplatePage() {
  let templates
  try {
    templates = await listTemplates()
  } catch {
    return <main className={`${styles.page} ${bricolage.className}`}><div className={styles.container}><Link className={styles.home} href="/">Quartier generale ↗</Link><h1 className={styles.title}>Template</h1><p role="alert">Non riusciamo a caricare i template in questo momento. Riprova tra poco.</p></div></main>
  }
  return <main className={`${styles.page} ${bricolage.className}`}><div className={styles.container}><Link className={styles.home} href="/">Quartier generale ↗</Link><header className={styles.heading}><h1 className={styles.title}>Template</h1><span>{templates.length} template</span></header><TemplateBrowser templates={templates} /></div></main>
}
