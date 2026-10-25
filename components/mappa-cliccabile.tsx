import { Pixelify_Sans } from 'next/font/google'
import Link from 'next/link'
import type { Zona } from '@/app/ufficio/zone'
import { ApriSophie } from '@/components/sophie'
import testi from '@/testi/mappa.json'
import stili from './mappa.module.css'

// Font dei cartellini con il nome delle stanze (solo sulla mappa)
const pixelify = Pixelify_Sans({ subsets: ['latin'], weight: '400' })

// Testo del cartellino di ogni stanza, da testi/mappa.json
const TESTI_CARTELLINI: Record<string, string | undefined> = testi

// Colore caldo neutro usato come sfondo attorno alle immagini dell'ufficio.
// Cambialo qui per modificarlo su tutte e due le pagine.
export const SFONDO_UFFICIO = '#efe6d8'

type Props = {
  immagine: string // percorso dell'immagine dentro /public, es. '/ufficio.png.png'
  descrizione: string // testo alternativo dell'immagine
  larghezzaOriginale: number // larghezza reale dell'immagine in pixel
  altezzaOriginale: number // altezza reale dell'immagine in pixel
  zone: Zona[] // zone cliccabili (vedi app/ufficio/zone.ts)
  debug: boolean // true = mostra le zone come forme colorate
}

// Al passaggio del mouse: leggero alone chiaro e cursore a manina
const STILE_ZONA =
  'absolute flex items-center justify-center transition-[background-color,box-shadow] duration-200 ' +
  'focus-visible:outline-2 focus-visible:outline-white'
const STILE_CLICCABILE = 'cursor-pointer hover:bg-white/25 focus-visible:bg-white/25'

// Trova il punto centrale di un poligono, per scriverci sopra il nome in modalità debug.
// Esempio: '10% 20%, 30% 40%' → { x: 20, y: 30 }
function centroDelPoligono(forma: string) {
  const punti = forma.split(',').map(punto => punto.trim().split(/\s+/).map(parseFloat))
  const x = punti.reduce((somma, [px]) => somma + px, 0) / punti.length
  const y = punti.reduce((somma, [, py]) => somma + py, 0) / punti.length
  return { x, y }
}

