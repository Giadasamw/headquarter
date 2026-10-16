-- Fields the app's contacts list needs. Only adds nullable columns: nothing existing is dropped
-- or rewritten, so Sophie's tools keep working. The app shows `company` as "name" and
-- `person` as "contact_person" (see lib/contacts.ts), so those two are not duplicated here.
alter table public.contacts
  add column email text,
  add column location text,
  add column timezone text,
  add column offer text,
  add column summary text,
  add column next_step text,
  -- When the last message was exchanged, and who sent it (e.g. "in" = they wrote, "out" = we wrote).
  add column last_update timestamptz,
  add column last_direction text;

create index if not exists contacts_status_idx on public.contacts (status);
create index if not exists prototypes_contact_id_idx on public.prototypes (contact_id);

-- Row Level Security stays on with no policies, like every other table: the publishable (anon)
-- key can't read or write anything, and only server code using the service role key can.
alter table public.contacts enable row level security;
alter table public.prototypes enable row level security;
