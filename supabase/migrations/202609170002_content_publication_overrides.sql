begin;

create table public.content_publication_overrides (
  lesson_id text primary key check (lesson_id ~ '^lesson_[a-z0-9_]+$'),
  published boolean not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table public.content_module_order (
  module_id text primary key check (module_id ~ '^module_[a-z0-9_]+$'),
  lesson_order jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.content_publication_overrides enable row level security;
alter table public.content_module_order enable row level security;
revoke all on public.content_publication_overrides from anon, authenticated;
revoke all on public.content_module_order from anon, authenticated;

-- Public-safe: every visitor must see accurate publish/order state, so this
-- RPC (deliberately not prefixed admin_) is readable without a staff role.
create function public.content_overrides_snapshot()
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'publications', coalesce((select jsonb_object_agg(lesson_id, published) from public.content_publication_overrides), '{}'::jsonb),
    'orders', coalesce((select jsonb_object_agg(module_id, lesson_order) from public.content_module_order), '{}'::jsonb)
  );
$$;

revoke all on function public.content_overrides_snapshot() from public;
grant execute on function public.content_overrides_snapshot() to anon, authenticated;

create function public.admin_set_lesson_published(p_lesson_id text, p_published boolean)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role text := public.admin_staff_role();
  v_before jsonb;
begin
  if v_role not in ('super_admin', 'content_editor') or v_role is null then
    raise insufficient_privilege;
  end if;
  if p_lesson_id is null or p_lesson_id !~ '^lesson_[a-z0-9_]+$' then
    raise exception 'invalid_lesson_id';
  end if;
  if p_published is null then
    raise exception 'invalid_published_flag';
  end if;

  select jsonb_build_object('published', published) into v_before
  from public.content_publication_overrides where lesson_id = p_lesson_id;

  insert into public.content_publication_overrides(lesson_id, published, updated_by)
  values (p_lesson_id, p_published, v_actor)
  on conflict (lesson_id) do update
    set published = excluded.published, updated_by = excluded.updated_by, updated_at = now();

  insert into public.admin_audit_events(actor_id, target_id, action, before_value, after_value)
  values (
    v_actor, null, 'lesson_publication_changed',
    coalesce(v_before, jsonb_build_object('lessonId', p_lesson_id)),
    jsonb_build_object('lessonId', p_lesson_id, 'published', p_published)
  );

  return jsonb_build_object('lessonId', p_lesson_id, 'published', p_published);
end;
$$;

revoke all on function public.admin_set_lesson_published(text, boolean) from public, anon, authenticated;
grant execute on function public.admin_set_lesson_published(text, boolean) to authenticated;

create function public.admin_set_module_lesson_order(p_module_id text, p_lesson_ids text[])
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role text := public.admin_staff_role();
  v_before jsonb;
  v_after jsonb;
begin
  if v_role not in ('super_admin', 'content_editor') or v_role is null then
    raise insufficient_privilege;
  end if;
  if p_module_id is null or p_module_id !~ '^module_[a-z0-9_]+$' then
    raise exception 'invalid_module_id';
  end if;
  if p_lesson_ids is null or array_length(p_lesson_ids, 1) is null or array_length(p_lesson_ids, 1) < 1 then
    raise exception 'invalid_lesson_order';
  end if;
  if exists (select 1 from unnest(p_lesson_ids) id where id !~ '^lesson_[a-z0-9_]+$') then
    raise exception 'invalid_lesson_order';
  end if;
  if (select count(distinct id) from unnest(p_lesson_ids) id) <> array_length(p_lesson_ids, 1) then
    raise exception 'duplicate_lesson_in_order';
  end if;

  select jsonb_build_object('lessonOrder', lesson_order) into v_before
  from public.content_module_order where module_id = p_module_id;

  v_after := to_jsonb(p_lesson_ids);

  insert into public.content_module_order(module_id, lesson_order, updated_by)
  values (p_module_id, v_after, v_actor)
  on conflict (module_id) do update
    set lesson_order = excluded.lesson_order, updated_by = excluded.updated_by, updated_at = now();

  insert into public.admin_audit_events(actor_id, target_id, action, before_value, after_value)
  values (
    v_actor, null, 'lesson_order_changed',
    coalesce(v_before, jsonb_build_object('moduleId', p_module_id)),
    jsonb_build_object('moduleId', p_module_id, 'lessonOrder', v_after)
  );

  return jsonb_build_object('moduleId', p_module_id, 'lessonOrder', v_after);
end;
$$;

revoke all on function public.admin_set_module_lesson_order(text, text[]) from public, anon, authenticated;
grant execute on function public.admin_set_module_lesson_order(text, text[]) to authenticated;

commit;