// Mostra un'immagine a tutto schermo, centrata, senza tagliarla,
// con sopra le zone cliccabili posizionate in percentuale.
export function MappaCliccabile({ immagine, descrizione, larghezzaOriginale, altezzaOriginale, zone, debug }: Props) {
  const proporzione = larghezzaOriginale / altezzaOriginale

  return (
    <main
      className="flex h-dvh w-screen items-center justify-center overflow-hidden"
      style={{ backgroundColor: SFONDO_UFFICIO }}
    >
      {/*
        Questo riquadro ha sempre le stesse proporzioni dell'immagine ed è grande
        il più possibile senza uscire dallo schermo. Le zone sono posizionate in %
        dentro questo riquadro, quindi restano allineate a qualsiasi dimensione.
      */}
      <div
        className={`relative ${stili.mappa}`}
        style={{
          width: `min(100vw, calc(100dvh * ${proporzione}))`,
          aspectRatio: `${larghezzaOriginale} / ${altezzaOriginale}`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={immagine} alt={descrizione} className="block h-full w-full select-none" draggable={false} />

        {/* Le zone vengono disegnate nell'ordine della lista: quelle più in basso nella lista stanno sopra */}
        {zone.map(zona => {
          const coloreDebug = debug ? { backgroundColor: zona.colore } : {}

          // ---- Zona a POLIGONO (mobili in prospettiva) ----
          if (zona.forma) {
            const centro = centroDelPoligono(zona.forma)
            const stile = { clipPath: `polygon(${zona.forma})`, ...coloreDebug }
            return (
              // Il contenitore esterno non riceve clic: serve solo a disegnare l'alone
              // chiaro attorno alla forma quando il mouse ci passa sopra.
              <div
                key={zona.nome}
                className="pointer-events-none absolute inset-0 transition-[filter] duration-200 has-[a:hover]:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
              >
                {/*
                  La zona copre tutta l'immagine ma viene ritagliata con clip-path:
                  il clic e il passaggio del mouse funzionano solo dentro la forma.
                */}
                {zona.apre === 'sophie' ? (
                  <ApriSophie
                    aria-label={zona.nome}
                    className={`${STILE_ZONA} ${STILE_CLICCABILE} pointer-events-auto inset-0`}
                    style={stile}
                  />
                ) : zona.link ? (
                  <Link
                    href={zona.link}
                    aria-label={zona.nome}
                    className={`${STILE_ZONA} ${STILE_CLICCABILE} pointer-events-auto inset-0`}
                    style={stile}
                  />
                ) : (
                  <div aria-hidden className={`${STILE_ZONA} inset-0`} style={stile} />
                )}
                {debug && (
                  <span
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-black/70 px-2 py-1 text-sm font-medium whitespace-nowrap text-white"
                    style={{ left: `${centro.x}%`, top: `${centro.y}%` }}
                  >
                    {zona.nome}
                    {!zona.link && !zona.apre && ' (senza link)'}
                  </span>
                )}
              </div>
            )
          }

          // ---- Zona RETTANGOLARE ----
          const stile = {
            left: `${zona.sinistra}%`,
            top: `${zona.alto}%`,
            width: `${zona.larghezza}%`,
            height: `${zona.altezza}%`,
            ...(debug ? { ...coloreDebug, outline: '2px dashed rgba(0,0,0,0.6)' } : {}),
          }
          const etichetta = debug && (
            <span className="rounded bg-black/70 px-2 py-1 text-sm font-medium text-white">{zona.nome}</span>
          )
          // Il nome della stanza scritto sopra la mappa (se la zona ne ha uno)
          const testo = TESTI_CARTELLINI[zona.nome]
          const cartellino = zona.cartellino && testo && (
            <Cartellino zona={zona} testo={testo} />
          )

          if (zona.apre === 'sophie') {
            return (
              <ApriSophie
                key={zona.nome}
                aria-label={zona.nome}
                className={`${STILE_ZONA} ${STILE_CLICCABILE} pointer-events-auto rounded-lg hover:shadow-[0_0_40px_12px_rgba(255,255,255,0.55)]`}
                style={stile}
              >
                {etichetta}
              </ApriSophie>
            )
          }
          const area = zona.link ? (
            <Link
              href={zona.link}
              aria-label={zona.nome}
              className={`${STILE_ZONA} ${STILE_CLICCABILE} pointer-events-auto rounded-lg hover:shadow-[0_0_40px_12px_rgba(255,255,255,0.55)]`}
              style={stile}
            >
              {etichetta}
            </Link>
          ) : (
            // Zona senza pagina (ancora): niente manina e niente alone, solo il cartellino che si evidenzia
            <div className={`${STILE_ZONA} pointer-events-auto rounded-lg`} style={stile}>
              {etichetta}
            </div>
          )
          return (
            // Zona e cartellino stanno insieme: passando sopra l'una si evidenzia l'altro
            <div key={zona.nome} className={stili.stanza}>
              {area}
              {cartellino}
            </div>
          )
        })}
      </div>
    </main>
  )
}

// Cartellino con il nome della stanza, appoggiato sopra l'immagine.
// Cliccarlo fa la stessa cosa che cliccare la stanza.
function Cartellino({ zona, testo }: { zona: Zona; testo: string }) {
  const posizione = { left: `${zona.cartellino?.sinistra}%`, top: `${zona.cartellino?.alto}%` }
  const classi = `${stili.cartellino} ${pixelify.className}`
  // Se la stanza ha una pagina, il cartellino porta lì. Per chi usa la tastiera
  // o lo screen reader c'è già la zona, quindi il cartellino non si ripete.
  return zona.link ? (
    <Link href={zona.link} tabIndex={-1} aria-hidden className={classi} style={posizione}>
      {testo}
    </Link>
  ) : (
    <span className={classi} style={posizione}>
      {testo}
    </span>
  )
}
