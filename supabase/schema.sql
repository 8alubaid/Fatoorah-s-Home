-- Fatoorah — database schema. Run this in Supabase → SQL Editor → New query.
-- Stores each user's bank connection (which Lean customer/entity is theirs).
-- The financial data itself is NOT stored here — it's re-fetched from Lean.

create table if not exists public.bank_connections (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  lean_customer_id text,
  lean_entity_id   text,
  bank_name        text,
  updated_at       timestamptz not null default now()
);

-- Row Level Security: each user can only see/change their own row.
alter table public.bank_connections enable row level security;

drop policy if exists "own connection - select" on public.bank_connections;
create policy "own connection - select" on public.bank_connections
  for select using (auth.uid() = user_id);

drop policy if exists "own connection - insert" on public.bank_connections;
create policy "own connection - insert" on public.bank_connections
  for insert with check (auth.uid() = user_id);

drop policy if exists "own connection - update" on public.bank_connections;
create policy "own connection - update" on public.bank_connections
  for update using (auth.uid() = user_id);

drop policy if exists "own connection - delete" on public.bank_connections;
create policy "own connection - delete" on public.bank_connections
  for delete using (auth.uid() = user_id);
