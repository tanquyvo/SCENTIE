-- SCENTIE Admin Control Center: admin-only data access and management RPCs.
begin;

-- Admins may read all customer profiles; customers retain their own profile access.
drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles
for select to authenticated using ((select private.is_admin()));

-- Admin catalogue management. Public storefront can still read active products only.
drop policy if exists products_admin_select_all on public.products;
create policy products_admin_select_all on public.products
for select to authenticated using ((select private.is_admin()));
drop policy if exists products_admin_insert on public.products;
create policy products_admin_insert on public.products
for insert to authenticated with check ((select private.is_admin()));
drop policy if exists products_admin_update on public.products;
create policy products_admin_update on public.products
for update to authenticated using ((select private.is_admin()))
with check ((select private.is_admin()));
drop policy if exists products_admin_delete on public.products;
create policy products_admin_delete on public.products
for delete to authenticated using ((select private.is_admin()));

grant insert, update, delete on public.products to authenticated;
grant select on public.profiles to authenticated;

-- Admin directory: expose only the fields needed by the admin UI.
create or replace function public.admin_list_admins()
returns table(user_id uuid, email text, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Admin access required';
  end if;
  return query
    select a.user_id, u.email::text, a.created_at
    from private.admin_users a
    left join auth.users u on u.id = a.user_id
    order by a.created_at asc;
end;
$$;

create or replace function public.admin_grant_admin(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Admin access required';
  end if;
  if not exists (select 1 from auth.users where id = target_user_id) then
    raise exception 'Auth user does not exist';
  end if;
  insert into private.admin_users(user_id)
  values (target_user_id)
  on conflict (user_id) do nothing;
end;
$$;

create or replace function public.admin_revoke_admin(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  admin_count integer;
begin
  if not private.is_admin() then
    raise exception 'Admin access required';
  end if;
  if target_user_id = auth.uid() then
    raise exception 'You cannot revoke your own admin access';
  end if;
  select count(*) into admin_count from private.admin_users;
  if admin_count <= 1 then
    raise exception 'Cannot remove the last administrator';
  end if;
  delete from private.admin_users where user_id = target_user_id;
end;
$$;

revoke all on function public.admin_list_admins() from public, anon;
revoke all on function public.admin_grant_admin(uuid) from public, anon;
revoke all on function public.admin_revoke_admin(uuid) from public, anon;
grant execute on function public.admin_list_admins() to authenticated;
grant execute on function public.admin_grant_admin(uuid) to authenticated;
grant execute on function public.admin_revoke_admin(uuid) to authenticated;

commit;
