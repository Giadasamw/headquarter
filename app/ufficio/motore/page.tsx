import type { Metadata } from 'next'
import Link from 'next/link'
import { MappaCliccabile } from '@/components/mappa-cliccabile'
import { zoneMotore } from '../zone'

export const metadata: Metadata = {
  title: 'Stanza Motore | Quartier generale',
  robots: { index: false, follow: false },
}

// Pagina /ufficio/motore: lo zoom della stanza Motore.
// Aggiungi ?debug=1 all'indirizzo per vedere le zone cliccabili.
export default async function MotoreZoomPage({ searchParams }: PageProps<'/ufficio/motore'>) {
  const { debug } = await searchParams

  return (
    <>
      <MappaCliccabile
        immagine="/motore.png.png"
        descrizione="Zoom della stanza Motore"
        larghezzaOriginale={1448}
        altezzaOriginale={1086}
        zone={zoneMotore}
        debug={debug === '1'}
      />

      {/* Pulsante in alto a sinistra per tornare alla mappa */}
      <Link
        href={debug === '1' ? '/ufficio?debug=1' : '/ufficio'}
        className="fixed top-4 left-4 z-10 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-stone-800 shadow-md transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800"
      >
        ← Torna alla mappa
      </Link>
    </>
  )
}
