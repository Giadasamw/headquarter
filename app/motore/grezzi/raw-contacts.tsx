'use client'

import { useState, useTransition } from 'react'
import { Check, X, ExternalLink, List, PanelsTopLeft, ArrowRight } from 'lucide-react'
import { decideRawContact } from './actions'
import styles from './grezzi.module.css'

type RawContact = { id: string; name: string | null; contact_person: string | null; link: string | null; location: string | null; timezone: string | null; notes: string | null }
const nameOf = (contact: RawContact) => contact.name?.trim() || 'Azienda da trovare'
function website(value: string | null) {
  if (!value?.trim()) return null
  try {
    const url = new URL(/^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null
  } catch { return null }
}

export function RawContacts({ contacts }: { contacts: RawContact[] }) {
  const [queue, setQueue] = useState(contacts)
  const [list, setList] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const contact = queue[0]
  const href = contact ? website(contact.link) : null

  function decide(status: 'da contattare' | 'rifiutato') {
    if (!contact || pending) return
    setError('')
    startTransition(async () => {
      try {
        const result = await decideRawContact(contact.id, status)
        if (result.error) { setError(result.error); return }
        setQueue(current => current.filter(item => item.id !== contact.id))
      } catch { setError('Non è stato possibile salvare. Riprova tra poco.') }
    })
  }

  return <>
    <header className={styles.header}>
      <div><div className={styles.headingRow}><h1 className={styles.title}>Contatti grezzi</h1><span className={styles.count} aria-live="polite">{queue.length} da valutare</span></div><p className={styles.subtitle}>Guardane uno alla volta e decidi.</p></div>
      <button className={styles.button} disabled={pending} onClick={() => setList(value => !value)} aria-label={list ? 'Vista uno alla volta' : 'Vista lista'}>{list ? <PanelsTopLeft aria-hidden="true" /> : <List aria-hidden="true" />}{list ? 'Uno alla volta' : 'Lista'}</button>
    </header>
    {!contact ? <section className={styles.empty}><h2>Per ora hai valutato tutti i contatti.</h2><p>Quando ne arriveranno di nuovi, li troverai qui. Buon lavoro!</p></section> : list ? <ul className={styles.list}>{queue.map(item => <li key={item.id}><button onClick={() => { setQueue(current => [...current.filter(c => c.id === item.id), ...current.filter(c => c.id !== item.id)]); setList(false); setError('') }}><span>{nameOf(item)}</span><span className={styles.subtitle}>{item.location?.trim() || 'da trovare'}</span></button></li>)}</ul> : <>
      <article className={styles.card} aria-busy={pending}>
        <div className={styles.cardHeader}><div><h2>{nameOf(contact)}</h2>{href ? <a className={styles.website} href={href} target="_blank" rel="noopener noreferrer">{contact.link}<ExternalLink aria-hidden="true" /><span className={styles.srOnly}> (si apre in una nuova scheda)</span></a> : <p className={styles.missing}>Sito da trovare</p>}</div><span className={styles.position}>1 di {queue.length}</span></div>
        <dl className={styles.facts}>{[['Dove', contact.location], ['Fuso orario', contact.timezone], ['Referente', contact.contact_person]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd className={!value?.trim() ? styles.missing : undefined}>{value?.trim() || 'da trovare'}</dd></div>)}</dl>
        <section className={styles.notes}><h3>Cosa si sa</h3><p>{contact.notes?.trim() || 'Non ci sono ancora informazioni su questo contatto.'}</p></section>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div className={styles.actions}><button className={`${styles.button} ${styles.primary}`} disabled={pending} onClick={() => decide('da contattare')}><Check aria-hidden="true" />La contatto</button><button className={styles.button} disabled={pending} onClick={() => decide('rifiutato')}><X aria-hidden="true" />Scarto</button><button className={styles.button} disabled={pending} onClick={() => { setQueue(current => [...current.slice(1), current[0]]); setError('') }}>Più tardi</button></div>
        <span className={styles.srOnly} role="status">{pending ? 'Salvataggio in corso' : ''}</span>
      </article>
      {queue.length > 1 && <p className={styles.upcoming}><ArrowRight aria-hidden="true" />Prossimi: {queue.slice(1, 4).map(nameOf).join(', ')}</p>}
    </>}
  </>
}
