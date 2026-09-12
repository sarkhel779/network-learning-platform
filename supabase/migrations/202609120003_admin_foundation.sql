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

revoke all on function public.admin_staff_role() from public, anon, authenticated;
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

revoke all on function public.admin_account_count() from public, anon, authenticated;
revoke all on function public.admin_joined_waitlist_count() from public, anon, authenticated;
revoke all on function public.admin_list_learners(text, integer, integer) from public, anon, authenticated;
grant execute on function public.admin_account_count() to authenticated;
grant execute on function public.admin_joined_waitlist_count() to authenticated;
grant execute on function public.admin_list_learners(text, integer, integer) to authenticated;

create table public.admin_learner_notes (
  id bigint generated always as identity primary key,
  target_id uuid not null references auth.users(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table public.admin_audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users(id),
  target_id uuid references auth.users(id),
  action text not null,
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_learner_notes enable row level security;
alter table public.admin_audit_events enable row level security;
revoke all on public.admin_learner_notes from anon, authenticated;
revoke all on public.admin_audit_events from anon, authenticated;

create function public.admin_get_learner(p_target_id uuid)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_role text := public.admin_staff_role();
  v_result jsonb;
begin
  if v_role not in ('super_admin', 'support_agent') or v_role is null then
    raise insufficient_privilege;
  end if;
  select jsonb_build_object(
    'id', u.id, 'email', u.email, 'createdAt', u.created_at,
    'displayName', p.display_name, 'learningLevel', p.learning_level,
    'waitlistStatus', w.status,
    'notes', coalesce((select jsonb_agg(jsonb_build_object('id', n.id, 'body', n.body, 'createdAt', n.created_at, 'authorId', n.author_id) order by n.created_at desc)
      from public.admin_learner_notes n where n.target_id = u.id), '[]'::jsonb)
  ) into v_result
  from auth.users u
  left join public.learner_profiles p on p.id = u.id
  left join public.pro_waitlist_entries w on w.user_id = u.id
  where u.id = p_target_id;
  return v_result;
end;
$$;

create function public.admin_update_learner(
  p_target_id uuid,
  p_display_name text,
  p_learning_level public.learning_level,
  p_note text default null
)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role text := public.admin_staff_role();
  v_before jsonb;
  v_after jsonb;
  v_note text := nullif(btrim(p_note), '');
begin
  if v_role not in ('super_admin', 'support_agent') or v_role is null then
    raise insufficient_privilege;
  end if;
  if p_target_id is null or not exists (select 1 from auth.users where id = p_target_id) then
    raise exception 'learner_not_found';
  end if;
  if char_length(p_display_name) > 80 or char_length(v_note) > 1000 then
    raise exception 'invalid_learner_edit';
  end if;
  if exists (select 1 from public.staff_roles where user_id = p_target_id) then
    raise exception 'staff_profile_edit_not_supported';
  end if;

  select jsonb_build_object('displayName', display_name, 'learningLevel', learning_level)
  into v_before from public.learner_profiles where id = p_target_id for update;

  insert into public.learner_profiles(id, display_name, learning_level)
  values (p_target_id, nullif(btrim(p_display_name), ''), p_learning_level)
  on conflict (id) do update set display_name = excluded.display_name, learning_level = excluded.learning_level;

  select jsonb_build_object('displayName', display_name, 'learningLevel', learning_level)
  into v_after from public.learner_profiles where id = p_target_id;

  if v_before is distinct from v_after or v_note is not null then
    if v_note is not null then
      insert into public.admin_learner_notes(target_id, author_id, body)
      values (p_target_id, v_actor, v_note);
    end if;
    insert into public.admin_audit_events(actor_id, target_id, action, before_value, after_value)
    values (v_actor, p_target_id, 'learner_profile_updated', v_before,
      v_after || case when v_note is null then '{}'::jsonb else '{"noteAdded":true}'::jsonb end);
  end if;

  return public.admin_get_learner(p_target_id);
end;
$$;

revoke all on function public.admin_get_learner(uuid) from public, anon, authenticated;
revoke all on function public.admin_update_learner(uuid, text, public.learning_level, text) from public, anon, authenticated;
grant execute on function public.admin_get_learner(uuid) to authenticated;
grant execute on function public.admin_update_learner(uuid, text, public.learning_level, text) to authenticated;

create function public.admin_list_audit(p_offset integer default 0, p_limit integer default 20)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_role text := public.admin_staff_role();
  v_total bigint;
  v_rows jsonb;
begin
  if v_role not in ('super_admin', 'support_agent') or v_role is null then
    raise insufficient_privilege;
  end if;
  select count(*) into v_total from public.admin_audit_events;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', e.id, 'actorId', e.actor_id, 'targetId', e.target_id,
    'action', e.action, 'beforeValue', e.before_value,
    'afterValue', e.after_value, 'createdAt', e.created_at
  ) order by e.created_at desc), '[]'::jsonb)
  into v_rows
  from (
    select * from public.admin_audit_events
    order by created_at desc
    offset greatest(coalesce(p_offset, 0), 0)
    limit least(greatest(coalesce(p_limit, 20), 1), 50)
  ) e;
  return jsonb_build_object('total', v_total, 'rows', v_rows);
end;
$$;

revoke all on function public.admin_list_audit(integer, integer) from public, anon, authenticated;
grant execute on function public.admin_list_audit(integer, integer) to authenticated;

create table public.page_views (
  event_id uuid primary key,
  path text not null check (char_length(path) between 1 and 200),
  created_at timestamptz not null default now()
);

create index page_views_created_at_idx on public.page_views(created_at);
alter table public.page_views enable row level security;
revoke all on public.page_views from anon, authenticated;

create function public.record_page_view(p_event_id uuid, p_path text)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if p_event_id is null or p_path is null or char_length(p_path) > 200 or
     p_path !~ '^(/|/(about|pricing|labs|contact|privacy|terms|sign-in)(/[a-z0-9-]+)*|/(paths|learn)/[a-z0-9-]+(/[a-z0-9-]+)*)$' then
    raise exception 'invalid_page_view';
  end if;
  insert into public.page_views(event_id, path)
  values (p_event_id, p_path)
  on conflict (event_id) do nothing;
end;
$$;

create function public.admin_page_view_count(p_from timestamptz, p_to timestamptz)
returns bigint
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if public.admin_staff_role() is null then
    raise insufficient_privilege;
  end if;
  if p_from is null or p_to is null or p_to <= p_from or p_to > now() + interval '1 day' then
    raise exception 'invalid_page_view_range';
  end if;
  return (select count(*) from public.page_views where created_at >= p_from and created_at < p_to);
end;
$$;

revoke all on function public.record_page_view(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_page_view_count(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.record_page_view(uuid, text) to anon, authenticated;
grant execute on function public.admin_page_view_count(timestamptz, timestamptz) to authenticated;

commit;
