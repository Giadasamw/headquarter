'use client'

import { useState } from 'react'
import type { Contact, ContactStatus } from '@/lib/contacts'
import styles from './lavagna.module.css'

type BoardContact = Pick<Contact, 'id' | 'name' | 'contact_person' | 'status' | 'last_update' | 'last_direction'>
const dateFormat = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' })
function Direction({ direction }: { direction: string | null }) {
  const label = direction === 'in' ? 'Tocca a noi rispondere' : direction === 'out' ? 'Aspettiamo risposta' : 'Direzione non disponibile'
  return <span className={styles.direction} title={label}><span aria-hidden="true" className={`${styles.dot} ${direction === 'in' ? styles.incoming : direction === 'out' ? styles.outgoing : styles.unknown}`} /><span className={styles.srOnly}>{label}</span></span>
}
function UpdatedDate({ value }: { value: string | null }) {
  if (!value || Number.isNaN(Date.parse(value))) return <span>Non disponibile</span>
  return <time dateTime={value}>{dateFormat.format(new Date(value))}</time>
}

export function ContactBoard({ contacts, statuses, weeklyCount }: { contacts: BoardContact[]; statuses: readonly ContactStatus[]; weeklyCount: number }) {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const filtered = contacts.filter(contact => (!status || contact.status === status) && (contact.name ?? '').toLocaleLowerCase('it').includes(search.trim().toLocaleLowerCase('it')))
  return <div className={styles.container}>
    <header className={styles.header}>
      <p className={styles.eyebrow}>Quartier generale / Motore</p>
      <div className={styles.headingRow}><div><h1 className={styles.title}>Lavagna contatti</h1><p className={styles.subtitle}>Le relazioni, un contatto alla volta.</p></div><span className={styles.readOnly}>Solo lettura</span></div>
    </header>
    <section className={styles.weekly} aria-labelledby="weekly-title"><div><h2 id="weekly-title">Contatti nuovi questa settimana</h2><p>Obiettivo: 5 contatti negli ultimi 7 giorni.</p></div><div className={styles.weeklyValue}>{weeklyCount} <span>su 5</span></div><p className={styles.weeklyNote}>Sono conteggiati i contatti con stato da contattare. I contatti precedenti senza data di inserimento sono esclusi.</p></section>
    <section aria-label="Elenco contatti">
      <div className={styles.filters}><label className={styles.field}>Stato<select value={status} onChange={event => setStatus(event.target.value)}><option value="">Tutti gli stati</option>{statuses.map(value => <option key={value} value={value}>{value}</option>)}</select></label><label className={`${styles.field} ${styles.search}`}>Cerca azienda<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nome dell’azienda" /></label></div>
      <div className={styles.listMeta}><p aria-live="polite">{filtered.length} {filtered.length === 1 ? 'contatto' : 'contatti'}</p><div className={styles.legend}><span><Direction direction="in" />Tocca a noi</span><span><Direction direction="out" />Aspettiamo risposta</span></div></div>
      {filtered.length ? <div className={styles.tableWrap}><table className={styles.table}><caption className={styles.srOnly}>Contatti ordinati per ultimo aggiornamento</caption><thead><tr><th scope="col"><span className={styles.srOnly}>Turno di risposta</span></th><th scope="col">Stato</th><th scope="col">Azienda</th><th scope="col">Referente</th><th scope="col">Ultimo aggiornamento</th></tr></thead><tbody>{filtered.map(contact => <tr key={contact.id}><td><Direction direction={contact.last_direction} /></td><td><span className={styles.status}>{contact.status ?? 'Non indicato'}</span></td><th scope="row">{contact.name || 'Azienda non indicata'}</th><td>{contact.contact_person || 'Referente non indicato'}</td><td><UpdatedDate value={contact.last_update} /></td></tr>)}</tbody></table></div> : <div className={styles.empty}><h2>{contacts.length ? 'Nessun contatto trovato' : 'Qui nasceranno nuove relazioni'}</h2><p>{contacts.length ? 'Prova un altro nome o seleziona uno stato diverso.' : 'Non ci sono ancora contatti. Quando arriveranno, li troverai tutti qui.'}</p></div>}
    </section>
  </div>
}
