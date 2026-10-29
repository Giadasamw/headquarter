import { redirect } from 'next/navigation'

// Vecchio indirizzo della scheda contatto (/motore/lavagna/<id>): porta a quello nuovo.
export default async function VecchiaScheda({ params }: PageProps<'/motore/lavagna/[id]'>) {
  const { id } = await params
  redirect(`/motore/lavagna/scheda?id=${encodeURIComponent(id)}`)
}
