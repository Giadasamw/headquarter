import { redirect } from 'next/navigation'

// La mappa ora è la homepage: chi apre ancora /ufficio viene mandato su "/".
export default async function UfficioPage({ searchParams }: PageProps<'/ufficio'>) {
  const { debug } = await searchParams
  redirect(debug === '1' ? '/?debug=1' : '/')
}
