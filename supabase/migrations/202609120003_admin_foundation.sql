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

create function public.admin_account_count()
returns bigint
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if public.admin_staff_role() is null then
    raise insufficient_privilege;
  end if;
  return (select count(*) from auth.users);
end;
$$;

create function public.admin_joined_waitlist_count()
returns bigint
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if public.admin_staff_role() is null then
    raise insufficient_privilege;
  end if;
  return (select count(*) from public.pro_waitlist_entries where status = 'joined');
end;
$$;

create function public.admin_list_learners(
  p_query text default '',
  p_offset integer default 0,
  p_limit integer default 20
)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_role text := public.admin_staff_role();
  v_query text := left(btrim(coalesce(p_query, '')), 100);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 50);
  v_total bigint;
  v_rows jsonb;
begin
  if v_role not in ('super_admin', 'support_agent') or v_role is null then
    raise insufficient_privilege;
  end if;

  select count(*) into v_total
  from auth.users u
  left join public.learner_profiles p on p.id = u.id
  where v_query = '' or u.email ilike '%' || v_query || '%'
    or p.display_name ilike '%' || v_query || '%';

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'displayName', p.display_name,
    'learningLevel', p.learning_level,
    'createdAt', u.created_at,
    'waitlistStatus', w.status
  ) order by u.created_at desc), '[]'::jsonb)
  into v_rows
  from (
    select u.id, u.email, u.created_at
    from auth.users u
    left join public.learner_profiles p on p.id = u.id
    where v_query = '' or u.email ilike '%' || v_query || '%'
      or p.display_name ilike '%' || v_query || '%'
    order by u.created_at desc
    offset v_offset limit v_limit
  ) u
  left join public.learner_profiles p on p.id = u.id
  left join public.pro_waitlist_entries w on w.user_id = u.id;

  return jsonb_build_object('total', v_total, 'rows', v_rows);
end;
$$;

revoke all on function public.admin_account_count() from public;
revoke all on function public.admin_joined_waitlist_count() from public;
revoke all on function public.admin_list_learners(text, integer, integer) from public;
grant execute on function public.admin_account_count() to authenticated;
grant execute on function public.admin_joined_waitlist_count() to authenticated;
grant execute on function public.admin_list_learners(text, integer, integer) to authenticated;

commit;
