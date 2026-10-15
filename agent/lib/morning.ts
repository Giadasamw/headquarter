export const MORNING_TIMEZONE = "Europe/London";

export const MORNING_HOUR = 7;

export const MORNING_MESSAGE =
  "Sveglia del mattino. Leggi il diario di ieri e aggiorna registro delle ore e task. Poi scrivi e salva il briefing di oggi seguendo le tue istruzioni. Oggi è venerdì? Allora prepara la revisione della settimana. Ultimo passo obbligatorio: salva il briefing usando lo strumento write_briefing. Se non lo salvi, il lavoro non è finito.";

function offsetMinutes(date: Date): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: MORNING_TIMEZONE, timeZoneName: "longOffset" })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;
  const match = name?.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "-" ? -minutes : minutes;
}

function utcSlot(date: Date): string {
  const total = (((MORNING_HOUR * 60 - offsetMinutes(date)) % 1440) + 1440) % 1440;
  return `${total % 60} ${Math.floor(total / 60)}`;
}

// Vercel evaluates cron in UTC, so each schedule fires at the UTC time that equals
// MORNING_HOUR in MORNING_TIMEZONE for one half of the year (summer/winter time). Only the
// schedule matching today's offset actually wakes the agent.
const year = new Date().getUTCFullYear();
const slots = [...new Set([utcSlot(new Date(Date.UTC(year, 0, 15))), utcSlot(new Date(Date.UTC(year, 6, 15)))])];

export function cronForSlot(index: number): string {
  return `${slots[index] ?? slots[0]} * * *`;
}

export function isSlotActiveToday(index: number): boolean {
  return slots[index] !== undefined && slots[index] === utcSlot(new Date());
}
