'use client'

import { useState, type ReactNode } from 'react'
import styles from './grezzi.module.css'

const SCHEDE = [
  { id: 'contatti', label: 'Contatti grezzi' },
  { id: 'job-offers', label: 'Job offers' },
] as const

// Le due schede del pannello. Restano entrambe "accese": cambiando scheda non si perde niente.
export function Schede({ contatti, jobOffers }: { contatti: ReactNode; jobOffers: ReactNode }) {
  const [attiva, setAttiva] = useState<(typeof SCHEDE)[number]['id']>('contatti')
  return <>
    <div role="tablist" aria-label="Schede del pannello" className={styles.tabs}>
      {SCHEDE.map((scheda) => (
        <button
          key={scheda.id}
          type="button"
          role="tab"
          id={`scheda-${scheda.id}`}
          aria-selected={attiva === scheda.id}
          aria-controls={`contenuto-${scheda.id}`}
          className={styles.tab}
          onClick={() => setAttiva(scheda.id)}
        >
          {scheda.label}
        </button>
      ))}
    </div>
    <div role="tabpanel" id="contenuto-contatti" aria-labelledby="scheda-contatti" hidden={attiva !== 'contatti'}>{contatti}</div>
    <div role="tabpanel" id="contenuto-job-offers" aria-labelledby="scheda-job-offers" hidden={attiva !== 'job-offers'}>{jobOffers}</div>
  </>
}
