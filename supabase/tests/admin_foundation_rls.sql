begin;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin-test@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'learner-test@example.test', '', now(), now());

insert into public.staff_roles (user_id, role)
values ('00000000-0000-4000-8000-000000000101', 'support_agent');

insert into public.page_view_ingest_config (singleton, token_hash)
values (true, pg_catalog.md5('ci-only-ingest-token-with-32-chars-minimum'));

insert into public.pro_waitlist_entries (user_id, email, status, consent_version, consented_at, unsubscribed_at)
values
  ('00000000-0000-4000-8000-000000000101', 'admin-test@example.test', 'unsubscribed', 'test-v1', now(), now()),
  ('00000000-0000-4000-8000-000000000102', 'learner-test@example.test', 'joined', 'test-v1', now(), null);

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
    perform public.admin_unique_visitor_count(now() - interval '1 day', now());
    raise exception 'learner can inspect unique visitor totals';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_list_audit(0, 20);
    raise exception 'learner can inspect audit events';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.admin_audit_events(actor_id, action)
    values ('00000000-0000-4000-8000-000000000102', 'forged');
    raise exception 'learner can append audit events directly';
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
  if public.admin_joined_waitlist_count() <> 1 then
    raise exception 'waitlist count included an unsubscribed member';
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
  begin
    perform count(*) from public.admin_audit_events;
    raise exception 'staff can directly read audit rows';
  exception when insufficient_privilege then null;
  end;
  begin
    perform count(*) from public.admin_learner_notes;
    raise exception 'staff can directly read internal notes';
  exception when insufficient_privilege then null;
  end;
  if (public.admin_list_audit(0, 20) ->> 'total')::integer <> 1 then
    raise exception 'authorized audit read omitted the profile edit';
  end if;
  begin
    perform count(*) from public.page_views;
    raise exception 'staff can directly read raw page views';
  exception when insufficient_privilege then null;
  end;
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
declare
  i integer;
begin
  if exists (
    select 1 from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'admin_%'
      and pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
  ) then
    raise exception 'anonymous role can execute an admin RPC';
  end if;
  if pg_catalog.to_regprocedure('public.record_page_view(uuid,text)') is not null then
    raise exception 'anonymous role can execute the unprotected page-view recorder';
  end if;
  begin
    perform count(*) from public.page_view_ingest_config;
    raise exception 'anonymous role can read the ingest token hash';
  exception when insufficient_privilege then null;
  end;
  begin
    perform count(*) from public.page_view_ingest_windows;
    raise exception 'anonymous role can read ingest rate windows';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.record_page_view('00000000-0000-4000-8000-000000000201', '/pricing', 'wrong-token', '00000000-0000-4000-8000-000000000301');
    raise exception 'invalid ingest token was accepted';
  exception when insufficient_privilege then null;
  end;
  if public.record_page_view('00000000-0000-4000-8000-000000000201', '/pricing', 'ci-only-ingest-token-with-32-chars-minimum', '00000000-0000-4000-8000-000000000301') <> 'recorded' then
    raise exception 'authorized view was not recorded';
  end if;
  if public.record_page_view('00000000-0000-4000-8000-000000000201', '/pricing', 'ci-only-ingest-token-with-32-chars-minimum', '00000000-0000-4000-8000-000000000301') <> 'duplicate' then
    raise exception 'retry was not deduplicated';
  end if;
  if public.record_page_view('00000000-0000-4000-8000-000000000205', '/pricing', 'ci-only-ingest-token-with-32-chars-minimum', '00000000-0000-4000-8000-000000000301') <> 'recorded' then
    raise exception 'a repeat visit from the same visitor was not recorded';
  end if;
  if public.record_page_view('00000000-0000-4000-8000-000000000206', '/pricing', 'ci-only-ingest-token-with-32-chars-minimum', '00000000-0000-4000-8000-000000000302') <> 'recorded' then
    raise exception 'a new visitor was not recorded';
  end if;
  for i in 1..117 loop
    if public.record_page_view(pg_catalog.md5(i::text)::uuid, '/labs', 'ci-only-ingest-token-with-32-chars-minimum', '00000000-0000-4000-8000-000000000303') <> 'recorded' then
      raise exception 'rate window closed before 120 views';
    end if;
  end loop;
  if public.record_page_view('00000000-0000-4000-8000-000000000202', '/labs', 'ci-only-ingest-token-with-32-chars-minimum', '00000000-0000-4000-8000-000000000304') <> 'rate_limited' then
    raise exception 'rate window did not cap ingestion';
  end if;
  begin
    perform public.admin_staff_role();
    raise exception 'anonymous role lookup was unexpectedly executable';
  exception
    when insufficient_privilege then null;
  end;
end $$;

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000101';
do $$
declare
  v_unique bigint;
begin
  -- now() is frozen at transaction start in Postgres, identical to the just-inserted
  -- rows' created_at default; nudge the exclusive upper bound past it to include them.
  v_unique := public.admin_unique_visitor_count(now() - interval '1 day', now() + interval '1 minute');
  if v_unique <> 3 then
    raise exception 'unique visitor count did not deduplicate repeat visits, got %', v_unique;
  end if;
  if public.admin_page_view_count(now() - interval '1 day', now() + interval '1 minute') <= v_unique then
    raise exception 'raw page view count should exceed the deduplicated visitor count';
  end if;
end $$;

rollback;
