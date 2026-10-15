import { defineTool } from "eve/tools";
import { z } from "zod";
import { db, isoDate, todayISO, unwrap } from "../lib/db";

export default defineTool({
  description: "Log hours worked in a room, optionally on a specific task.",
  inputSchema: z.object({
    room_id: z.string().uuid(),
    hours: z.number().positive().max(24),
    task_id: z.string().uuid().optional(),
    date: z.string().regex(isoDate).optional().describe("YYYY-MM-DD. Defaults to today."),
    note: z.string().optional(),
  }),
  async execute({ room_id, hours, task_id, date, note }) {
    return unwrap(
      await db()
        .from("time_log")
        .insert({ room_id, hours, task_id: task_id ?? null, date: date ?? todayISO(), note: note ?? null })
        .select()
        .single(),
    );
  },
});
