import type { Metadata } from 'next'
import { MappaCliccabile } from '@/components/mappa-cliccabile'
import { zoneMappa } from './zone'

export const metadata: Metadata = {
  title: 'Ufficio | Quartier generale',
  robots: { index: false, follow: false },
}

// Pagina /ufficio: la mappa dell'intero piano.
// Aggiungi ?debug=1 all'indirizzo per vedere le zone cliccabili.
export default async function UfficioPage({ searchParams }: PageProps<'/ufficio'>) {
  const { debug } = await searchParams

  return (
    <MappaCliccabile
      immagine="/ufficio.png.png"
      descrizione="Mappa dell'intero piano dell'ufficio"
      larghezzaOriginale={1536}
      altezzaOriginale={1024}
      zone={zoneMappa}
      debug={debug === '1'}
    />
  )
}
