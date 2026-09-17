begin;

create function public.admin_list_staff()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_role text := public.admin_staff_role();
begin
  if v_role is distinct from 'super_admin' then
    raise insufficient_privilege;
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'userId', s.user_id,
      'email', u.email,
      'role', s.role,
      'assignedBy', s.assigned_by,
      'createdAt', s.created_at
    ) order by s.created_at asc)
    from public.staff_roles s
    join auth.users u on u.id = s.user_id
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.admin_list_staff() from public, anon, authenticated;
grant execute on function public.admin_list_staff() to authenticated;

create function public.admin_assign_staff_role(p_email text, p_role text)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role text := public.admin_staff_role();
  v_target_id uuid;
  v_before jsonb;
  v_after jsonb;
begin
  if v_role is distinct from 'super_admin' then
    raise insufficient_privilege;
  end if;
  if p_role not in ('super_admin', 'content_editor', 'support_agent', 'finance') then
    raise exception 'invalid_staff_role';
  end if;

  select id into v_target_id from auth.users where email = lower(btrim(p_email));
  if v_target_id is null then
    raise exception 'staff_account_not_found';
  end if;

  select jsonb_build_object('role', role) into v_before
  from public.staff_roles where user_id = v_target_id;

  insert into public.staff_roles(user_id, role, assigned_by)
  values (v_target_id, p_role, v_actor)
  on conflict (user_id) do update set role = excluded.role, assigned_by = excluded.assigned_by;

  v_after := jsonb_build_object('role', p_role, 'email', lower(btrim(p_email)));

  insert into public.admin_audit_events(actor_id, target_id, action, before_value, after_value)
  values (v_actor, v_target_id, 'staff_role_assigned', v_before, v_after);

  return jsonb_build_object('userId', v_target_id, 'email', lower(btrim(p_email)), 'role', p_role);
end;
$$;

revoke all on function public.admin_assign_staff_role(text, text) from public, anon, authenticated;
grant execute on function public.admin_assign_staff_role(text, text) to authenticated;

create function public.admin_revoke_staff_role(p_user_id uuid)
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
  if p_user_id = v_actor then
    raise exception 'cannot_revoke_self';
  end if;

  select jsonb_build_object('role', role) into v_before
  from public.staff_roles where user_id = p_user_id;
  if v_before is null then
    raise exception 'staff_not_found';
  end if;

  delete from public.staff_roles where user_id = p_user_id;

  insert into public.admin_audit_events(actor_id, target_id, action, before_value, after_value)
  values (v_actor, p_user_id, 'staff_role_revoked', v_before, null);
end;
$$;

revoke all on function public.admin_revoke_staff_role(uuid) from public, anon, authenticated;
grant execute on function public.admin_revoke_staff_role(uuid) to authenticated;

commit;
