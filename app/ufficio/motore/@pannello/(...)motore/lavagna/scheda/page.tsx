// La scheda di un contatto, aperta dalla lavagna, resta anche lei dentro il pannello pop-up.
import ContactPage from '@/app/motore/lavagna/scheda/page'
import { PannelloModale } from '@/components/pannello-modale'

export const dynamic = 'force-dynamic'

export default function Pannello(props: PageProps<'/motore/lavagna/scheda'>) {
  return (
    <PannelloModale>
      <ContactPage searchParams={props.searchParams} />
    </PannelloModale>
  )
}
