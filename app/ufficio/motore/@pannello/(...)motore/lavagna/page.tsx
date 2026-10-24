// Quando si clicca un mobile nella stanza Motore, la pagina /motore/lavagna
// non si apre a tutta pagina ma dentro il pannello pop-up, sopra la stanza.
// La pagina originale resta identica: qui viene solo "incorniciata".
// (Aprendo il link direttamente o ricaricando, si vede la pagina intera di sempre.)
import LavagnaPage from '@/app/motore/lavagna/page'
import { PannelloModale } from '@/components/pannello-modale'

export const dynamic = 'force-dynamic'

export default function Pannello() {
  return (
    <PannelloModale>
      <LavagnaPage />
    </PannelloModale>
  )
}
