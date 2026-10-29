'use client'

import { useRef, useState, useTransition } from 'react'
import { ExternalLink, Plus, Trash2 } from 'lucide-react'
import type { JobOffer, JobOfferStatus } from '@/lib/job-offers'
import { addJobOffer, removeJobOffer, saveJobOfferField } from './job-offers-actions'
import styles from './grezzi.module.css'

const STATUS_LABELS: Record<JobOfferStatus, string> = {
  contacted: 'Contacted',
  rejected: 'Rejected',
  in_negotiation: 'In negotiation',
}

type Field = 'job_title' | 'job_offer_link' | 'company_link' | 'deadline' | 'applied_on' | 'status'

function website(value: string | null) {
  if (!value?.trim()) return null
  try {
    const url = new URL(/^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null
  } catch { return null }
}

// Most recent application first; rows without an application date (just added) on top.
function sorted(offers: JobOffer[]) {
  const withDate = (offer: JobOffer) => (offer.applied_on === null ? 0 : 1)
  return [...offers].sort((a, b) =>
    withDate(a) - withDate(b) ||
    (b.applied_on ?? '').localeCompare(a.applied_on ?? '') ||
    b.created_at.localeCompare(a.created_at))
}

export function JobOffers({ offers, loadError }: { offers: JobOffer[]; loadError: boolean }) {
  const [rows, setRows] = useState(offers)
  // What the database holds, to save only what really changed.
  const saved = useRef(new Map(offers.map((offer) => [offer.id, offer])))
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const table = useRef<HTMLTableElement>(null)

  function edit(id: string, field: Field, value: string) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  async function save(id: string, field: Field, value: string) {
    const before = saved.current.get(id)
    if (!before || (before[field] ?? '') === value) return
    setError('')
    setStatus('Saving…')
    const result = await saveJobOfferField(id, field, value)
    if (result.error) {
      setError(result.error)
      setStatus('')
      return
    }
    const after = { ...before, [field]: result.value ?? null } as JobOffer
    saved.current.set(id, after)
    setRows((current) => {
      const next = current.map((row) => (row.id === id ? { ...row, [field]: result.value ?? (field === 'job_title' ? '' : null) } : row))
      return field === 'applied_on' ? sorted(next) : next
    })
    setStatus('All changes saved')
  }

  function add() {
    setError('')
    startTransition(async () => {
      const result = await addJobOffer()
      if (!result.offer) { setError(result.error ?? 'Could not add the job offer.'); return }
      const offer = result.offer
      saved.current.set(offer.id, offer)
      setRows((current) => [offer, ...current])
      setStatus('Job offer added')
      // Start typing the job title of the new row straight away.
      requestAnimationFrame(() => table.current?.querySelector<HTMLInputElement>(`[data-row="${offer.id}"] input`)?.focus())
    })
  }

  function remove(offer: JobOffer) {
    if (!window.confirm(`Delete "${offer.job_title || 'this job offer'}"? This cannot be undone.`)) return
    setError('')
    startTransition(async () => {
      const result = await removeJobOffer(offer.id)
      if (result.error) { setError(result.error); return }
      saved.current.delete(offer.id)
      setRows((current) => current.filter((row) => row.id !== offer.id))
      setStatus('Job offer deleted')
    })
  }

  const text = (row: JobOffer, field: 'job_title' | 'job_offer_link' | 'company_link', label: string, placeholder: string) => {
    const href = field === 'job_title' ? null : website(row[field])
    return (
      <td>
        <div className={styles.cell}>
          <input
            className={styles.cellInput}
            aria-label={label}
            value={row[field] ?? ''}
            placeholder={placeholder}
            onChange={(event) => edit(row.id, field, event.target.value)}
            onBlur={(event) => save(row.id, field, event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
          />
          {href && (
            <a className={styles.cellLink} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label.toLowerCase()} (new tab)`}>
              <ExternalLink aria-hidden="true" />
            </a>
          )}
        </div>
      </td>
    )
  }

  const date = (row: JobOffer, field: 'deadline' | 'applied_on', label: string) => (
    <td>
      <input
        type="date"
        className={styles.cellInput}
        aria-label={label}
        value={row[field] ?? ''}
        onChange={(event) => { edit(row.id, field, event.target.value); void save(row.id, field, event.target.value) }}
      />
    </td>
  )

  return <>
    <header className={styles.header}>
      <div>
        <div className={styles.headingRow}><h1 className={styles.title}>Job offers</h1><span className={styles.count}>{rows.length} {rows.length === 1 ? 'application' : 'applications'}</span></div>
        <p className={styles.subtitle}>The most relevant applications. Click a cell to edit it: it saves by itself.</p>
      </div>
      <button className={`${styles.button} ${styles.primary}`} disabled={pending || loadError} onClick={add}><Plus aria-hidden="true" />Add job offer</button>
    </header>

    {loadError ? <p role="alert" className={styles.error}>Could not load the job offers. Try again in a moment.</p> : <>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <p className={styles.saveStatus} role="status">{status}</p>
      <div className={styles.tableWrap}>
        <table ref={table} className={styles.table}>
          <thead>
            <tr><th scope="col">Job title</th><th scope="col">Job offer link</th><th scope="col">Company link</th><th scope="col">Deadline</th><th scope="col">Applied on</th><th scope="col">Status</th><th scope="col"><span className={styles.srOnly}>Delete</span></th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className={styles.emptyRow}>No job offers yet. Click “Add job offer” to add the first one.</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id} data-row={row.id}>
                {text(row, 'job_title', 'Job title', 'Job title')}
                {text(row, 'job_offer_link', 'Job offer link', 'https://…')}
                {text(row, 'company_link', 'Company link', 'https://…')}
                {date(row, 'deadline', 'Deadline')}
                {date(row, 'applied_on', 'Applied on')}
                <td>
                  <select
                    className={styles.cellInput}
                    aria-label="Status"
                    value={row.status}
                    onChange={(event) => { edit(row.id, 'status', event.target.value); void save(row.id, 'status', event.target.value) }}
                  >
                    {(Object.keys(STATUS_LABELS) as JobOfferStatus[]).map((value) => <option key={value} value={value}>{STATUS_LABELS[value]}</option>)}
                  </select>
                </td>
                <td>
                  <button type="button" className={styles.deleteButton} disabled={pending} onClick={() => remove(row)} aria-label={`Delete ${row.job_title || 'this job offer'}`}>
                    <Trash2 aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>}
  </>
}
