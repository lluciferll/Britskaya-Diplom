-- Master Forge: таблица кампаний + изоляция данных по пользователю (RLS).
-- Выполнить один раз в Supabase → SQL Editor → Run.
--
-- Требуется включённый Supabase Auth (email + password).

create table if not exists public.campaigns (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists campaigns_user_id_idx on public.campaigns (user_id);

alter table public.campaigns enable row level security;

drop policy if exists "campaigns_select_own" on public.campaigns;
drop policy if exists "campaigns_insert_own" on public.campaigns;
drop policy if exists "campaigns_update_own" on public.campaigns;
drop policy if exists "campaigns_delete_own" on public.campaigns;

create policy "campaigns_select_own"
  on public.campaigns for select
  using (auth.uid() = user_id);

create policy "campaigns_insert_own"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

create policy "campaigns_update_own"
  on public.campaigns for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "campaigns_delete_own"
  on public.campaigns for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.campaigns to authenticated;
grant all on public.campaigns to service_role;
