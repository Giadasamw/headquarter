// ============================================================================
// GENERA L'ELENCO DEI PANNELLI (lib/pannelli.json)
// ----------------------------------------------------------------------------
// Guarda le cartelle app/<stanza>/<pannello>/page.tsx e scrive l'elenco usato
// dal menu della chat di Sophie. Parte da solo prima di "pnpm dev" e "pnpm build"
// (quindi a ogni pubblicazione su Vercel): un pannello nuovo compare da solo.
//
// Nome del pannello: il titolo della pagina, senza " | Quartier generale".
// Se la pagina non ha un titolo, si usa il nome della cartella.
// Le stanze senza pannelli non compaiono.
// ============================================================================
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Le stanze, nell'ordine in cui compaiono nel menu, con il nome scritto per bene
// (le cartelle non possono avere accenti). Chiave = nome della cartella dentro app/.
// Una stanza con pannelli che non è in questa lista compare comunque, in fondo.
const STANZE = {
  motore: 'Motore',
  laboratorio: 'Laboratorio',
  pinterest: 'Pinterest',
  operativita: 'Operatività',
}

// Cartelle dentro app/ che non sono stanze
const NON_STANZE = new Set(['ufficio', 'login', 'api'])

const APP = join(import.meta.dirname, '..', 'app')
const FILE_PAGINA = ['page.tsx', 'page.ts', 'page.jsx', 'page.js']

// Cartelle "speciali" di Next.js: [id], (gruppo), @slot, _privata
const speciale = (nome) => /^[[(@_]/.test(nome)

const cartelle = (percorso) =>
  readdirSync(percorso, { withFileTypes: true })
    .filter((voce) => voce.isDirectory() && !speciale(voce.name))
    .map((voce) => voce.name)

function nomeDelPannello(cartella, filePagina) {
  const titolo = readFileSync(filePagina, 'utf8').match(/title:\s*['"`]([^'"`]+)['"`]/)?.[1]
  const nome = titolo?.split('|')[0].trim()
  return nome || cartella.charAt(0).toUpperCase() + cartella.slice(1)
}

const stanze = cartelle(APP)
  .filter((stanza) => !NON_STANZE.has(stanza))
  .map((stanza) => ({
    stanza: STANZE[stanza] ?? stanza.charAt(0).toUpperCase() + stanza.slice(1),
    cartella: stanza,
    pannelli: cartelle(join(APP, stanza))
      .map((pannello) => {
        const file = FILE_PAGINA.map((nome) => join(APP, stanza, pannello, nome)).find(existsSync)
        return file && { nome: nomeDelPannello(pannello, file), link: `/${stanza}/${pannello}` }
      })
      .filter(Boolean)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'it')),
  }))
  .filter((stanza) => stanza.pannelli.length > 0)

const ordine = Object.keys(STANZE)
const posizione = (cartella) => (ordine.includes(cartella) ? ordine.indexOf(cartella) : ordine.length)
stanze.sort((a, b) => posizione(a.cartella) - posizione(b.cartella) || a.stanza.localeCompare(b.stanza, 'it'))

const risultato = stanze.map(({ stanza, pannelli }) => ({ stanza, pannelli }))
writeFileSync(join(APP, '..', 'lib', 'pannelli.json'), JSON.stringify(risultato, null, 2) + '\n')
console.log(`Menu di Sophie: ${risultato.map((s) => `${s.stanza} (${s.pannelli.length})`).join(', ') || 'nessun pannello'}`)
