-- Fixed lists for contacts.type and contacts.status. Any other value (including different
-- capitalisation or accents) is rejected by the database. An empty value (null) is still allowed.
alter table public.contacts alter column type set default 'azienda';

alter table public.contacts
  add constraint contacts_type_check
    check (type in ('azienda', 'conversazione'));

alter table public.contacts
  add constraint contacts_status_check
    check (status in ('grezzo', 'da contattare', 'attivo', 'in trattativa', 'spento', 'rifiutato'));
