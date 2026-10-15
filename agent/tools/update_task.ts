import { defineTool } from "eve/tools";
import { z } from "zod";
import { db, unwrap } from "../lib/db";

export default defineTool({
  description:
    "Update the status and/or progress_percent of a task. Setting status to 'active' requires the user's approval.",
  inputSchema: z
    .object({
      task_id: z.string().uuid(),
      status: z.enum(["todo", "active", "done", "paused"]).optional(),
      progress_percent: z.number().min(0).max(100).optional(),
    })
    .refine((v) => v.status !== undefined || v.progress_percent !== undefined, {
      message: "Provide status or progress_percent.",
    }),
  approval: ({ toolInput }) => (toolInput?.status === "active" ? "user-approval" : "not-applicable"),
  async execute({ task_id, status, progress_percent }) {
    const changes: Record<string, unknown> = {};
    if (status !== undefined) changes.status = status;
    if (progress_percent !== undefined) changes.progress_percent = progress_percent;
    return unwrap(await db().from("tasks").update(changes).eq("id", task_id).select().maybeSingle());
  },
});
