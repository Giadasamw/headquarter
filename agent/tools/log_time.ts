import { defineTool } from "eve/tools";
import { z } from "zod";
import { db, isoDate, todayISO, unwrap } from "../lib/db";

export default defineTool({
  description:
    "Log hours worked in a room, optionally on a specific task. Toggl hours arrive on their own through sync_toggl: use this only for hours Giada asks you to log by hand (source manual) or for hours you read in her journal (source journal). Journal hours are a safety net: for the same room and day, if Toggl has hours, the journal hours are not counted, so it is fine to log them anyway.",
  inputSchema: z.object({
    room_id: z.string().uuid(),
    hours: z.number().positive().max(24),
    task_id: z.string().uuid().optional(),
    date: z.string().regex(isoDate).optional().describe("YYYY-MM-DD. Defaults to today."),
    note: z.string().optional(),
    source: z
      .enum(["manual", "journal"])
      .optional()
      .describe("manual when Giada asks you to log hours, journal when you read them in her journal. Defaults to manual."),
  }),
  async execute({ room_id, hours, task_id, date, note, source }) {
    return unwrap(
      await db()
        .from("time_log")
        .insert({
          room_id,
          hours,
          task_id: task_id ?? null,
          date: date ?? todayISO(),
          note: note ?? null,
          source: source ?? "manual",
        })
        .select()
        .single(),
    );
  },
});
