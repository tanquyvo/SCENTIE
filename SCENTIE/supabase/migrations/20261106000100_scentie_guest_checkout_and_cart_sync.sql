-- SCENTIE Phase 3: guest checkout + account cart synchronization
begin;

-- Guest orders have no auth user; signed-in orders retain their owner.
alter table public.orders alter column user_id drop not null;
alter table public.orders drop constraint if exists orders_user_id_fkey;
alter table public.orders
  add constraint orders_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;

-- One server-side cart snapshot per signed-in customer.
create table if not exists public.user_carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint user_carts_items_array check (jsonb_typeof(items) = 'array')
);

alter table public.user_carts enable row level security;
revoke all on table public.user_carts from public, anon, authenticated;
grant select, insert, update, delete on public.user_carts to authenticated;
drop policy if exists user_carts_select_own on public.user_carts;
create policy user_carts_select_own on public.user_carts
for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists user_carts_insert_own on public.user_carts;
create policy user_carts_insert_own on public.user_carts
for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists user_carts_update_own on public.user_carts;
create policy user_carts_update_own on public.user_carts
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
drop policy if exists user_carts_delete_own on public.user_carts;
create policy user_carts_delete_own on public.user_carts
for delete to authenticated using ((select auth.uid()) = user_id);

commit;
