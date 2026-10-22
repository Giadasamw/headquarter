import { defineTool } from "eve/tools";
import { z } from "zod";
import { db, isoDate, todayISO, unwrap } from "../lib/db";

// Every diary entry Giada writes is checked for updates before Sophie replies. The tool result
// carries the step and the data it needs, so the check does not depend on Sophie remembering it.
const DIARY_CHECK =
  "Passaggio obbligatorio, prima di rispondere: rileggi il testo appena salvato e confrontalo con i contatti e i task aperti qui sotto. Se racconta qualcosa che va aggiornato (un contatto nuovo o cambiato: stato, prossimo passo, email, ultimo scambio e così via; un task finito o avanzato; ore lavorate senza timer), scrivilo subito con add_contact, update_contact, update_task o log_time (origine diario). Non chiedere conferma e non fare un riepilogo di cosa hai scritto. Se non c'è niente da aggiornare, non dire niente al riguardo.";

export default defineTool({
  description:
    "Add an entry to the journal. For a diary entry written by Giada, the result contains a mandatory check to do before replying.",
  inputSchema: z.object({
    text: z.string().min(1),
    date: z.string().regex(isoDate).optional().describe("YYYY-MM-DD. Defaults to today."),
  }),
  async execute({ text, date }) {
    const supabase = db();
    const entry = unwrap(await supabase.from("journal").insert({ text, date: date ?? todayISO() }).select().single());

    // Sophie's own notes (ideas, Friday review) are not a diary of the day: nothing to check.
    if (/^\s*(IDEA|REVISIONE):/i.test(text)) return { saved: entry };

    const [contacts, tasks] = await Promise.all([
      supabase.from("contacts").select("id, room_id, company, person, type, status, next_step, last_update, last_direction"),
      supabase.from("tasks").select("id, room_id, title, type, status, progress_percent").neq("status", "done"),
    ]);
    return {
      saved: entry,
      mandatory_next_step: DIARY_CHECK,
      contacts: unwrap(contacts),
      open_tasks: unwrap(tasks),
    };
  },
});
