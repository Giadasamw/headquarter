import { z } from "zod";
import { isoDate } from "./db";

export const contactFields = {
  company: z.string().optional(),
  person: z.string().optional(),
  contact_type: z.string().optional(),
  prototype_link: z.string().optional(),
  sent_date: z.string().regex(isoDate).optional().describe("YYYY-MM-DD"),
  follow_up_date: z.string().regex(isoDate).optional().describe("YYYY-MM-DD"),
  status: z.string().optional(),
  notes: z.string().optional(),
  type: z.enum(["azienda", "conversazione"]).optional(),
};
