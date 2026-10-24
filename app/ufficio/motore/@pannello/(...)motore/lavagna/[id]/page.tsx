// La scheda di un contatto, aperta dalla lavagna, resta anche lei dentro il pannello pop-up.
import ContactPage from '@/app/motore/lavagna/[id]/page'
import { PannelloModale } from '@/components/pannello-modale'

export default function Pannello(props: PageProps<'/motore/lavagna/[id]'>) {
  return (
    <PannelloModale>
      <ContactPage params={props.params} />
    </PannelloModale>
  )
}
