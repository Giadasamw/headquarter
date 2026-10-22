import { defineTool } from "eve/tools";
import { z } from "zod";
import { contactFields } from "../lib/contact-fields";
import { db, unwrap } from "../lib/db";

// There is deliberately no tool that deletes a contact.
export default defineTool({
  description:
    "Update fields of an existing contact (company, person, email, location, timezone, offer, summary, next_step, last_update, last_direction, status, type and the others). Only the fields provided are changed. Contacts are never deleted.",
  inputSchema: z.object({
    contact_id: z.string().uuid(),
    room_id: z.string().uuid().optional(),
    ...contactFields,
  }),
  async execute({ contact_id, ...changes }) {
    if (Object.keys(changes).length === 0) throw new Error("Provide at least one field to update.");
    return unwrap(await db().from("contacts").update(changes).eq("id", contact_id).select().maybeSingle());
  },
});
