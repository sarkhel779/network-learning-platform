begin;

create table public.feature_flags (
  key text primary key check (key ~ '^[a-z][a-z0-9_]{1,49}$'),
  enabled boolean not null default false,
  description text check (description is null or char_length(description) <= 200),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.feature_flags enable row level security;
revoke all on public.feature_flags from anon, authenticated;

-- Public-safe: any part of the app may need to check a flag's value, so this
-- RPC (deliberately not prefixed admin_) is readable without a staff role.
create function public.feature_flags_snapshot()
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select coalesce(jsonb_object_agg(key, enabled), '{}'::jsonb) from public.feature_flags;
$$;

revoke all on function public.feature_flags_snapshot() from public;
grant execute on function public.feature_flags_snapshot() to anon, authenticated;

create function public.admin_list_feature_flags()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if public.admin_staff_role() is distinct from 'super_admin' then
    raise insufficient_privilege;
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'key', key, 'enabled', enabled, 'description', description, 'updatedAt', updated_at
    ) order by key)
    from public.feature_flags
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.admin_list_feature_flags() from public, anon, authenticated;
grant execute on function public.admin_list_feature_flags() to authenticated;

create function public.admin_upsert_feature_flag(p_key text, p_enabled boolean, p_description text default null)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role text := public.admin_staff_role();
  v_description text := nullif(btrim(p_description), '');
  v_existed boolean;
  v_before jsonb;
  v_after jsonb;
begin
  if v_role is distinct from 'super_admin' then
    raise insufficient_privilege;
  end if;
  if p_key is null or p_key !~ '^[a-z][a-z0-9_]{1,49}$' then
    raise exception 'invalid_flag_key';
  end if;
  if p_enabled is null then
    raise exception 'invalid_flag_state';
  end if;
  if v_description is not null and char_length(v_description) > 200 then
    raise exception 'invalid_flag_description';
  end if;

  select true, jsonb_build_object('enabled', enabled, 'description', description)
  into v_existed, v_before
  from public.feature_flags where key = p_key;

  insert into public.feature_flags(key, enabled, description, updated_by)
  values (p_key, p_enabled, v_description, v_actor)
  on conflict (key) do update
    set enabled = excluded.enabled, description = excluded.description,
        updated_by = excluded.updated_by, updated_at = now();

  v_after := jsonb_build_object('key', p_key, 'enabled', p_enabled, 'description', v_description);

  insert into public.admin_audit_events(actor_id, target_id, action, before_value, after_value)
  values (
    v_actor, null, case when coalesce(v_existed, false) then 'feature_flag_updated' else 'feature_flag_created' end,
    coalesce(v_before, jsonb_build_object('key', p_key)), v_after
  );

  return v_after;
end;
$$;

revoke all on function public.admin_upsert_feature_flag(text, boolean, text) from public, anon, authenticated;
grant execute on function public.admin_upsert_feature_flag(text, boolean, text) to authenticated;

create function public.admin_delete_feature_flag(p_key text)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role text := public.admin_staff_role();
  v_before jsonb;
begin
  if v_role is distinct from 'super_admin' then
    raise insufficient_privilege;
  end if;

  select jsonb_build_object('enabled', enabled, 'description', description) into v_before
  from public.feature_flags where key = p_key;
  if v_before is null then
    raise exception 'feature_flag_not_found';
  end if;

  delete from public.feature_flags where key = p_key;

  insert into public.admin_audit_events(actor_id, target_id, action, before_value, after_value)
  values (v_actor, null, 'feature_flag_deleted', v_before, jsonb_build_object('key', p_key));
end;
$$;

revoke all on function public.admin_delete_feature_flag(text) from public, anon, authenticated;
grant execute on function public.admin_delete_feature_flag(text) to authenticated;

commit;
