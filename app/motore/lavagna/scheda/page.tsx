import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Bricolage_Grotesque } from 'next/font/google'
import { CONTACT_STATUSES, getContact, listPrototypesForContact } from '@/lib/contacts'
import { ContactControls } from './contact-controls'
import { CopyEmail } from './copy-email'
import { ExternalLink } from 'lucide-react'
import styles from './scheda.module.css'

const font = Bricolage_Grotesque({ subsets: ['latin'], weight: ['400', '500'] })
export const metadata: Metadata = { title: 'Scheda contatto | Quartier generale', robots: { index: false, follow: false } }
const dateFormat = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })
function Empty() { return <span className={styles.missing} aria-label="Non disponibile">{'—'}</span> }
function Value({ value }: { value: string | null }) { return value?.trim() ? <>{value}</> : <Empty /> }
function DateValue({ value }: { value: string | null }) { return value && !isNaN(Date.parse(value)) ? <time dateTime={value}>{dateFormat.format(new Date(value))}</time> : <Empty /> }
function safeUrl(value: string | null) { try { const url = new URL(value ?? ''); return ['https:', 'http:'].includes(url.protocol) ? url.href : null } catch { return null } }

// The contact's id travels as ?id=… on a fixed address (/motore/lavagna/scheda),
// like every other panel: no variable segment in the path.
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ id?: string | string[] }> }) {
  const { id } = await searchParams
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound()
  const contact = await getContact(id)
  if (!contact) notFound()
  const prototypes = await listPrototypesForContact(id)
  const direction = contact.last_direction
  return <main className={`${styles.page} ${font.className}`}><div className={styles.container}>
    <Link className={styles.back} href="/motore/lavagna">← Torna alla lavagna</Link>
    <header className={styles.header}><div><h1>{contact.name || 'Azienda non indicata'}</h1><div className={styles.meta}><span className={styles.status}>{contact.status || 'Stato non indicato'}</span><span className={styles.turn}>{direction && <span aria-hidden="true" className={`${styles.dot} ${direction === 'in' ? styles.incoming : styles.outgoing}`} />}{direction === 'in' ? 'Tocca a te rispondere' : direction === 'out' ? 'Hai risposto, aspetti' : 'Turno non indicato'}</span></div></div><ContactControls id={id} status={contact.status} direction={direction} statuses={CONTACT_STATUSES} /></header>
    <div className={styles.columns}><div className={styles.content}>
      <section className={`${styles.card} ${styles.next}`}><h2>Prossimo passo</h2><p><Value value={contact.next_step} /></p></section>
      <section className={styles.card}><h2>Riassunto dell&apos;interazione</h2><p><Value value={contact.summary} /></p></section>
      <section className={styles.card}><h2>Prototipi mandati</h2>{prototypes.length ? <ul className={styles.prototypes}>{prototypes.map(prototype => { const url = safeUrl(prototype.figma_url); return <li key={prototype.id} className={!prototype.sent_at ? styles.draft : undefined}>{url ? <a href={url} target="_blank" rel="noopener noreferrer">{prototype.title} ↗</a> : <span>{prototype.title}</span>}<small>{prototype.sent_at ? <>Mandato il <DateValue value={prototype.sent_at} /></> : 'Bozza, non ancora mandata'}</small></li> })}</ul> : <p>Non sono ancora stati mandati prototipi.</p>}</section>
      <section className={styles.card}><h2>Proposta offerta</h2><p><Value value={contact.offer} /></p></section>
    </div><aside className={styles.aside}><h2>Anagrafica</h2><dl><dt>Referente</dt><dd><Value value={contact.contact_person} /></dd><dt>Email</dt><dd>{contact.email?.trim() ? <CopyEmail email={contact.email} /> : <Empty />}</dd><dt>Link</dt><dd>{safeUrl(contact.link) ? <a className={styles.externalLink} href={safeUrl(contact.link)!} target="_blank" rel="noopener noreferrer" aria-label="Apri il sito del contatto in una nuova scheda">{new URL(safeUrl(contact.link)!).hostname}<ExternalLink size={16} aria-hidden="true" /></a> : <span className={styles.missing}>Non indicato</span>}</dd><dt>Paese e zona di mercato</dt><dd><Value value={contact.location} /></dd><dt>Fuso orario</dt><dd><Value value={contact.timezone} /></dd><dt className={styles.divider}>Ultimo aggiornamento</dt><dd><DateValue value={contact.last_update} /></dd></dl></aside></div>
  </div></main>
}
