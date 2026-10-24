// ============================================================================
// ZONE CLICCABILI DELL'UFFICIO
// ----------------------------------------------------------------------------
// Qui stanno TUTTE le percentuali delle zone cliccabili, sia della mappa
// (/ufficio) sia dello zoom della stanza Motore (/ufficio/motore).
//
// Ogni zona è un rettangolo descritto in PERCENTUALE rispetto all'immagine:
//   - sinistra: distanza dal bordo sinistro dell'immagine (0 = bordo sinistro)
//   - alto:     distanza dal bordo superiore dell'immagine (0 = bordo in alto)
//   - larghezza: quanto è largo il rettangolo
//   - altezza:   quanto è alto il rettangolo
//
// Esempio: una zona tra il 18% e il 45% della larghezza ha
//   sinistra: 18, larghezza: 45 - 18 = 27
//
// Suggerimento: apri la pagina con ?debug=1 alla fine dell'indirizzo
// (es. /ufficio?debug=1) per vedere i rettangoli colorati mentre ritocchi i numeri.
// ============================================================================

export type Zona = {
  nome: string // testo mostrato in modalità debug (e letto dagli screen reader)
  link: string // pagina in cui si va cliccando la zona
  sinistra: number // in %
  alto: number // in %
  larghezza: number // in %
  altezza: number // in %
  colore: string // colore del rettangolo in modalità debug
}

// ---------------------------------------------------------------------------
// MAPPA DELL'INTERO PIANO (ufficio.png)
// ---------------------------------------------------------------------------
export const zoneMappa: Zona[] = [
  {
    // Stanza in alto a sinistra, quella con la grande lavagna scura
    nome: 'Motore',
    link: '/ufficio/motore',
    sinistra: 18, // dal 18%...
    alto: 12, // dal 12%...
    larghezza: 27, // ...fino al 45% della larghezza (45 - 18)
    altezza: 28, // ...fino al 40% dell'altezza (40 - 12)
    colore: 'rgba(255, 64, 129, 0.35)',
  },

  // Zone future: per attivarle togli le due barre // davanti a ogni riga,
  // poi sistema numeri e link. Ricorda la virgola tra una zona e l'altra.
  //
  // { nome: 'Stanza in alto a destra', link: '/ufficio/...', sinistra: 0, alto: 0, larghezza: 0, altezza: 0, colore: 'rgba(33, 150, 243, 0.35)' },
  // { nome: 'Stanza in basso a sinistra', link: '/ufficio/...', sinistra: 0, alto: 0, larghezza: 0, altezza: 0, colore: 'rgba(76, 175, 80, 0.35)' },
  // { nome: 'Stanza in basso a destra', link: '/ufficio/...', sinistra: 0, alto: 0, larghezza: 0, altezza: 0, colore: 'rgba(255, 152, 0, 0.35)' },
  // { nome: 'Caffetteria', link: '/ufficio/...', sinistra: 0, alto: 0, larghezza: 0, altezza: 0, colore: 'rgba(156, 39, 176, 0.35)' },
]

// ---------------------------------------------------------------------------
// ZOOM DELLA STANZA MOTORE (motore.png)
// ---------------------------------------------------------------------------
// Per ora nessuna zona: le aggiungeremo nel passo successivo, con lo stesso
// formato usato qui sopra.
export const zoneMotore: Zona[] = []
