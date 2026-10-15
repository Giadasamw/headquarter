import { TIMEZONE, addDays, db, todayISO } from "./db";

// Read-only Toggl Track client. It only ever sends GET requests: Sophie never creates,
// edits, starts or stops anything on Toggl. Every sync costs exactly 3 requests.
const API = "https://api.track.toggl.com/api/v9";

// Free plan allows 30 requests per hour. 8 syncs x 3 requests = 24, with margin.
const MAX_SYNCS_PER_HOUR = 8;
// An on-demand sync is skipped when a successful one covering the same days ran this recently.
const FRESH_MINUTES = 10;

type TogglMe = { default_workspace_id: number };
type TogglProject = { id: number; workspace_id: number; name: string };
type TogglEntry = {
  id: number;
  workspace_id: number;
  project_id: number | null;
  start: string;
  duration: number;
  description: string | null;
  tags: string[] | null;
  server_deleted_at?: string | null;
};

export type UnmatchedProject = { project: string; entries: number; hours: number; dates: string[] };

export type SyncResult = {
  range: { start: string; end: string };
  upserted: number;
  newly_missing: number;
  unmatched_projects: UnmatchedProject[];
};

async function togglGet<T>(path: string): Promise<T> {
  const token = process.env.TOGGL_API_TOKEN;
  if (!token) throw new Error("Missing TOGGL_API_TOKEN.");
  const response = await fetch(`${API}${path}`, {
    method: "GET",
    headers: { Authorization: `Basic ${Buffer.from(`${token}:api_token`).toString("base64")}` },
  });
  if (response.status === 429) throw new Error("Toggl: troppe richieste in quest'ora, riprova più tardi.");
  if (response.status === 401 || response.status === 403) throw new Error("Toggl: token non valido o senza accesso.");
  if (!response.ok) throw new Error(`Toggl: errore ${response.status} su ${path}.`);
  return (await response.json()) as T;
}

