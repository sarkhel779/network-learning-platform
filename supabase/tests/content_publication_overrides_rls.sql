begin;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'content-super-test@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'content-support-test@example.test', '', now(), now());

insert into public.staff_roles (user_id, role)
values
  ('00000000-0000-4000-8000-000000000401', 'super_admin'),
  ('00000000-0000-4000-8000-000000000402', 'support_agent');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000402';
do $$
begin
  begin
    perform public.admin_set_lesson_published('lesson_how_networks_communicate', false);
    raise exception 'a role without the courses permission can unpublish a lesson';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_set_module_lesson_order('module_network_and_device_essentials', array['lesson_a', 'lesson_b']);
    raise exception 'a role without the courses permission can reorder a module';
  exception when insufficient_privilege then null;
  end;
end $$;

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000401';
do $$
begin
  begin
    perform public.admin_set_lesson_published('not-a-lesson-id', true);
    raise exception 'an invalid lesson id was accepted';
  exception when others then
    if sqlerrm <> 'invalid_lesson_id' then raise; end if;
  end;

  if (public.admin_set_lesson_published('lesson_how_networks_communicate', false) ->> 'published') <> 'false' then
    raise exception 'unpublishing a lesson was not applied';
  end if;
  if (public.content_overrides_snapshot() -> 'publications' ->> 'lesson_how_networks_communicate') <> 'false' then
    raise exception 'the publication override is missing from the snapshot';
  end if;

  begin
    perform public.admin_set_module_lesson_order('not-a-module-id', array['lesson_a']);
    raise exception 'an invalid module id was accepted';
  exception when others then
    if sqlerrm <> 'invalid_module_id' then raise; end if;
  end;

  begin
    perform public.admin_set_module_lesson_order('module_network_and_device_essentials', array['lesson_a', 'lesson_a']);
    raise exception 'a duplicate lesson id in an order was accepted';
  exception when others then
    if sqlerrm <> 'duplicate_lesson_in_order' then raise; end if;
  end;

  if (public.admin_set_module_lesson_order('module_network_and_device_essentials', array['lesson_b', 'lesson_a']) -> 'lessonOrder') <> '["lesson_b", "lesson_a"]'::jsonb then
    raise exception 'the reordered module lesson order was not applied';
  end if;
  if (public.content_overrides_snapshot() -> 'orders' -> 'module_network_and_device_essentials') <> '["lesson_b", "lesson_a"]'::jsonb then
    raise exception 'the order override is missing from the snapshot';
  end if;
end $$;

reset role;
do $$
begin
  if (select count(*) from public.admin_audit_events where action = 'lesson_publication_changed') <> 1 then
    raise exception 'publication change did not create an audit event';
  end if;
  if (select count(*) from public.admin_audit_events where action = 'lesson_order_changed') <> 1 then
    raise exception 'order change did not create an audit event';
  end if;
end $$;

reset role;
set local role anon;
set local request.jwt.claim.sub = '';
do $$
declare
  v_snapshot jsonb;
begin
  if exists (
    select 1 from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'admin_%'
      and pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
  ) then
    raise exception 'anonymous role can execute an admin RPC';
  end if;

  v_snapshot := public.content_overrides_snapshot();
  if (v_snapshot -> 'publications' ->> 'lesson_how_networks_communicate') <> 'false' then
    raise exception 'anonymous visitors cannot see the unpublish override';
  end if;
  if (v_snapshot -> 'orders' -> 'module_network_and_device_essentials') <> '["lesson_b", "lesson_a"]'::jsonb then
    raise exception 'anonymous visitors cannot see the reordered module';
  end if;

  begin
    perform count(*) from public.content_publication_overrides;
    raise exception 'anonymous role can directly read publication overrides';
  exception when insufficient_privilege then null;
  end;
  begin
    perform count(*) from public.content_module_order;
    raise exception 'anonymous role can directly read module order overrides';
  exception when insufficient_privilege then null;
  end;
end $$;

rollback;
