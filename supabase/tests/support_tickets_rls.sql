begin;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ticket-learner-a@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ticket-learner-b@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000503', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ticket-support-agent@example.test', '', now(), now()),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ticket-finance@example.test', '', now(), now());

insert into public.staff_roles (user_id, role)
values
  ('00000000-0000-4000-8000-000000000503', 'support_agent'),
  ('00000000-0000-4000-8000-000000000504', 'finance');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000501';
do $$
declare
  v_ticket_id bigint;
begin
  begin
    perform public.create_support_ticket('', 'Body without a subject');
    raise exception 'an empty subject was accepted';
  exception when others then
    if sqlerrm <> 'invalid_subject' then raise; end if;
  end;

  v_ticket_id := (public.create_support_ticket('Cannot access Pro trial', 'My Pro trial link is returning a 404.') ->> 'id')::bigint;

  if jsonb_array_length(public.list_my_support_tickets()) <> 1 then
    raise exception 'the new ticket is missing from the learner''s own list';
  end if;

  perform set_config('support_test.ticket_id', v_ticket_id::text, false);
end $$;

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000502';
do $$
declare
  v_ticket_id bigint := current_setting('support_test.ticket_id')::bigint;
begin
  begin
    perform public.get_my_support_ticket(v_ticket_id);
    raise exception 'a learner can read another learner''s ticket';
  exception when others then
    if sqlerrm <> 'ticket_not_found' then raise; end if;
  end;
  begin
    perform public.add_support_ticket_message(v_ticket_id, 'Trying to reply to a ticket that is not mine.');
    raise exception 'a learner can reply to another learner''s ticket';
  exception when others then
    if sqlerrm <> 'ticket_not_found' then raise; end if;
  end;
  if jsonb_array_length(public.list_my_support_tickets()) <> 0 then
    raise exception 'a learner can see another learner''s ticket in their own list';
  end if;
end $$;

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000504';
do $$
declare
  v_ticket_id bigint := current_setting('support_test.ticket_id')::bigint;
begin
  begin
    perform public.admin_list_support_tickets(null, 0, 20);
    raise exception 'a role without the support permission can list tickets';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_reply_support_ticket(v_ticket_id, 'Reply from an unauthorized role.');
    raise exception 'a role without the support permission can reply to a ticket';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_set_support_ticket_status(v_ticket_id, 'resolved');
    raise exception 'a role without the support permission can change ticket status';
  exception when insufficient_privilege then null;
  end;
end $$;

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000503';
do $$
declare
  v_ticket_id bigint := current_setting('support_test.ticket_id')::bigint;
begin
  if (public.admin_list_support_tickets(null, 0, 20) ->> 'total')::integer <> 1 then
    raise exception 'the support queue omitted the open ticket';
  end if;

  if (public.admin_reply_support_ticket(v_ticket_id, 'We are looking into this now.') ->> 'ticketId')::bigint <> v_ticket_id then
    raise exception 'the staff reply was not recorded against the right ticket';
  end if;
  if (public.admin_get_support_ticket(v_ticket_id) ->> 'status') <> 'in_progress' then
    raise exception 'a staff reply on an open ticket did not move it to in_progress';
  end if;

  if (public.admin_set_support_ticket_status(v_ticket_id, 'resolved') ->> 'status') <> 'resolved' then
    raise exception 'resolving the ticket was not applied';
  end if;

  begin
    perform public.admin_set_support_ticket_status(v_ticket_id, 'archived');
    raise exception 'an invalid status was accepted';
  exception when others then
    if sqlerrm <> 'invalid_status' then raise; end if;
  end;
end $$;

set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000501';
do $$
declare
  v_ticket_id bigint := current_setting('support_test.ticket_id')::bigint;
begin
  perform public.add_support_ticket_message(v_ticket_id, 'This is still broken for me, please reopen.');
  if (public.get_my_support_ticket(v_ticket_id) ->> 'status') <> 'open' then
    raise exception 'a learner reply on a resolved ticket did not reopen it';
  end if;
  if jsonb_array_length(public.get_my_support_ticket(v_ticket_id) -> 'messages') <> 3 then
    raise exception 'the ticket thread is missing a message';
  end if;
end $$;

reset role;
do $$
begin
  if (select count(*) from public.admin_audit_events where action = 'support_ticket_replied') <> 1 then
    raise exception 'a staff reply did not create an audit event';
  end if;
  if (select count(*) from public.admin_audit_events where action = 'support_ticket_status_changed') <> 1 then
    raise exception 'a status change did not create an audit event';
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
    perform public.create_support_ticket('Anonymous ticket', 'Should not be allowed.');
    raise exception 'anonymous role can create a support ticket';
  exception when insufficient_privilege then null;
  end;
  begin
    perform count(*) from public.support_tickets;
    raise exception 'anonymous role can directly read support tickets';
  exception when insufficient_privilege then null;
  end;
  begin
    perform count(*) from public.support_ticket_messages;
    raise exception 'anonymous role can directly read support ticket messages';
  exception when insufficient_privilege then null;
  end;
end $$;

rollback;
