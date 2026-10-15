-- Toggl Track as a read-only source of hours.
-- Only adds columns and one table: nothing existing is dropped or rewritten.

-- Where each time_log row comes from. Existing rows were written by hand through Sophie.
alter table public.time_log
  add column source text not null default 'manual'
    check (source in ('toggl', 'journal', 'manual'));

-- Toggl time entry id. Unique, so a re-sync updates the same row instead of adding one.
alter table public.time_log
  add column toggl_entry_id bigint unique;

-- Second room the hours also count for (Laboratorio entries tagged "motore" -> Motore).
alter table public.time_log
  add column also_counts_for_room_id uuid references public.rooms(id) on delete set null;

-- Set when a synced entry is no longer on Toggl (deleted, or moved off a room project).
-- The row is kept, excluded from the hours, and reported in the briefing.
alter table public.time_log
  add column toggl_missing_since timestamptz;

alter table public.time_log
  add constraint time_log_toggl_fields_check
    check (source = 'toggl' or (toggl_entry_id is null and toggl_missing_since is null));

-- One row per sync run: used to throttle on-demand syncs and to report problems.
create table public.toggl_sync_runs (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz not null default now(),
  trigger text not null check (trigger in ('morning', 'on_demand')),
  range_start date not null,
  range_end date not null,
  ok boolean not null,
  error text,
  upserted integer not null default 0,
  newly_missing integer not null default 0,
  -- [{ project, entries, hours, dates }] for Toggl projects that match no room.
  unmatched_projects jsonb not null default '[]'::jsonb
);

create index toggl_sync_runs_ran_at_idx on public.toggl_sync_runs (ran_at desc);

-- Same protection as the other tables: only the service role (Sophie's server code) reads and writes.
alter table public.toggl_sync_runs enable row level security;
