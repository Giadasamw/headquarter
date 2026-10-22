'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PrototypeCard } from '@/lib/prototypes'
import styles from './prototipi.module.css'

const filters = [{ value: 'tutti', label: 'Tutti' }, { value: 'mandati', label: 'Mandati' }, { value: 'non mandati', label: 'Non mandati' }] as const
const dateFormat = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
function safeUrl(value: string | null) {
  try { const url = new URL(value ?? ''); return ['https:', 'http:'].includes(url.protocol) ? url.href : null } catch { return null }
}
function SentDate({ value }: { value: string | null }) {
  return value && !Number.isNaN(Date.parse(value)) ? <>mandato il <time dateTime={value}>{dateFormat.format(new Date(value))}</time></> : <>mandato, data non disponibile</>
}

export function PrototypeGrid({ prototypes }: { prototypes: PrototypeCard[] }) {
  const [filter, setFilter] = useState<string>('tutti')
  const pending = prototypes.filter(p => p.status !== 'mandato').length
  const visible = prototypes.filter(p => filter === 'tutti' || (filter === 'mandati' ? p.status === 'mandato' : p.status !== 'mandato'))
  return <div className={styles.container}>
    <header className={styles.header}>
      <div className={styles.navigation}><p>Quartier generale / Motore</p><Link className={styles.home} href="/">Quartier generale ↗</Link></div>
      <div className={styles.heading}><h1 className={styles.title}>Prototipi</h1><p>{`${prototypes.length} ${prototypes.length === 1 ? 'prototipo' : 'prototipi'}, ${pending} ancora da mandare`}</p></div>
    </header>
    <div className={styles.filters} role="group" aria-label="Filtra prototipi">{filters.map(item => <button key={item.value} type="button" aria-pressed={filter === item.value} className={styles.filter} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div>
    <p className={styles.srOnly} role="status">{visible.length} prototipi visualizzati</p>
    {visible.length ? <div className={styles.grid}>{visible.map(prototype => {
      const url = safeUrl(prototype.url)
      return <article key={prototype.id} className={styles.card}>
        <h2 className={styles.cardTitle}>{url ? <a className={styles.prototypeLink} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${prototype.title}, apri in una nuova scheda`}>{prototype.title}<span className={styles.arrow} aria-hidden="true">↗</span></a> : prototype.title}</h2>
        <p className={styles.company}>{prototype.contact_id ? <Link href={`/motore/lavagna/${prototype.contact_id}`}>{prototype.company || 'Azienda non indicata'}</Link> : 'Nessuna azienda collegata'}</p>
        <div className={styles.badges}><span className={`${styles.badge} ${prototype.source === 'figma' ? styles.figma : styles.vercel}`}>{prototype.source === 'figma' ? 'Figma' : prototype.source === 'vercel' ? 'Vercel' : 'Fonte non indicata'}</span><span className={`${styles.badge} ${prototype.status !== 'mandato' ? styles.draft : ''}`}>{prototype.status === 'mandato' ? <SentDate value={prototype.sent_at} /> : 'bozza, non ancora mandato'}</span></div>
        {!url && <p className={styles.unavailable}>Collegamento non disponibile</p>}
      </article>
    })}</div> : <section className={styles.empty}><h2>{prototypes.length ? 'Nessun prototipo con questo stato' : 'Qui prenderanno forma le prossime idee'}</h2><p>{prototypes.length ? 'Prova un altro filtro per ritrovare i tuoi prototipi.' : 'Non ci sono ancora prototipi. Quando arriveranno, li troverai tutti qui.'}</p></section>}
  </div>
}
