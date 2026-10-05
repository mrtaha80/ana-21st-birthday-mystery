-- Run in Supabase SQL Editor after creating both private Auth users.
create table if not exists public.couple_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.couple_members enable row level security;
revoke all on public.couple_members from anon, authenticated;
grant select on public.couple_members to authenticated;
drop policy if exists "members can see only their own membership" on public.couple_members;
create policy "members can see only their own membership" on public.couple_members
  for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.couple_state (
  id text primary key check (id = 'our-universe'),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.couple_state enable row level security;
revoke all on public.couple_state from anon, authenticated;
grant select, insert, update on public.couple_state to authenticated;
drop policy if exists "only couple members can read shared state" on public.couple_state;
drop policy if exists "only couple members can create shared state" on public.couple_state;
drop policy if exists "only couple members can update shared state" on public.couple_state;
create policy "only couple members can read shared state" on public.couple_state for select to authenticated
using (exists (select 1 from public.couple_members m where m.user_id = (select auth.uid())));
create policy "only couple members can create shared state" on public.couple_state for insert to authenticated
with check (id = 'our-universe' and exists (select 1 from public.couple_members m where m.user_id = (select auth.uid())));
create policy "only couple members can update shared state" on public.couple_state for update to authenticated
using (exists (select 1 from public.couple_members m where m.user_id = (select auth.uid())))
with check (id = 'our-universe' and exists (select 1 from public.couple_members m where m.user_id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('couple-memories','couple-memories',false,6291456,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=false,file_size_limit=6291456,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];
drop policy if exists "couple members can manage private memory photos" on storage.objects;
create policy "couple members can manage private memory photos" on storage.objects for all to authenticated
using (bucket_id='couple-memories' and exists (select 1 from public.couple_members m where m.user_id=(select auth.uid())))
with check (bucket_id='couple-memories' and exists (select 1 from public.couple_members m where m.user_id=(select auth.uid())));
create or replace function public.touch_couple_state_updated_at() returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end;
$$;
drop trigger if exists couple_state_touch_updated_at on public.couple_state;
create trigger couple_state_touch_updated_at before update on public.couple_state for each row execute function public.touch_couple_state_updated_at();

-- Select the two IDs from Authentication > Users, then insert just those two:
-- select id,email from auth.users;
-- insert into public.couple_members(user_id) values ('TAHA-USER-UUID'),('ANA-USER-UUID');
