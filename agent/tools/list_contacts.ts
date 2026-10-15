import { defineTool } from "eve/tools";
import { z } from "zod";
import { db, unwrap } from "../lib/db";

export default defineTool({
  description: "List contacts, optionally filtered by room or status.",
  inputSchema: z.object({
    room_id: z.string().uuid().optional(),
    status: z.string().optional(),
  }),
  async execute({ room_id, status }) {
    let query = db().from("contacts").select("*").order("follow_up_date", { ascending: true, nullsFirst: false });
    if (room_id) query = query.eq("room_id", room_id);
    if (status) query = query.eq("status", status);
    return unwrap(await query);
  },
});
