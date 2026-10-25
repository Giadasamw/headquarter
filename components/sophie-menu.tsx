'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import pannelli from '@/lib/pannelli.json'
import styles from './sophie.module.css'

// L'elenco dei pannelli viene da lib/pannelli.json, generato in automatico
// da scripts/genera-pannelli.mjs leggendo le pagine del progetto.

// La pagina in cui ti trovi (anche una sua sotto-pagina, es. la scheda di un contatto)
function attiva(pathname: string, link: string) {
  return pathname === link || pathname.startsWith(`${link}/`)
}

// Lista di navigazione che si apre dentro il pannello della chat, sopra la conversazione
export function SophieMenu({ onScelta }: { onScelta: () => void }) {
  const pathname = usePathname()
  const ufficioAttivo = pathname === '/' || attiva(pathname, '/ufficio')

  return (
    <nav id="sophie-menu" aria-label="Pagine del quartier generale" className={styles.menu}>
      <Link
        href="/"
        onClick={onScelta}
        aria-current={ufficioAttivo ? 'page' : undefined}
        className={styles.voce}
      >
        Ufficio
      </Link>

      {pannelli.map(({ stanza, pannelli }) => (
        <section key={stanza} className={styles.stanza}>
          <h3 className={styles.nomeStanza}>{stanza}</h3>
          <ul className={styles.listaPannelli}>
            {pannelli.map(({ nome, link }) => (
              <li key={link}>
                <Link
                  href={link}
                  onClick={onScelta}
                  aria-current={attiva(pathname, link) ? 'page' : undefined}
                  className={styles.voce}
                >
                  {nome}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  )
}
