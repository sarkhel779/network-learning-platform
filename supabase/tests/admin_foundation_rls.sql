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
