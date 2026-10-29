'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import styles from './scheda.module.css'

export function CopyEmail({ email }: { email: string }) {
  const [message, setMessage] = useState('')
  async function copy() {
    try { await navigator.clipboard.writeText(email); setMessage('Email copiata') }
    catch { setMessage('Copia non disponibile. Seleziona e copia l’email.') }
  }
  return <><span className={styles.emailRow}><span>{email}</span><button type="button" className={styles.iconButton} onClick={copy} aria-label="Copia email" title="Copia email">{message === 'Email copiata' ? <Check size={16} /> : <Copy size={16} />}</button></span><span className={styles.copyFeedback} role="status">{message}</span></>
}
