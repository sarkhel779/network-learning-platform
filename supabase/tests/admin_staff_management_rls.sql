begin;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'super-test@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'support-test@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'newstaff-test@example.test', '', now(), now());

insert into public.staff_roles (user_id, role)
values
  ('00000000-0000-4000-8000-000000000301', 'super_admin'),
  ('00000000-0000-4000-8000-000000000302', 'support_agent');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000302';
do $$
begin
  begin
    perform public.admin_list_staff();
    raise exception 'non-super-admin can list staff';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_assign_staff_role('newstaff-test@example.test', 'content_editor');
    raise exception 'non-super-admin can assign a staff role';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_revoke_staff_role('00000000-0000-4000-8000-000000000301');
    raise exception 'non-super-admin can revoke a staff role';
  exception when insufficient_privilege then null;
  end;
end $$;

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000301';
do $$
begin
  if jsonb_array_length(public.admin_list_staff()) <> 2 then
    raise exception 'staff list omitted an existing member';
  end if;

  begin
    perform public.admin_assign_staff_role('newstaff-test@example.test', 'not_a_role');
    raise exception 'an invalid role was accepted';
  exception when others then
    if sqlerrm <> 'invalid_staff_role' then raise; end if;
  end;

  begin
    perform public.admin_assign_staff_role('nobody@example.test', 'support_agent');
    raise exception 'assigning an unknown email succeeded';
  exception when others then
    if sqlerrm <> 'staff_account_not_found' then raise; end if;
  end;

  if (public.admin_assign_staff_role('newstaff-test@example.test', 'content_editor') ->> 'role') <> 'content_editor' then
    raise exception 'new staff assignment was not applied';
  end if;
  if jsonb_array_length(public.admin_list_staff()) <> 3 then
    raise exception 'newly assigned staff member is missing from the list';
  end if;

  if (public.admin_assign_staff_role('newstaff-test@example.test', 'finance') ->> 'role') <> 'finance' then
    raise exception 'role change for an existing staff member was not applied';
  end if;
  if jsonb_array_length(public.admin_list_staff()) <> 3 then
    raise exception 'changing a role should not create a duplicate staff row';
  end if;

  begin
    perform public.admin_revoke_staff_role('00000000-0000-4000-8000-000000000301');
    raise exception 'super admin was able to revoke their own access';
  exception when others then
    if sqlerrm <> 'cannot_revoke_self' then raise; end if;
  end;

  perform public.admin_revoke_staff_role('00000000-0000-4000-8000-000000000303');
  if jsonb_array_length(public.admin_list_staff()) <> 2 then
    raise exception 'revoked staff member still appears in the list';
  end if;
end $$;

reset role;
do $$
begin
  if (select count(*) from public.admin_audit_events where action = 'staff_role_assigned') <> 2 then
    raise exception 'staff assignments did not create audit events';
  end if;
  if (select count(*) from public.admin_audit_events where action = 'staff_role_revoked') <> 1 then
    raise exception 'staff revocation did not create an audit event';
  end if;
end $$;

rollback;
