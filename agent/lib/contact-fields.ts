import { z } from "zod";
import { isoDate } from "./db";

// The only values the database accepts (contacts_type_check / contacts_status_check).
export const CONTACT_TYPES = ["azienda", "conversazione"] as const;
export const CONTACT_STATUSES = ["grezzo", "da contattare", "attivo", "in trattativa", "spento", "rifiutato"] as const;

export const contactFields = {
  company: z.string().optional().describe("Company name."),
  person: z.string().optional().describe("Name of the person to talk to at the company."),
  email: z.string().optional(),
  location: z.string().optional().describe("City and/or country."),
  timezone: z.string().optional().describe("For example Europe/London."),
  offer: z.string().optional().describe("What Giada offers or offered them."),
  summary: z.string().optional().describe("Short summary of the relationship so far."),
  next_step: z.string().optional().describe("The next thing to do with this contact."),
  last_update: z
    .union([z.iso.datetime({ offset: true }), z.iso.date()])
    .optional()
    .describe("When the last message was exchanged: YYYY-MM-DD, or date and time with offset (2026-10-22T18:30:00+01:00)."),
  last_direction: z
    .enum(["in", "out"])
    .optional()
    .describe('Who wrote last: "in" = the contact wrote to Giada, "out" = Giada wrote to the contact.'),
  status: z.enum(CONTACT_STATUSES).optional(),
  type: z.enum(CONTACT_TYPES).optional().describe('"azienda" = potential client, "conversazione" = validation conversation.'),
  contact_type: z.string().optional(),
  prototype_link: z.string().optional(),
  sent_date: z.string().regex(isoDate).optional().describe("YYYY-MM-DD"),
  follow_up_date: z.string().regex(isoDate).optional().describe("YYYY-MM-DD"),
  notes: z.string().optional(),
};
