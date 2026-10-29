-- Job offers: the most relevant applications, tracked from the "Job offers" tab of the
-- Contatti grezzi panel (/motore/grezzi). Only adds a new, empty table: nothing existing
-- is dropped or rewritten.
--
-- To remove it later (deletes the job offers saved in it):
--   drop table public.job_offers;
create table public.job_offers (
  id uuid primary key default gen_random_uuid(),
  job_title text not null default '',
  job_offer_link text,
  company_link text,
  deadline date,
  applied_on date,
  status text not null default 'contacted'
    check (status in ('contacted', 'rejected', 'in_negotiation')),
  created_at timestamptz not null default now()
);

create index job_offers_applied_on_idx on public.job_offers (applied_on desc nulls first, created_at desc);

-- Row Level Security on with no policies, like every other table: only server code using the
-- service role key can read or write.
alter table public.job_offers enable row level security;
