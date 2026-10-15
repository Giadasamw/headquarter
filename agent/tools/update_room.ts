import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { db, unwrap } from "../lib/db";

export default defineTool({
  description:
    "Update weekly_hours_target, is_active and/or priority_order of a room. Always requires the user's approval.",
  inputSchema: z
    .object({
      room_id: z.string().uuid(),
      weekly_hours_target: z.number().min(0).max(168).optional(),
      is_active: z.boolean().optional(),
      priority_order: z.number().int().optional(),
    })
    .refine(
      (v) => v.weekly_hours_target !== undefined || v.is_active !== undefined || v.priority_order !== undefined,
      { message: "Provide at least one field to update." },
    ),
  approval: always(),
  async execute({ room_id, ...changes }) {
    return unwrap(await db().from("rooms").update(changes).eq("id", room_id).select().maybeSingle());
  },
});
