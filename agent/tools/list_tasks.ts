import { defineTool } from "eve/tools";
import { z } from "zod";
import { db, unwrap } from "../lib/db";

export default defineTool({
  description: "List tasks, optionally filtered by room, status, and type.",
  inputSchema: z.object({
    room_id: z.string().uuid().optional().describe("Room id (from get_overview)."),
    status: z.enum(["todo", "active", "done", "paused"]).optional(),
    type: z.enum(["one_off", "recurring", "ongoing"]).optional(),
  }),
  async execute({ room_id, status, type }) {
    let query = db().from("tasks").select("*").order("priority_order", { ascending: true, nullsFirst: false });
    if (room_id) query = query.eq("room_id", room_id);
    if (status) query = query.eq("status", status);
    if (type) query = query.eq("type", type);
    return unwrap(await query);
  },
});
