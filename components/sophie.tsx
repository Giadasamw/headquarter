'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X } from 'lucide-react'
import { Chat } from '@/components/chat'
import styles from './sophie.module.css'

// Pagine in cui Sophie non compare (prima di entrare con la password)
const PAGINE_SENZA_SOPHIE = ['/login']

type SophieContesto = { aperto: boolean; apri: () => void; chiudi: () => void }

const Contesto = createContext<SophieContesto | null>(null)

// Da usare in qualsiasi componente "client" per aprire o chiudere la chat di Sophie
export function useSophie() {
  const contesto = useContext(Contesto)
  if (!contesto) throw new Error('useSophie va usato dentro <SophieProvider>')
  return contesto
}

// Avvolge tutte le pagine (vedi app/layout.tsx).
// Il pannello resta sempre "montato", anche da chiuso: così la conversazione
// non si perde quando cambi pagina o chiudi e riapri il pannello.
export function SophieProvider({ briefing, font, children }: { briefing: ReactNode; font: string; children: ReactNode }) {
  const pathname = usePathname()
  const [aperto, setAperto] = useState(false)
  const apri = useCallback(() => setAperto(true), [])
  const chiudi = useCallback(() => setAperto(false), [])
  const visibile = !PAGINE_SENZA_SOPHIE.includes(pathname)

  return (
    <Contesto.Provider value={{ aperto, apri, chiudi }}>
      {children}
      {visibile && (
        <div className={`${styles.tema} ${font}`}>
          <Bollino />
          <Pannello briefing={briefing} />
        </div>
      )}
    </Contesto.Provider>
  )
}

// Il bollino rotondo in basso a destra, su tutte le pagine
function Bollino() {
  const { aperto, apri } = useSophie()
  return (
    <button
      type="button"
      onClick={apri}
      aria-label="Apri la chat con Sophie"
      aria-expanded={aperto}
      aria-controls="sophie-pannello"
      className={styles.bollino}
      data-nascosto={aperto || undefined}
    >
      <MessageCircle aria-hidden size={24} />
    </button>
  )
}

// Il pannello laterale che entra da destra
function Pannello({ briefing }: { briefing: ReactNode }) {
  const { aperto, chiudi } = useSophie()
  const tastoChiudi = useRef<HTMLButtonElement>(null)

  // Il tasto Esc chiude il pannello. Viene ascoltato "per primo" (capture) e
  // fermato lì, così se sotto c'è un pannello del Motore si chiude solo la chat.
  useEffect(() => {
    if (!aperto) return
    const suTasto = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') return
      evento.stopImmediatePropagation()
      chiudi()
    }
    window.addEventListener('keydown', suTasto, { capture: true })
    return () => window.removeEventListener('keydown', suTasto, { capture: true })
  }, [aperto, chiudi])

  // All'apertura il cursore della tastiera va sulla X
  useEffect(() => {
    if (aperto) tastoChiudi.current?.focus()
  }, [aperto])

  return (
    <>
      {/* Velo leggero dietro al pannello: cliccandolo il pannello si chiude */}
      <div aria-hidden onClick={chiudi} className={styles.velo} data-aperto={aperto || undefined} />

      <aside
        id="sophie-pannello"
        role="dialog"
        aria-label="Chat con Sophie"
        aria-hidden={!aperto}
        inert={!aperto}
        className={styles.pannello}
        data-aperto={aperto || undefined}
      >
        <div className={styles.testata}>
          <div>
            <h2 className={styles.titolo}>Sophie</h2>
            <p className={styles.sottotitolo}>La tua assistente</p>
          </div>
          <button ref={tastoChiudi} type="button" onClick={chiudi} aria-label="Chiudi la chat" className={styles.chiudi}>
            <X aria-hidden size={20} />
          </button>
        </div>
        <Chat briefing={briefing} />
      </aside>
    </>
  )
}

// Un pulsante qualsiasi che apre la chat (usato dalla zona di Sophie sulla mappa)
export function ApriSophie(props: Omit<ComponentProps<'button'>, 'onClick' | 'type'>) {
  const { apri } = useSophie()
  return <button type="button" onClick={apri} aria-controls="sophie-pannello" {...props} />
}
