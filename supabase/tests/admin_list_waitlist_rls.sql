begin;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'waitlist-support-test@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000702', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'waitlist-finance-test@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000703', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'waitlist-joined-test@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000704', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'waitlist-unsubscribed-test@example.test', '', now(), now());

insert into public.staff_roles (user_id, role)
values
  ('00000000-0000-4000-8000-000000000701', 'support_agent'),
  ('00000000-0000-4000-8000-000000000702', 'finance');

insert into public.pro_waitlist_entries (user_id, email, status, consent_version, consented_at, unsubscribed_at)
values
  ('00000000-0000-4000-8000-000000000703', 'waitlist-joined-test@example.test', 'joined', 'test-v1', now(), null),
  ('00000000-0000-4000-8000-000000000704', 'waitlist-unsubscribed-test@example.test', 'unsubscribed', 'test-v1', now(), now());

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000702';
do $$
begin
  begin
    perform public.admin_list_waitlist(0, 20);
    raise exception 'a role without the users_read permission can list the waitlist';
  exception when insufficient_privilege then null;
  end;
end $$;

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000701';
do $$
begin
  if (public.admin_list_waitlist(0, 20) ->> 'total')::integer <> 1 then
    raise exception 'the waitlist total should only count joined members';
  end if;
  if jsonb_array_length(public.admin_list_waitlist(0, 20) -> 'rows') <> 1 then
    raise exception 'an unsubscribed member leaked into the waitlist listing';
  end if;
  if (public.admin_list_waitlist(0, 20) -> 'rows' -> 0 ->> 'email') <> 'waitlist-joined-test@example.test' then
    raise exception 'the joined member is missing from the listing';
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
end $$;

rollback;
