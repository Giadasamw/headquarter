import { defineTool } from "eve/tools";
import { z } from "zod";
import { addDays, isoDate, todayISO, weekBounds } from "../lib/db";
import { onDemandSkipReason, syncToggl } from "../lib/toggl";

export default defineTool({
  description:
    "Read the latest hours from Toggl Track into the hours log (read only: it never changes Toggl and never starts or stops timers). Call it once, before get_overview, whenever Giada asks about her hours. Defaults to the current week, Monday to today. If the data was refreshed a few minutes ago it skips Toggl and says so: then just use get_overview.",
  inputSchema: z.object({
    start: z.string().regex(isoDate).optional().describe("YYYY-MM-DD. Defaults to Monday of this week."),
    end: z.string().regex(isoDate).optional().describe("YYYY-MM-DD. Defaults to today."),
  }),
  async execute({ start, end }) {
    const today = todayISO();
    const to = end && end < today ? end : today;
    const from = start ?? weekBounds(today).monday;
    if (from > to) throw new Error("start must be on or before end.");
    if (from < addDays(to, -30)) throw new Error("At most 31 days per sync.");

    const skip = await onDemandSkipReason(from, to);
    if (skip) return { synced: false, reason: skip };

    return { synced: true, ...(await syncToggl(from, to, "on_demand")) };
  },
});
