begin;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'flags-super-test@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000702', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'flags-support-test@example.test', '', now(), now());

insert into public.staff_roles (user_id, role)
values
  ('00000000-0000-4000-8000-000000000701', 'super_admin'),
  ('00000000-0000-4000-8000-000000000702', 'support_agent');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000702';
do $$
begin
  begin
    perform public.admin_list_feature_flags();
    raise exception 'a role without the settings permission can list feature flags';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_upsert_feature_flag('new_lesson_ui', true, 'Testing');
    raise exception 'a role without the settings permission can create a feature flag';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_delete_feature_flag('new_lesson_ui');
    raise exception 'a role without the settings permission can delete a feature flag';
  exception when insufficient_privilege then null;
  end;
end $$;

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000701';
do $$
begin
  if public.admin_list_feature_flags() <> '[]'::jsonb then
    raise exception 'a fresh install should have no feature flags';
  end if;

  begin
    perform public.admin_upsert_feature_flag('Invalid-Key', true, null);
    raise exception 'an invalid flag key was accepted';
  exception when others then
    if sqlerrm <> 'invalid_flag_key' then raise; end if;
  end;

  begin
    perform public.admin_upsert_feature_flag('too_long_description', true, repeat('x', 201));
    raise exception 'an over-length description was accepted';
  exception when others then
    if sqlerrm <> 'invalid_flag_description' then raise; end if;
  end;

  if public.admin_upsert_feature_flag('new_lesson_ui', true, 'Testing new lesson UI') <> jsonb_build_object(
    'key', 'new_lesson_ui', 'enabled', true, 'description', 'Testing new lesson UI'
  ) then
    raise exception 'creating a feature flag returned an unexpected shape';
  end if;
  if jsonb_array_length(public.admin_list_feature_flags()) <> 1 then
    raise exception 'the created flag is missing from the list';
  end if;
  if (public.feature_flags_snapshot() -> 'new_lesson_ui')::boolean <> true then
    raise exception 'the public snapshot does not reflect the created flag';
  end if;

  -- Upserting the same key again updates in place rather than duplicating.
  if public.admin_upsert_feature_flag('new_lesson_ui', false, 'Now disabled') <> jsonb_build_object(
    'key', 'new_lesson_ui', 'enabled', false, 'description', 'Now disabled'
  ) then
    raise exception 'updating a feature flag returned an unexpected shape';
  end if;
  if jsonb_array_length(public.admin_list_feature_flags()) <> 1 then
    raise exception 'updating a flag created a duplicate instead of updating in place';
  end if;
  if (public.feature_flags_snapshot() -> 'new_lesson_ui')::boolean <> false then
    raise exception 'the public snapshot did not pick up the update';
  end if;

  begin
    perform public.admin_delete_feature_flag('does_not_exist');
    raise exception 'deleting a nonexistent flag succeeded';
  exception when others then
    if sqlerrm <> 'feature_flag_not_found' then raise; end if;
  end;

  perform public.admin_delete_feature_flag('new_lesson_ui');
  if public.admin_list_feature_flags() <> '[]'::jsonb then
    raise exception 'the deleted flag still appears in the list';
  end if;
end $$;

reset role;
do $$
begin
  if (select count(*) from public.admin_audit_events where action = 'feature_flag_created') <> 1 then
    raise exception 'creating a flag did not create exactly one audit event';
  end if;
  if (select count(*) from public.admin_audit_events where action = 'feature_flag_updated') <> 1 then
    raise exception 'updating a flag did not create exactly one audit event';
  end if;
  if (select count(*) from public.admin_audit_events where action = 'feature_flag_deleted') <> 1 then
    raise exception 'deleting a flag did not create exactly one audit event';
  end if;
end $$;

reset role;
set local role anon;
set local request.jwt.claim.sub = '';
do $$
begin
  if exists (
    select 1 from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'admin_%'
      and pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
  ) then
    raise exception 'anonymous role can execute an admin RPC';
  end if;
  begin
    perform count(*) from public.feature_flags;
    raise exception 'anonymous role can directly read feature flags';
  exception when insufficient_privilege then null;
  end;
  if public.feature_flags_snapshot() <> '{}'::jsonb then
    raise exception 'the public snapshot is not readable by an anonymous visitor';
  end if;
end $$;

rollback;
