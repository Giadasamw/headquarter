'use client'

import { useActionState, useState } from 'react'
import { saveContactAction } from './actions'
import styles from './scheda.module.css'

export function ContactControls({ id, status, direction, statuses }: { id: string; status: string | null; direction: string | null; statuses: readonly string[] }) {
  const [panel, setPanel] = useState<'status' | 'exchange' | null>(null)
  const [state, action, pending] = useActionState(saveContactAction.bind(null, id), { message: '' })
  return <div className={styles.controls}>
    <div className={styles.buttons}><button type="button" aria-expanded={panel === 'status'} onClick={() => setPanel(panel === 'status' ? null : 'status')}>Cambia stato <span aria-hidden="true">⌄</span></button><button type="button" className={styles.primary} aria-expanded={panel === 'exchange'} onClick={() => setPanel(panel === 'exchange' ? null : 'exchange')}>Segna scambio <span aria-hidden="true">↗</span></button></div>
    {panel === 'status' && <form action={action} className={styles.form}><input type="hidden" name="operation" value="status" /><fieldset className={styles.statusChoices}><legend>Scegli il nuovo stato</legend>{statuses.map(value => <label key={value} className={styles.statusChoice}><input type="radio" name="status" value={value} defaultChecked={value === status} required disabled={pending} /><span>{value}</span></label>)}</fieldset><button className={styles.primary} disabled={pending}>{pending ? 'Salvataggio…' : 'Conferma stato'}</button></form>}
    {panel === 'exchange' && <form action={action} className={styles.form}><p>Chi ha scritto per ultimo?</p><button className={styles.exchangeChoice} name="operation" value="out" disabled={pending}><span className={`${styles.dot} ${styles.outgoing}`} aria-hidden="true" /><span>Ho scritto io<small>Aspettiamo una risposta</small></span>{direction === 'out' && <span aria-label="Situazione attuale">✓</span>}</button><button className={styles.exchangeChoice} name="operation" value="in" disabled={pending}><span className={`${styles.dot} ${styles.incoming}`} aria-hidden="true" /><span>Mi hanno risposto<small>Tocca a noi rispondere</small></span>{direction === 'in' && <span aria-label="Situazione attuale">✓</span>}</button></form>}
    <p className={styles.feedback} role="status">{state.message}</p>
  </div>
}
