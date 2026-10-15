import { defineTool } from "eve/tools";
import { z } from "zod";
import { TIMEZONE, addDays, db, todayISO, unwrap, weekBounds, weekdayOf } from "../lib/db";

export default defineTool({
  description:
    "Get the full current situation in one call: today's date and weekday, the current week (Monday to Sunday), all rooms, all tasks not done, milestones in the next 30 days, hours logged this week per room, journal entries of the last 7 days, the latest briefing, and the Toggl status with any mismatch to report in the briefing. Hours rule: Toggl is the main source; for a given room and day, journal hours count only when Toggl has nothing; hand-logged hours always count; entries no longer on Toggl do not count.",
  inputSchema: z.object({}),
  async execute() {
    const supabase = db();
    const today = todayISO();
    const { monday, sunday } = weekBounds(today);

    const [rooms, tasks, milestones, timeLog, journal, briefing, missing, lastSync, lastOkSync] = await Promise.all([
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
        .select("date, room_id, hours, source, also_counts_for_room_id, task:tasks(counts_also_for_room_id)")
        .is("toggl_missing_since", null)
        .gte("date", monday)
        .lte("date", sunday),
      supabase
        .from("journal")
        .select("*")
        .gte("date", addDays(today, -6))
        .lte("date", today)
        .order("date", { ascending: false }),
      supabase.from("briefings").select("*").order("date", { ascending: false }).limit(1).maybeSingle(),
      supabase
        .from("time_log")
        .select("date, hours, note, toggl_missing_since, room:rooms!time_log_room_id_fkey(name)")
        .not("toggl_missing_since", "is", null)
        .gte("date", addDays(today, -13))
        .order("date"),
      supabase
        .from("toggl_sync_runs")
        .select("ran_at, trigger, range_start, range_end, ok, error")
        .order("ran_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("toggl_sync_runs")
        .select("ran_at, unmatched_projects")
        .eq("ok", true)
        .order("ran_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const roomRows = unwrap(rooms) as { id: string; name: string; weekly_hours_target: number }[];
    const logRows = unwrap(timeLog) as unknown as {
      date: string;
      room_id: string;
      hours: number;
      source: "toggl" | "journal" | "manual";
      also_counts_for_room_id: string | null;
      task: { counts_also_for_room_id: string | null } | null;
    }[];

    // Every room a row counts for: its own, plus Laboratorio entries tagged "motore" on Toggl,
    // plus tasks marked "counts also for" (for hours that do not come from Toggl).
    const roomsOf = (row: (typeof logRows)[number]) =>
      new Set(
        [row.room_id, row.also_counts_for_room_id, row.source === "toggl" ? null : row.task?.counts_also_for_room_id].filter(
          (id): id is string => Boolean(id),
        ),
      );

    // Room+day pairs that have Toggl hours: journal hours for those pairs are not counted.
    const togglDays = new Set<string>();
    for (const row of logRows) {
      if (row.source === "toggl") for (const room of roomsOf(row)) togglDays.add(`${row.date}|${room}`);
    }

    type Breakdown = { toggl: number; journal: number; journal_not_counted: number; manual: number };
    const byRoom = new Map<string, Breakdown>();
    const add = (room: string, key: keyof Breakdown, hours: number) => {
      const entry = byRoom.get(room) ?? { toggl: 0, journal: 0, journal_not_counted: 0, manual: 0 };
      entry[key] = Math.round((entry[key] + hours) * 100) / 100;
      byRoom.set(room, entry);
    };

    let totalWorked = 0;
    for (const row of logRows) {
      const hours = Number(row.hours);
      const ignored = (room: string) => row.source === "journal" && togglDays.has(`${row.date}|${room}`);
      for (const room of roomsOf(row)) add(room, ignored(room) ? "journal_not_counted" : row.source, hours);
      // Real hours worked, each row once (shared Laboratorio/Motore hours are not doubled).
      if (!ignored(row.room_id)) totalWorked += hours;
    }

    for (const result of [briefing, missing, lastSync, lastOkSync]) {
      if (result.error) throw new Error(result.error.message);
    }

    return {
      timezone: TIMEZONE,
      today,
      weekday: weekdayOf(today),
      week: { monday, sunday },
      rooms: roomRows,
      open_tasks: unwrap(tasks),
      milestones_next_30_days: unwrap(milestones),
      hours_this_week: roomRows.map((room) => {
        const b = byRoom.get(room.id) ?? { toggl: 0, journal: 0, journal_not_counted: 0, manual: 0 };
        return {
          room_id: room.id,
          room: room.name,
          hours_logged: Math.round((b.toggl + b.journal + b.manual) * 100) / 100,
          weekly_hours_target: Number(room.weekly_hours_target),
          from_toggl: b.toggl,
          from_journal: b.journal,
          from_journal_not_counted_because_toggl_has_hours: b.journal_not_counted,
          logged_by_hand: b.manual,
        };
      }),
      total_hours_worked_this_week: Math.round(totalWorked * 100) / 100,
      journal_last_7_days: unwrap(journal),
      latest_briefing: briefing.data,
      toggl: {
        last_sync: lastSync.data,
        mismatches_to_report: {
          entries_no_longer_on_toggl_last_14_days: (missing.data ?? []).map((row) => ({
            date: row.date,
            room: (row.room as unknown as { name: string } | null)?.name ?? null,
            hours: Number(row.hours),
            note: row.note,
            noticed_at: row.toggl_missing_since,
          })),
          toggl_projects_matching_no_room: lastOkSync.data?.unmatched_projects ?? [],
        },
      },
    };
  },
});
