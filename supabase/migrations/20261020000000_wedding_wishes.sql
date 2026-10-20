-- ─────────────────────────────────────────────────────────────────────────────
--  A Little Universe of Love — guest wishes
--
--  Security model
--  • Visitors (anon key) may INSERT a wish. It is always stored as 'pending'.
--  • Visitors may SELECT only 'approved' wishes, and only public columns.
--  • Pending / rejected wishes are never readable through the API.
--  • Moderation happens in the Supabase dashboard (Table editor) or via SQL,
--    which use privileged roles — never ship the service-role key to the site.
--  • A trigger normalises text, enforces lengths, and rate-limits by a hashed
--    client IP (raw IPs are never stored).
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.wedding_wishes (
  id                uuid primary key default gen_random_uuid(),
  guest_name        text not null,
  message           text not null,
  created_at        timestamptz not null default now(),
  moderation_status text not null default 'pending',
  constraint wedding_wishes_name_length    check (char_length(guest_name) between 1 and 60),
  constraint wedding_wishes_message_length check (char_length(message) between 2 and 500),
  constraint wedding_wishes_status_valid   check (moderation_status in ('pending', 'approved', 'rejected'))
);

comment on table public.wedding_wishes is 'Guest wishes for Sam & Prithiksha. Only approved rows are public.';

create index if not exists wedding_wishes_public_feed
  on public.wedding_wishes (created_at desc)
  where moderation_status = 'approved';

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.wedding_wishes enable row level security;

-- Column-level privileges: the public API can only ever touch these columns.
revoke all on public.wedding_wishes from anon, authenticated;
grant select (id, guest_name, message, created_at) on public.wedding_wishes to anon, authenticated;
grant insert (guest_name, message) on public.wedding_wishes to anon, authenticated;

drop policy if exists "Approved wishes are public" on public.wedding_wishes;
create policy "Approved wishes are public"
  on public.wedding_wishes
  for select
  to anon, authenticated
  using (moderation_status = 'approved');

drop policy if exists "Guests can submit pending wishes" on public.wedding_wishes;
create policy "Guests can submit pending wishes"
  on public.wedding_wishes
  for insert
  to anon, authenticated
  with check (
    moderation_status = 'pending'
    and char_length(guest_name) between 1 and 60
    and char_length(message) between 2 and 500
  );

-- No UPDATE / DELETE policies: visitors can never edit or remove wishes.

-- ── Private rate-limit ledger (not exposed through the API) ─────────────────
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.wish_rate_limits (
  ip_hash    text not null,
  created_at timestamptz not null default now()
);
create index if not exists wish_rate_limits_lookup on private.wish_rate_limits (ip_hash, created_at desc);
alter table private.wish_rate_limits enable row level security;

create or replace function private.guard_wedding_wish()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  headers   json;
  client_ip text;
  ip_key    text;
  recent    integer;
  burst     integer;
begin
  -- Never trust the client: status and timestamp are always set here.
  new.moderation_status := 'pending';
  new.created_at := now();

  -- Normalise text: strip control characters, collapse whitespace in names.
  new.guest_name := btrim(regexp_replace(regexp_replace(coalesce(new.guest_name, ''), '[[:cntrl:]]', '', 'g'), '\s+', ' ', 'g'));
  new.message := btrim(regexp_replace(coalesce(new.message, ''), '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g'));

  if new.guest_name ~* '(https?://|www\.)' or new.message ~* '(https?://|www\.)' then
    raise exception 'Links are not allowed in wishes' using errcode = 'check_violation';
  end if;

  -- Rate limiting by hashed client IP (from PostgREST request headers).
  begin
    headers := nullif(current_setting('request.headers', true), '')::json;
  exception when others then
    headers := null;
  end;
  client_ip := coalesce(
    nullif(split_part(coalesce(headers ->> 'x-forwarded-for', ''), ',', 1), ''),
    headers ->> 'cf-connecting-ip',
    'unknown'
  );
  ip_key := encode(extensions.digest(client_ip || ':aluol-wishes', 'sha256'), 'hex');

  select count(*) into recent
    from private.wish_rate_limits
   where ip_hash = ip_key and created_at > now() - interval '10 minutes';
  if recent >= 3 then
    raise exception 'Too many wishes from this device, please try again later' using errcode = 'P0001';
  end if;

  select count(*) into burst
    from private.wish_rate_limits
   where created_at > now() - interval '1 minute';
  if burst >= 40 then
    raise exception 'Too many wishes right now, please try again shortly' using errcode = 'P0001';
  end if;

  insert into private.wish_rate_limits (ip_hash) values (ip_key);
  delete from private.wish_rate_limits where created_at < now() - interval '2 days';

  return new;
end;
$$;

revoke all on function private.guard_wedding_wish() from public, anon, authenticated;

drop trigger if exists guard_wedding_wish on public.wedding_wishes;
create trigger guard_wedding_wish
  before insert on public.wedding_wishes
  for each row execute function private.guard_wedding_wish();

-- ── Moderation helpers (run in the SQL editor) ──────────────────────────────
--   select id, guest_name, message, created_at from public.wedding_wishes
--    where moderation_status = 'pending' order by created_at;
--   update public.wedding_wishes set moderation_status = 'approved' where id = '…';
--   update public.wedding_wishes set moderation_status = 'rejected' where id = '…';
