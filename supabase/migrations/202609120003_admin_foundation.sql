begin;

create table public.staff_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin', 'content_editor', 'support_agent', 'finance')),
  assigned_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.staff_roles enable row level security;
revoke all on public.staff_roles from anon, authenticated;
grant select on public.staff_roles to authenticated;

create policy "staff read own role"
on public.staff_roles for select to authenticated
using ((select auth.uid()) = user_id);

create function public.admin_staff_role()
returns text
language sql stable security definer
set search_path = ''
as $$
  select role from public.staff_roles where user_id = (select auth.uid());
$$;

revoke all on function public.admin_staff_role() from public;
grant execute on function public.admin_staff_role() to authenticated;

commit;
