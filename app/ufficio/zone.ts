// ============================================================================
// ZONE CLICCABILI DELL'UFFICIO
// ----------------------------------------------------------------------------
// Qui stanno TUTTE le percentuali delle zone cliccabili, sia della mappa
// (/ufficio) sia dello zoom della stanza Motore (/ufficio/motore).
//
// Ci sono due tipi di zona, entrambi in PERCENTUALE rispetto all'immagine.
//
// 1) RETTANGOLO (usato nella mappa). Si descrive con:
//   - sinistra: distanza dal bordo sinistro dell'immagine (0 = bordo sinistro)
//   - alto:     distanza dal bordo superiore dell'immagine (0 = bordo in alto)
//   - larghezza: quanto è largo il rettangolo
//   - altezza:   quanto è alto il rettangolo
//
// Esempio: una zona tra il 18% e il 45% della larghezza ha
//   sinistra: 18, larghezza: 45 - 18 = 27
//
// 2) POLIGONO (usato nello zoom Motore, per i mobili in prospettiva).
//   Si descrive con "forma": l'elenco dei vertici, ognuno scritto come
//   "X% Y%" e separati da virgole. È esattamente quello che va dentro
//   clip-path: polygon(...). Puoi aggiungere o togliere vertici.
//
// Se "link" manca, la zona non porta da nessuna parte (e non è cliccabile).
//
// Suggerimento: apri la pagina con ?debug=1 alla fine dell'indirizzo
// (es. /ufficio?debug=1) per vedere i rettangoli colorati mentre ritocchi i numeri.
// ============================================================================

export type Zona = {
  nome: string // testo mostrato in modalità debug (e letto dagli screen reader)
  link?: string // pagina in cui si va cliccando la zona (facoltativo)
  colore: string // colore della zona in modalità debug
  // Per un RETTANGOLO:
  sinistra?: number // in %
  alto?: number // in %
  larghezza?: number // in %
  altezza?: number // in %
  // Per un POLIGONO:
  forma?: string // vertici del clip-path, es. '10% 20%, 30% 20%, 20% 40%'
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
// ORDINE: le zone sono disegnate nell'ordine della lista, quindi quelle più in
// basso stanno SOPRA. La lavagna è la prima (sta sotto a tutte): dove le forme
// si toccano vince il mobile più piccolo.
export const zoneMotore: Zona[] = [
  {
    nome: 'Lavagna',
    link: '/motore/lavagna', // pannello "Lavagna contatti" (outreach)
    forma: '25.5% 43.9%, 54.6% 29.3%, 54.6% 12.6%, 25.3% 28.3%, 25.4% 36.8%',
    colore: 'rgba(255, 64, 129, 0.4)',
  },
  {
    nome: 'Scrivania',
    link: '/motore/scrivania',
    forma: '41.6% 51.9%, 50.7% 47.5%, 51.1% 39.3%, 47.6% 36.4%, 34.2% 43.1%, 34.3% 50.9%, 37.8% 54.2%',
    colore: 'rgba(33, 150, 243, 0.45)',
  },
  {
    nome: 'Cassettiera sinistra',
    link: '/motore/template',
    forma: '23.2% 56.2%, 26.4% 59.2%, 34.0% 55.3%, 34.0% 48.3%, 31.0% 45.3%, 23.3% 49.1%',
    colore: 'rgba(76, 175, 80, 0.45)',
  },
  {
    nome: 'Cassettiera destra',
    link: '/motore/prototipi',
    forma: '53.7% 45.6%, 51.0% 43.2%, 51.3% 39.6%, 50.1% 38.2%, 50.1% 35.8%, 56.9% 32.4%, 59.9% 35.5%, 59.8% 42.6%, 57.4% 43.7%',
    colore: 'rgba(255, 152, 0, 0.45)',
  },
  {
    nome: 'Armadio',
    link: '/motore/grezzi', // pannello "Contatti grezzi"
    forma: '74.0% 18.1%, 71.3% 19.4%, 71.4% 42.1%, 83.2% 51.5%, 83.2% 25.1%, 78.2% 21.6%',
    colore: 'rgba(156, 39, 176, 0.45)',
  },
]
