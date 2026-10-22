'use client'

import { useActionState, useState } from 'react'
import { saveContactAction } from './actions'
import styles from './scheda.module.css'

export function ContactControls({ id, status, statuses }: { id: string; status: string | null; statuses: readonly string[] }) {
  const [panel, setPanel] = useState<'status' | 'exchange' | null>(null)
  const [state, action, pending] = useActionState(saveContactAction.bind(null, id), { message: '' })
  return <div className={styles.controls}>
    <div className={styles.buttons}><button type="button" aria-expanded={panel === 'status'} onClick={() => setPanel(panel === 'status' ? null : 'status')}>Cambia status</button><button type="button" className={styles.primary} aria-expanded={panel === 'exchange'} onClick={() => setPanel(panel === 'exchange' ? null : 'exchange')}>Segna scambio</button></div>
    {panel === 'status' && <form action={action} className={styles.form}><input type="hidden" name="operation" value="status" /><label>Stato del contatto<select name="status" defaultValue={status ?? ''} required disabled={pending}><option value="" disabled>Scegli uno stato</option>{statuses.map(value => <option key={value}>{value}</option>)}</select></label><button disabled={pending}>{pending ? 'Salvataggio…' : 'Salva stato'}</button></form>}
    {panel === 'exchange' && <form action={action} className={styles.form}><p>Chi ha scritto per ultimo?</p><button name="operation" value="out" disabled={pending}>Ho scritto io</button><button name="operation" value="in" disabled={pending}>Mi hanno risposto</button></form>}
    <p className={styles.feedback} role="status">{state.message}</p>
  </div>
}
