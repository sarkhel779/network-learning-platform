begin;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin-test@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'learner-test@example.test', '', now(), now());

insert into public.staff_roles (user_id, role)
values ('00000000-0000-4000-8000-000000000101', 'support_agent');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000102';
do $$
begin
  if public.admin_staff_role() is not null then
    raise exception 'learner unexpectedly has staff role';
  end if;
  if exists (select 1 from public.staff_roles) then
    raise exception 'learner can read staff role rows';
  end if;
  begin
    perform public.admin_account_count();
    raise exception 'learner can count accounts';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_joined_waitlist_count();
    raise exception 'learner can count waitlist members';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_list_learners('', 0, 20);
    raise exception 'learner can list accounts';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_get_learner('00000000-0000-4000-8000-000000000101');
    raise exception 'learner can inspect another account';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_update_learner('00000000-0000-4000-8000-000000000101', 'Wrong', 'beginner', null);
    raise exception 'learner can update another account';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_page_view_count(now() - interval '1 day', now());
    raise exception 'learner can inspect page view totals';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_list_audit(0, 20);
    raise exception 'learner can inspect audit events';
  exception when insufficient_privilege then null;
  end;
end $$;

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000101';
do $$
begin
  if public.admin_staff_role() <> 'support_agent' then
    raise exception 'support role lookup failed';
  end if;
  if (select count(*) from public.staff_roles) <> 1 then
    raise exception 'staff cannot read own role';
  end if;
  if public.admin_account_count() < 2 then
    raise exception 'account count omitted users';
  end if;
  if (public.admin_list_learners('', 0, 1) ->> 'total')::integer < 2 then
    raise exception 'directory count omitted users';
  end if;
  if jsonb_array_length(public.admin_list_learners('', 0, 1) -> 'rows') <> 1 then
    raise exception 'directory pagination failed';
  end if;
  perform public.admin_update_learner('00000000-0000-4000-8000-000000000102', 'Ada', 'beginner', 'Requested help');
  if (public.admin_get_learner('00000000-0000-4000-8000-000000000102') ->> 'displayName') <> 'Ada' then
    raise exception 'authorized profile update was not persisted';
  end if;
  if (select count(*) from public.admin_audit_events) <> 0 then
    raise exception 'staff can directly read audit rows';
  end if;
  if (public.admin_list_audit(0, 20) ->> 'total')::integer <> 1 then
    raise exception 'authorized audit read omitted the profile edit';
  end if;
  perform public.record_page_view('00000000-0000-4000-8000-000000000201', '/pricing');
  perform public.record_page_view('00000000-0000-4000-8000-000000000201', '/pricing');
  perform public.record_page_view('00000000-0000-4000-8000-000000000202', '/labs');
  if public.admin_page_view_count(now() - interval '1 day', now() + interval '1 hour') <> 2 then
    raise exception 'page view retry was double-counted';
  end if;
end $$;

reset role;
do $$
begin
  if (select count(*) from public.admin_audit_events where action = 'learner_profile_updated') <> 1 then
    raise exception 'authorized edit did not create exactly one audit event';
  end if;
  if (select count(*) from public.admin_learner_notes where body = 'Requested help') <> 1 then
    raise exception 'internal note was not appended';
  end if;
end $$;

reset role;
set local role anon;
set local request.jwt.claim.sub = '';
do $$
begin
  if public.admin_staff_role() is not null then
    raise exception 'anonymous role lookup returned staff';
  end if;
end $$;

rollback;
