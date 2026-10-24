import Link from 'next/link'
import type { Zona } from '@/app/ufficio/zone'

// Colore caldo neutro usato come sfondo attorno alle immagini dell'ufficio.
// Cambialo qui per modificarlo su tutte e due le pagine.
export const SFONDO_UFFICIO = '#efe6d8'

type Props = {
  immagine: string // percorso dell'immagine dentro /public, es. '/ufficio.png.png'
  descrizione: string // testo alternativo dell'immagine
  larghezzaOriginale: number // larghezza reale dell'immagine in pixel
  altezzaOriginale: number // altezza reale dell'immagine in pixel
  zone: Zona[] // zone cliccabili (vedi app/ufficio/zone.ts)
  debug: boolean // true = mostra le zone come rettangoli colorati
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
        className="relative"
        style={{
          width: `min(100vw, calc(100dvh * ${proporzione}))`,
          aspectRatio: `${larghezzaOriginale} / ${altezzaOriginale}`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={immagine} alt={descrizione} className="block h-full w-full select-none" draggable={false} />

        {zone.map(zona => (
          <Link
            key={zona.nome}
            href={zona.link}
            aria-label={zona.nome}
            className={
              // Al passaggio del mouse: leggero alone chiaro e cursore a manina
              'absolute flex cursor-pointer items-center justify-center rounded-lg transition-[background-color,box-shadow] duration-200 ' +
              'hover:bg-white/25 hover:shadow-[0_0_40px_12px_rgba(255,255,255,0.55)] ' +
              'focus-visible:bg-white/15 focus-visible:outline-2 focus-visible:outline-white'
            }
            style={{
              left: `${zona.sinistra}%`,
              top: `${zona.alto}%`,
              width: `${zona.larghezza}%`,
              height: `${zona.altezza}%`,
              // In modalità debug la zona diventa un rettangolo colorato
              ...(debug ? { backgroundColor: zona.colore, outline: '2px dashed rgba(0,0,0,0.6)' } : {}),
            }}
          >
            {debug && (
              <span className="rounded bg-black/70 px-2 py-1 text-sm font-medium text-white">{zona.nome}</span>
            )}
          </Link>
        ))}
      </div>
    </main>
  )
}
