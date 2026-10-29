'use client'

import { useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { checkRecurring, completeTask, restoreTask, setCurrentTask } from './actions'
import styles from './scrivania.module.css'

type Item = { id: string; title: string; hours: string | null }
export type DeskData = {
  title: string
  subtitle: string | null
  priority: string | null
  today: string
  hoursDone: number
  hoursDoneLabel: string
  hoursTarget: number
  hoursTargetLabel: string
  hoursLeftLabel: string
  current: (Item & { group: string | null }) | null
  groups: { id: string; title: string; hours: string | null; items: (Item & { inProgress: boolean })[] }[]
  recurring: (Item & { cadence: string; done: boolean })[]
  milestone: { date: string; title: string; criteria: string | null } | null
  completed: (Item & { group: string | null; completedAt: string | null })[]
}

export function Scrivania({ desk }: { desk: DeskData }) {
  const [pending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const percent = desk.hoursTarget > 0 ? Math.max(0, Math.min(100, Math.round((desk.hoursDone / desk.hoursTarget) * 100))) : 0

  function run(id: string, action: (id: string) => Promise<{ error?: string }>, done: string) {
    if (pending) return
    setError('')
    setBusyId(id)
    startTransition(async () => {
      try {
        const result = await action(id)
        if (result.error) setError(result.error)
        else setAnnouncement(done)
      } catch {
        setError('Non è stato possibile salvare. Riprova tra poco.')
      }
    })
  }

  const hoursPill = (hours: string | null) => hours && <span className={styles.rowHours}>{hours}</span>

  return <div className={styles.container}>
    <Link href="/" className={styles.back}>← Quartier generale</Link>

    <header className={styles.header}>
      <div className={styles.stack}>
        <p className={styles.eyebrow}>Scrivania</p>
        <h1 className={styles.title}>{desk.title}</h1>
        {desk.subtitle && <p className={styles.muted}>{desk.subtitle}</p>}
      </div>
      <div className={styles.headerSide}>
        <p className={styles.today}>{desk.today}</p>
        <button type="button" className={styles.outlineButton} onClick={() => dialog.current?.showModal()}>Task completate ({desk.completed.length})</button>
      </div>
    </header>

    <section className={styles.hours} aria-labelledby="ore-titolo">
      <div className={styles.hoursRow}>
        <div className={styles.stack}>
          <h2 id="ore-titolo" className={styles.eyebrow}>Ore di questa settimana</h2>
          <p className={styles.hoursValue}><span className={styles.hoursDone}>{desk.hoursDoneLabel}</span><span className={styles.hoursTarget}>/ {desk.hoursTargetLabel} ore</span></p>
        </div>
        <p className={styles.hoursLeft}>{desk.hoursLeftLabel === '0' ? 'Obiettivo della settimana raggiunto' : `Mancano ${desk.hoursLeftLabel} ore`}</p>
      </div>
      <div className={styles.bar} role="progressbar" aria-label="Ore di questa settimana" aria-valuemin={0} aria-valuemax={desk.hoursTarget} aria-valuenow={desk.hoursDone} aria-valuetext={`${desk.hoursDoneLabel} ore su ${desk.hoursTargetLabel}`}>
        <div className={styles.barFill} style={{ width: `${percent}%` }} />
      </div>
      {desk.priority && <p className={styles.small}>{desk.priority}</p>}
    </section>

    {error && <p role="alert" className={styles.error}>{error}</p>}
    <p className={styles.srOnly} role="status">{pending ? 'Salvataggio in corso' : announcement}</p>

    {desk.current ? (
      <section key={desk.current.id} className={styles.current} aria-labelledby="in-corso-titolo">
        <div className={styles.tab}><span className={styles.tabDot} aria-hidden="true" /><span id="in-corso-titolo">In corso adesso</span></div>
        <div className={styles.currentCard}>
          <div className={styles.currentText}>
            {desk.current.group && <p className={styles.muted}>{desk.current.group}</p>}
            <h2 className={styles.currentTitle}>{desk.current.title}</h2>
            {desk.current.hours && <p><span className={styles.pill}>{desk.current.hours} stimate</span></p>}
          </div>
          <button type="button" className={styles.doneButton} disabled={pending} onClick={() => run(desk.current!.id, completeTask, `${desk.current!.title}: completata`)}>Segnala come fatta</button>
        </div>
      </section>
    ) : (
      <section className={styles.finished}>
        <h2 className={styles.finishedTitle}>Lista finita</h2>
        <p className={styles.muted}>Non ci sono altre task da fare una volta in questa stanza. Parlane con Sophie alla revisione del venerdì.</p>
      </section>
    )}

    <div className={styles.grid}>
      <section className={styles.oneOff} aria-labelledby="una-volta-titolo">
        <h2 id="una-volta-titolo" className={styles.sectionTitle}>Da fare una volta</h2>
        {desk.groups.length === 0 && <p className={styles.muted}>Tutte le task da fare una volta sono completate.</p>}
        {desk.groups.map((group) => (
          <div key={group.id} className={styles.box}>
            <div className={styles.boxHeader}>
              <h3 className={styles.boxTitle}>{group.title}</h3>
              {group.hours && <span className={styles.small}>{group.hours} in tutto</span>}
            </div>
            <ul className={styles.list}>
              {group.items.map((item) => item.inProgress ? (
                <li key={item.id} className={styles.row}>
                  <span className={styles.leftPlace}>{item.title} è salita in corso</span>
                </li>
              ) : (
                <li key={item.id} className={styles.row}>
                  <input type="checkbox" id={`task-${item.id}`} className={styles.checkbox} checked={pending && busyId === item.id} disabled={pending} onChange={() => run(item.id, completeTask, `${item.title}: completata`)} />
                  <label htmlFor={`task-${item.id}`} className={styles.rowLabel}>{item.title}</label>
                  {hoursPill(item.hours)}
                  <button type="button" className={styles.iconButton} disabled={pending} aria-label={`Metti in corso: ${item.title}`} onClick={() => run(item.id, setCurrentTask, `${item.title}: in corso`)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" /></svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <div className={styles.side}>
        <section className={styles.stackLarge} aria-labelledby="ricorrenti-titolo">
          <h2 id="ricorrenti-titolo" className={styles.sectionTitle}>Ricorrenti</h2>
          <div className={`${styles.box} ${styles.boxCompact}`}>
            {desk.recurring.length === 0 ? <p className={styles.muted}>Nessuna ricorrente accesa in questo periodo.</p> : (
              <ul className={styles.list}>
                {desk.recurring.map((item) => (
                  <li key={item.id} className={`${styles.row} ${styles.recurringRow}`}>
                    <input type="checkbox" id={`ricorrente-${item.id}`} className={styles.checkbox} checked={item.done || (pending && busyId === item.id)} disabled={item.done || pending} onChange={() => run(item.id, checkRecurring, `${item.title}: fatta`)} />
                    <label htmlFor={`ricorrente-${item.id}`} className={`${styles.rowLabel} ${styles.recurringLabel} ${item.done ? styles.doneText : ''}`}>
                      <span>{item.title}</span>
                      <span className={styles.small}>{[item.cadence, item.hours].filter(Boolean).join(' · ')}{item.done ? ' · fatta' : ''}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={styles.stackLarge} aria-labelledby="traguardo-titolo">
          <h2 id="traguardo-titolo" className={styles.sectionTitle}>Traguardo</h2>
          <div className={styles.milestone}>
            {desk.milestone ? <>
              <p className={styles.eyebrow}>{desk.milestone.date}</p>
              <p className={styles.milestoneTitle}>{desk.milestone.title}</p>
              {desk.milestone.criteria && <p className={styles.muted}>{desk.milestone.criteria}</p>}
            </> : <p className={styles.muted}>Nessun traguardo in sospeso per questa stanza.</p>}
          </div>
        </section>
      </div>
    </div>

    <dialog ref={dialog} className={styles.dialog} aria-labelledby="completate-titolo" onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close() }}>
      <div className={styles.dialogBody}>
        <div className={styles.dialogHeader}>
          <h2 id="completate-titolo" className={styles.dialogTitle}>Task completate</h2>
          <button type="button" className={styles.closeButton} aria-label="Chiudi il pannello" onClick={() => dialog.current?.close()}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" /></svg>
          </button>
        </div>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {desk.completed.length === 0 ? <p className={styles.muted}>Ancora niente qui dentro. Le task che spunti finiscono in questo pannello.</p> : (
          <ul className={styles.list}>
            {desk.completed.map((item) => (
              <li key={item.id} className={styles.completedRow}>
                <span className={styles.completedText}>
                  <s className={styles.completedTitle}>{item.title}</s>
                  <span className={styles.small}>{[item.group, item.hours].filter(Boolean).join(' · ')}</span>
                  {item.completedAt && <span className={styles.small}>{item.completedAt}</span>}
                </span>
                <button type="button" className={styles.linkButton} disabled={pending} onClick={() => run(item.id, restoreTask, `${item.title}: rimessa in lista`)}>Rimetti in lista</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  </div>
}
