'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

// Pagina in cui si torna chiudendo il pannello
const PAGINA_MAPPA = '/ufficio/motore'

// Durata dell'animazione di apertura/chiusura, in millisecondi
const DURATA = 300

// Pannello pop-up che si apre dal basso sopra la stanza Motore.
//
// DESKTOP: pannello largo l'80% con angoli molto arrotondati.
//          Si chiude cliccando fuori (sullo sfondo scuro) o con il tasto Esc.
// MOBILE:  il pannello occupa tutto lo schermo e si chiude con il tasto in alto a destra.
export function PannelloModale({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [inChiusura, setInChiusura] = useState(false)

  // Prima fa partire l'animazione verso il basso, poi torna alla mappa
  const chiudi = useCallback(() => {
    setInChiusura(true)
    setTimeout(() => router.push(PAGINA_MAPPA, { scroll: false }), DURATA)
  }, [router])

  // Il tasto Esc chiude il pannello
  useEffect(() => {
    const suTasto = (evento: KeyboardEvent) => evento.key === 'Escape' && chiudi()
    window.addEventListener('keydown', suTasto)
    return () => window.removeEventListener('keydown', suTasto)
  }, [chiudi])

  const animazione = inChiusura ? 'animate-out fill-mode-forwards' : 'animate-in'

  return (
    <div className="fixed inset-0 z-50">
      {/* Sfondo scuro semitrasparente: cliccandolo si torna alla mappa (solo desktop, su mobile è coperto dal pannello) */}
      <div
        aria-hidden
        onClick={chiudi}
        className={`absolute inset-0 bg-black/40 ${animazione} ${inChiusura ? 'fade-out' : 'fade-in'}`}
        style={{ animationDuration: `${DURATA}ms` }}
      />

      {/* Il pannello vero e proprio */}
      <div
        role="dialog"
        aria-modal="true"
        className={
          // Mobile: tutto lo schermo, senza angoli arrotondati
          'absolute inset-0 overflow-hidden bg-white shadow-2xl ' +
          // Desktop: 80% della larghezza, centrato, con angoli molto arrotondati
          // (cambia "rounded-[48px]" per regolare la curvatura)
          'md:inset-x-[10%] md:top-[6vh] md:bottom-[6vh] md:rounded-[48px] ' +
          // Animazione: entra dal basso verso l'alto, esce verso il basso
          `${animazione} ${inChiusura ? 'slide-out-to-bottom' : 'slide-in-from-bottom'} ease-out`
        }
        style={{ animationDuration: `${DURATA}ms` }}
      >
        {/* Contenuto del pannello (la pagina esistente), scorrevole */}
        <div className="h-full overflow-y-auto">{children}</div>

        {/* Tasto per tornare all'ufficio, in alto a destra: SOLO su mobile */}
        <button
          type="button"
          onClick={chiudi}
          aria-label="Torna all'ufficio"
          className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-white/95 px-3 py-2 text-sm font-medium text-stone-800 shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800 md:hidden"
        >
          <X size={18} aria-hidden />
          Ufficio
        </button>
      </div>
    </div>
  )
}
