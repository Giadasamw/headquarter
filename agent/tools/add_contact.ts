import { defineTool } from "eve/tools";
import { z } from "zod";
import { contactFields } from "../lib/contact-fields";
import { db, unwrap } from "../lib/db";

export default defineTool({
  description:
    "Add a new contact to a room. Every column of the contacts table can be filled: company, person, email, location, timezone, offer, summary, next_step, last_update, last_direction, status, type.",
  inputSchema: z.object({ room_id: z.string().uuid(), ...contactFields }),
  async execute(input) {
    return unwrap(await db().from("contacts").insert(input).select().single());
  },
});