// Room names look like "Motore: siti per aziende a impatto", Toggl projects like "Motore":
// compare only the part before ":", ignoring case and accents.
export function nameKey(name: string): string {
  return name
    .split(":")[0]
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

function londonDate(timestamp: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
}

async function recordRun(
  trigger: "morning" | "on_demand",
  start: string,
  end: string,
  outcome: { ok: true; result: SyncResult } | { ok: false; error: string },
) {
  await db()
    .from("toggl_sync_runs")
    .insert({
      trigger,
      range_start: start,
      range_end: end,
      ok: outcome.ok,
      error: outcome.ok ? null : outcome.error,
      upserted: outcome.ok ? outcome.result.upserted : 0,
      newly_missing: outcome.ok ? outcome.result.newly_missing : 0,
      unmatched_projects: outcome.ok ? outcome.result.unmatched_projects : [],
    });
}

async function runSync(start: string, end: string): Promise<SyncResult> {
  const supabase = db();

  const { data: rooms, error: roomsError } = await supabase.from("rooms").select("id, name");
  if (roomsError) throw new Error(roomsError.message);
  const roomByKey = new Map((rooms ?? []).map((room) => [nameKey(room.name), room.id as string]));
  const laboratorioId = roomByKey.get("laboratorio");
  const motoreId = roomByKey.get("motore");

  // 1. Workspace, 2. projects, 3. entries. Nothing is hardcoded.
  const me = await togglGet<TogglMe>("/me");
  const workspaceId = me.default_workspace_id;
  const projects = (await togglGet<TogglProject[]>("/me/projects?include_archived=true")).filter(
    (project) => project.workspace_id === workspaceId,
  );
  const projectById = new Map(projects.map((project) => [project.id, project]));

  // Ask one extra day on each side so the Europe/London day edges are always covered,
  // then keep only entries whose London start date falls inside the range.
  const from = `${addDays(start, -1)}T00:00:00Z`;
  const to = `${addDays(end, 2)}T00:00:00Z`;
  const entries = (
    await togglGet<TogglEntry[]>(
      `/me/time_entries?start_date=${encodeURIComponent(from)}&end_date=${encodeURIComponent(to)}`,
    )
  ).filter((entry) => entry.workspace_id === workspaceId && !entry.server_deleted_at);

  const rows: Record<string, unknown>[] = [];
  const stillOnToggl = new Set<number>();
  const unmatched = new Map<string, UnmatchedProject>();

  for (const entry of entries) {
    const date = londonDate(entry.start);
    if (date < start || date > end) continue;

    const project = entry.project_id ? projectById.get(entry.project_id) : undefined;
    const roomId = project ? roomByKey.get(nameKey(project.name)) : undefined;

    if (!roomId) {
      const name = project?.name ?? "(senza progetto)";
      const item = unmatched.get(name) ?? { project: name, entries: 0, hours: 0, dates: [] };
      item.entries += 1;
      if (entry.duration > 0) item.hours = Math.round((item.hours + entry.duration / 3600) * 100) / 100;
      if (!item.dates.includes(date)) item.dates.push(date);
      unmatched.set(name, item);
      continue;
    }

    stillOnToggl.add(entry.id);
    // A running timer has a negative duration: skip it until it is stopped.
    if (entry.duration < 0) continue;

    const taggedMotore = (entry.tags ?? []).some((tag) => nameKey(tag) === "motore");
    rows.push({
      source: "toggl",
      toggl_entry_id: entry.id,
      date,
      room_id: roomId,
      hours: Math.round((entry.duration / 3600) * 100) / 100,
      note: entry.description?.trim() || null,
      also_counts_for_room_id: roomId === laboratorioId && taggedMotore && motoreId ? motoreId : null,
      toggl_missing_since: null,
    });
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("time_log").upsert(rows, { onConflict: "toggl_entry_id" });
    if (error) throw new Error(error.message);
  }

  // Rows synced earlier that Toggl no longer returns: flag them, never delete them.
  const { data: known, error: knownError } = await supabase
    .from("time_log")
    .select("id, toggl_entry_id")
    .eq("source", "toggl")
    .is("toggl_missing_since", null)
    .gte("date", start)
    .lte("date", end);
  if (knownError) throw new Error(knownError.message);
  const missingIds = (known ?? [])
    .filter((row) => !stillOnToggl.has(Number(row.toggl_entry_id)))
    .map((row) => row.id as string);
  if (missingIds.length > 0) {
    const { error } = await supabase
      .from("time_log")
      .update({ toggl_missing_since: new Date().toISOString() })
      .in("id", missingIds);
    if (error) throw new Error(error.message);
  }

  return {
    range: { start, end },
    upserted: rows.length,
    newly_missing: missingIds.length,
    unmatched_projects: [...unmatched.values()],
  };
}

/** Sync Toggl entries whose Europe/London date is between start and end (inclusive). */
export async function syncToggl(
  start: string,
  end: string,
  trigger: "morning" | "on_demand",
): Promise<SyncResult> {
  try {
    const result = await runSync(start, end);
    await recordRun(trigger, start, end, { ok: true, result });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await recordRun(trigger, start, end, { ok: false, error: message }).catch(() => {});
    throw error;
  }
}

/** Morning wake-up: the last 3 days, to catch late corrections or a skipped morning. */
export async function syncTogglForMorning(): Promise<void> {
  const today = todayISO();
  try {
    await syncToggl(addDays(today, -3), addDays(today, -1), "morning");
  } catch (error) {
    // Already recorded in toggl_sync_runs: get_overview shows it, the briefing still goes out.
    console.error("Toggl morning sync failed:", error);
  }
}

/** Returns why an on-demand sync should not call Toggl right now, or null if it may. */
export async function onDemandSkipReason(start: string, end: string): Promise<string | null> {
  const supabase = db();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("toggl_sync_runs")
    .select("id", { count: "exact", head: true })
    .gte("ran_at", hourAgo);
  if (error) throw new Error(error.message);
  if ((count ?? 0) >= MAX_SYNCS_PER_HOUR) {
    return "Limite di sicurezza raggiunto: troppe sincronizzazioni nell'ultima ora. Uso i dati già salvati.";
  }

  const freshSince = new Date(Date.now() - FRESH_MINUTES * 60 * 1000).toISOString();
  const { data: recent, error: recentError } = await supabase
    .from("toggl_sync_runs")
    .select("ran_at")
    .eq("ok", true)
    .gte("ran_at", freshSince)
    .lte("range_start", start)
    .gte("range_end", end)
    .limit(1)
    .maybeSingle();
  if (recentError) throw new Error(recentError.message);
  if (recent) return `Dati già aggiornati da Toggl alle ${recent.ran_at}.`;
  return null;
}
