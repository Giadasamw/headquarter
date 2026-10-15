import { defineTool } from "eve/tools";
import { z } from "zod";
import { TIMEZONE, addDays, db, todayISO, unwrap, weekBounds, weekdayOf } from "../lib/db";

export default defineTool({
  description:
    "Get the full current situation in one call: today's date and weekday, the current week (Monday to Sunday), all rooms, all tasks not done, milestones in the next 30 days, hours logged this week per room, journal entries of the last 7 days, and the latest briefing.",
  inputSchema: z.object({}),
  async execute() {
    const supabase = db();
    const today = todayISO();
    const { monday, sunday } = weekBounds(today);

    const [rooms, tasks, milestones, timeLog, journal, briefing] = await Promise.all([
      supabase.from("rooms").select("*").order("priority_order", { ascending: true, nullsFirst: false }),
      supabase.from("tasks").select("*").neq("status", "done").order("priority_order", { ascending: true, nullsFirst: false }),
      supabase
        .from("milestones")
        .select("*")
        .gte("due_date", today)
        .lte("due_date", addDays(today, 30))
        .order("due_date"),
      supabase
        .from("time_log")
        .select("room_id, hours, task:tasks(counts_also_for_room_id)")
        .gte("date", monday)
        .lte("date", sunday),
      supabase
        .from("journal")
        .select("*")
        .gte("date", addDays(today, -6))
        .lte("date", today)
        .order("date", { ascending: false }),
      supabase.from("briefings").select("*").order("date", { ascending: false }).limit(1).maybeSingle(),
    ]);

    const roomRows = unwrap(rooms) as { id: string; name: string; weekly_hours_target: number }[];
    const logRows = unwrap(timeLog) as unknown as {
      room_id: string;
      hours: number;
      task: { counts_also_for_room_id: string | null } | null;
    }[];

    const hoursByRoom = new Map<string, number>();
    for (const row of logRows) {
      const hours = Number(row.hours);
      hoursByRoom.set(row.room_id, (hoursByRoom.get(row.room_id) ?? 0) + hours);
      const second = row.task?.counts_also_for_room_id;
      if (second && second !== row.room_id) {
        hoursByRoom.set(second, (hoursByRoom.get(second) ?? 0) + hours);
      }
    }

    if (briefing.error) throw new Error(briefing.error.message);

    return {
      timezone: TIMEZONE,
      today,
      weekday: weekdayOf(today),
      week: { monday, sunday },
      rooms: roomRows,
      open_tasks: unwrap(tasks),
      milestones_next_30_days: unwrap(milestones),
      hours_this_week: roomRows.map((room) => ({
        room_id: room.id,
        room: room.name,
        hours_logged: hoursByRoom.get(room.id) ?? 0,
        weekly_hours_target: Number(room.weekly_hours_target),
      })),
      journal_last_7_days: unwrap(journal),
      latest_briefing: briefing.data,
    };
  },
});
