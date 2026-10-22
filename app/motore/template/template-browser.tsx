'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { TemplateItem } from '@/lib/templates'
import styles from './template.module.css'

function PersonalizedText({ text }: { text: string }) {
  return text.split(/(\[[^\[\]]+\])/g).map((part, index) =>
    part.startsWith('[') && part.endsWith(']')
      ? <mark key={index}>{part.slice(1, -1)}</mark>
      : part,
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  async function copy() {
    if (timer.current) clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('error')
    }
    timer.current = setTimeout(() => setStatus('idle'), 2000)
  }

  return <div className={styles.copyWrap}><button type="button" className={styles.copy} aria-label={label} onClick={copy}>{status === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}<span aria-live="polite">{status === 'copied' ? 'Copiato' : 'Copia'}</span></button>{status === 'error' && <span role="alert" className={styles.copyError}>Copia non riuscita. Seleziona e copia il testo.</span>}</div>
}

function TemplateDetail({ template }: { template: TemplateItem }) {
  const raw = template.body ?? ''
  const firstLineEnd = raw.indexOf('\n')
  const firstLine = firstLineEnd === -1 ? raw : raw.slice(0, firstLineEnd).replace(/\r$/, '')
  const hasSubject = /^og:/i.test(firstLine)
  const subject = hasSubject ? firstLine.slice(3).trim() : ''
  const body = hasSubject ? (firstLineEnd === -1 ? '' : raw.slice(firstLineEnd + 1).replace(/^\r?\n/, '')) : raw

  return <article id="template-detail" className={styles.detail} aria-labelledby="template-title">
    <header className={styles.detailHeader}><h2 id="template-title">{template.title}</h2>{template.category && <span className={styles.pill}>{template.category}</span>}</header>
    <div className={styles.stats}>{template.works && <span className={styles.works}><Check size={16} aria-hidden="true" /> funziona</span>}<span>{template.used === 0 ? 'non ancora usato' : `${template.replies} risposte su ${template.used}`}</span></div>
    {hasSubject && <section className={styles.textBox} aria-label="Oggetto"><div className={styles.textToolbar}><span className={styles.caption}>Oggetto</span><CopyButton text={subject} label="Copia oggetto" /></div><p className={styles.message}><PersonalizedText text={subject} /></p></section>}
    <section className={styles.textBox} aria-label="Corpo del template"><div className={styles.bodyToolbar}><CopyButton text={body} label="Copia corpo" /></div><div className={styles.message}><PersonalizedText text={body} /></div></section>
    {template.notes?.trim() && <section className={styles.notes}><h3>Note</h3><p>{template.notes}</p></section>}
  </article>
}

export function TemplateBrowser({ templates }: { templates: TemplateItem[] }) {
  const [selectedId, setSelectedId] = useState(templates[0]?.id)
  const selected = templates.find(template => template.id === selectedId) ?? templates[0]
  if (!selected) return <p className={styles.empty}>Non ci sono ancora template. Li troverai qui appena saranno disponibili.</p>

  return <div className={styles.columns}><nav className={styles.list} aria-label="Elenco dei template">{templates.map(template => <button type="button" key={template.id} className={`${styles.item} ${template.id === selected.id ? styles.selected : ''}`} aria-current={template.id === selected.id ? 'true' : undefined} aria-controls="template-detail" onClick={() => setSelectedId(template.id)}><span>{template.title}</span>{template.category && <small>{template.category}</small>}</button>)}</nav><TemplateDetail key={selected.id} template={selected} /></div>
}
