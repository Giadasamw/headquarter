-- When a task was completed, for the Scrivania's "Task completate" panel.
-- Only adds a nullable column and a trigger: nothing existing is dropped or rewritten.
-- The trigger fills it whoever changes the status (the app, Sophie, or by hand in Supabase).
--
-- To remove it later (keeps the dates already written):
--   drop trigger tasks_set_completed_at on public.tasks;
--   drop function public.set_task_completed_at();

-- 1. La nuova colonna: vuota per tutte le task esistenti, nessun dato toccato.
alter table public.tasks
  add column completed_at timestamptz;

-- 2. Il "timbro": decide cosa scrivere in completed_at.
create or replace function public.set_task_completed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'done' then
    -- Diventa done adesso: segna l'ora. Era già done: tiene la data che aveva.
    if tg_op = 'INSERT' or old.status is distinct from 'done' then
      new.completed_at := now();
    end if;
  else
    -- Non è (più) completata: nessuna data.
    new.completed_at := null;
  end if;
  return new;
end;
$$;

-- 3. Attacca il timbro alla tabella: scatta quando una task viene creata o cambia stato.
create trigger tasks_set_completed_at
  before insert or update of status on public.tasks
  for each row execute function public.set_task_completed_at();
