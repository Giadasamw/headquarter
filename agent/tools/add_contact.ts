import { defineTool } from "eve/tools";
import { z } from "zod";
import { contactFields } from "../lib/contact-fields";
import { db, unwrap } from "../lib/db";

export default defineTool({
  description: "Add a new contact to a room.",
  inputSchema: z.object({ room_id: z.string().uuid(), ...contactFields }),
  async execute(input) {
    return unwrap(await db().from("contacts").insert(input).select().single());
  },
});
