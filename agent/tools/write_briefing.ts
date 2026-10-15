import { defineTool } from "eve/tools";
import { z } from "zod";
import { db, isoDate, todayISO, unwrap } from "../lib/db";

export default defineTool({
  description: "Save a briefing.",
  inputSchema: z.object({
    text: z.string().min(1),
    date: z.string().regex(isoDate).optional().describe("YYYY-MM-DD. Defaults to today."),
  }),
  async execute({ text, date }) {
    return unwrap(await db().from("briefings").insert({ text, date: date ?? todayISO() }).select().single());
  },
});
