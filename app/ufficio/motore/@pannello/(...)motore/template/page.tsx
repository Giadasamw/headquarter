// Quando si clicca un mobile nella stanza Motore, la pagina /motore/template
// non si apre a tutta pagina ma dentro il pannello pop-up, sopra la stanza.
// La pagina originale resta identica: qui viene solo "incorniciata".
// (Aprendo il link direttamente o ricaricando, si vede la pagina intera di sempre.)
import TemplatePage from '@/app/motore/template/page'
import { PannelloModale } from '@/components/pannello-modale'

export const dynamic = 'force-dynamic'

export default function Pannello() {
  return (
    <PannelloModale>
      <TemplatePage />
    </PannelloModale>
  )
}
