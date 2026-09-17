begin;

create table public.support_tickets (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (char_length(subject) between 1 and 150),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index support_tickets_user_id_idx on public.support_tickets(user_id);
create index support_tickets_status_idx on public.support_tickets(status);

create table public.support_ticket_messages (
  id bigint generated always as identity primary key,
  ticket_id bigint not null references public.support_tickets(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  is_staff boolean not null default false,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index support_ticket_messages_ticket_id_idx on public.support_ticket_messages(ticket_id);

alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;
revoke all on public.support_tickets from anon, authenticated;
revoke all on public.support_ticket_messages from anon, authenticated;

-- Learner-facing: every function below is scoped to auth.uid()'s own tickets.
create function public.create_support_ticket(p_subject text, p_body text)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_subject text := btrim(coalesce(p_subject, ''));
  v_body text := btrim(coalesce(p_body, ''));
  v_ticket public.support_tickets;
begin
  if v_user_id is null then
    raise exception 'authentication_required';
  end if;
  if char_length(v_subject) < 1 or char_length(v_subject) > 150 then
    raise exception 'invalid_subject';
  end if;
  if char_length(v_body) < 1 or char_length(v_body) > 4000 then
    raise exception 'invalid_body';
  end if;

  insert into public.support_tickets(user_id, subject, status)
  values (v_user_id, v_subject, 'open')
  returning * into v_ticket;

  insert into public.support_ticket_messages(ticket_id, author_id, is_staff, body)
  values (v_ticket.id, v_user_id, false, v_body);

  return jsonb_build_object('id', v_ticket.id, 'subject', v_ticket.subject, 'status', v_ticket.status, 'createdAt', v_ticket.created_at);
end;
$$;

create function public.list_my_support_tickets()
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', t.id, 'subject', t.subject, 'status', t.status,
    'createdAt', t.created_at, 'updatedAt', t.updated_at
  ) order by t.updated_at desc), '[]'::jsonb)
  from public.support_tickets t
  where t.user_id = auth.uid();
$$;

create function public.get_my_support_ticket(p_ticket_id bigint)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_ticket public.support_tickets;
begin
  if v_user_id is null then
    raise exception 'authentication_required';
  end if;
  select * into v_ticket from public.support_tickets where id = p_ticket_id and user_id = v_user_id;
  if v_ticket.id is null then
    raise exception 'ticket_not_found';
  end if;
  return jsonb_build_object(
    'id', v_ticket.id, 'subject', v_ticket.subject, 'status', v_ticket.status,
    'createdAt', v_ticket.created_at, 'updatedAt', v_ticket.updated_at,
    'messages', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id, 'isStaff', m.is_staff, 'body', m.body, 'createdAt', m.created_at
      ) order by m.created_at asc)
      from public.support_ticket_messages m where m.ticket_id = v_ticket.id
    ), '[]'::jsonb)
  );
end;
$$;

create function public.add_support_ticket_message(p_ticket_id bigint, p_body text)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_body text := btrim(coalesce(p_body, ''));
  v_ticket public.support_tickets;
begin
  if v_user_id is null then
    raise exception 'authentication_required';
  end if;
  if char_length(v_body) < 1 or char_length(v_body) > 4000 then
    raise exception 'invalid_body';
  end if;

  select * into v_ticket from public.support_tickets where id = p_ticket_id and user_id = v_user_id for update;
  if v_ticket.id is null then
    raise exception 'ticket_not_found';
  end if;

  insert into public.support_ticket_messages(ticket_id, author_id, is_staff, body)
  values (v_ticket.id, v_user_id, false, v_body);

  -- A learner following up on a resolved ticket needs staff attention again.
  update public.support_tickets
  set status = case when status = 'resolved' then 'open' else status end,
      updated_at = now()
  where id = v_ticket.id;

  return jsonb_build_object('ticketId', v_ticket.id);
end;
$$;

revoke all on function public.create_support_ticket(text, text) from public, anon, authenticated;
revoke all on function public.list_my_support_tickets() from public, anon, authenticated;
revoke all on function public.get_my_support_ticket(bigint) from public, anon, authenticated;
revoke all on function public.add_support_ticket_message(bigint, text) from public, anon, authenticated;
grant execute on function public.create_support_ticket(text, text) to authenticated;
grant execute on function public.list_my_support_tickets() to authenticated;
grant execute on function public.get_my_support_ticket(bigint) to authenticated;
grant execute on function public.add_support_ticket_message(bigint, text) to authenticated;

-- Staff-facing: gated to the existing support permission (super_admin, support_agent).
create function public.admin_list_support_tickets(p_status text default null, p_offset integer default 0, p_limit integer default 20)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_role text := public.admin_staff_role();
  v_status text := nullif(btrim(coalesce(p_status, '')), '');
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 50);
  v_total bigint;
  v_rows jsonb;
begin
  if v_role not in ('super_admin', 'support_agent') or v_role is null then
    raise insufficient_privilege;
  end if;
  if v_status is not null and v_status not in ('open', 'in_progress', 'resolved') then
    raise exception 'invalid_status_filter';
  end if;

  select count(*) into v_total
  from public.support_tickets t
  where v_status is null or t.status = v_status;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', t.id, 'subject', t.subject, 'status', t.status,
    'learnerId', t.user_id, 'learnerEmail', u.email,
    'createdAt', t.created_at, 'updatedAt', t.updated_at
  ) order by t.updated_at desc), '[]'::jsonb)
  into v_rows
  from (
    select * from public.support_tickets
    where v_status is null or status = v_status
    order by updated_at desc
    offset v_offset limit v_limit
  ) t
  join auth.users u on u.id = t.user_id;

  return jsonb_build_object('total', v_total, 'rows', v_rows);
end;
$$;

create function public.admin_get_support_ticket(p_ticket_id bigint)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_role text := public.admin_staff_role();
  v_ticket public.support_tickets;
  v_email text;
begin
  if v_role not in ('super_admin', 'support_agent') or v_role is null then
    raise insufficient_privilege;
  end if;
  select * into v_ticket from public.support_tickets where id = p_ticket_id;
  if v_ticket.id is null then
    raise exception 'ticket_not_found';
  end if;
  select email into v_email from auth.users where id = v_ticket.user_id;
  return jsonb_build_object(
    'id', v_ticket.id, 'subject', v_ticket.subject, 'status', v_ticket.status,
    'learnerId', v_ticket.user_id, 'learnerEmail', v_email,
    'createdAt', v_ticket.created_at, 'updatedAt', v_ticket.updated_at,
    'messages', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id, 'isStaff', m.is_staff, 'body', m.body, 'createdAt', m.created_at
      ) order by m.created_at asc)
      from public.support_ticket_messages m where m.ticket_id = v_ticket.id
    ), '[]'::jsonb)
  );
end;
$$;

create function public.admin_reply_support_ticket(p_ticket_id bigint, p_body text)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role text := public.admin_staff_role();
  v_body text := btrim(coalesce(p_body, ''));
  v_ticket public.support_tickets;
begin
  if v_role not in ('super_admin', 'support_agent') or v_role is null then
    raise insufficient_privilege;
  end if;
  if char_length(v_body) < 1 or char_length(v_body) > 4000 then
    raise exception 'invalid_body';
  end if;

  select * into v_ticket from public.support_tickets where id = p_ticket_id for update;
  if v_ticket.id is null then
    raise exception 'ticket_not_found';
  end if;

  insert into public.support_ticket_messages(ticket_id, author_id, is_staff, body)
  values (v_ticket.id, v_actor, true, v_body);

  update public.support_tickets
  set status = case when status = 'open' then 'in_progress' else status end,
      updated_at = now()
  where id = v_ticket.id;

  insert into public.admin_audit_events(actor_id, target_id, action, before_value, after_value)
  values (v_actor, v_ticket.user_id, 'support_ticket_replied', jsonb_build_object('ticketId', v_ticket.id), jsonb_build_object('ticketId', v_ticket.id));

  return jsonb_build_object('ticketId', v_ticket.id);
end;
$$;

create function public.admin_set_support_ticket_status(p_ticket_id bigint, p_status text)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role text := public.admin_staff_role();
  v_before text;
  v_learner_id uuid;
begin
  if v_role not in ('super_admin', 'support_agent') or v_role is null then
    raise insufficient_privilege;
  end if;
  if p_status not in ('open', 'in_progress', 'resolved') then
    raise exception 'invalid_status';
  end if;

  select status, user_id into v_before, v_learner_id from public.support_tickets where id = p_ticket_id for update;
  if v_before is null then
    raise exception 'ticket_not_found';
  end if;

  update public.support_tickets set status = p_status, updated_at = now() where id = p_ticket_id;

  insert into public.admin_audit_events(actor_id, target_id, action, before_value, after_value)
  values (v_actor, v_learner_id, 'support_ticket_status_changed', jsonb_build_object('ticketId', p_ticket_id, 'status', v_before), jsonb_build_object('ticketId', p_ticket_id, 'status', p_status));

  return jsonb_build_object('id', p_ticket_id, 'status', p_status);
end;
$$;

revoke all on function public.admin_list_support_tickets(text, integer, integer) from public, anon, authenticated;
revoke all on function public.admin_get_support_ticket(bigint) from public, anon, authenticated;
revoke all on function public.admin_reply_support_ticket(bigint, text) from public, anon, authenticated;
revoke all on function public.admin_set_support_ticket_status(bigint, text) from public, anon, authenticated;
grant execute on function public.admin_list_support_tickets(text, integer, integer) to authenticated;
grant execute on function public.admin_get_support_ticket(bigint) to authenticated;
grant execute on function public.admin_reply_support_ticket(bigint, text) to authenticated;
grant execute on function public.admin_set_support_ticket_status(bigint, text) to authenticated;

commit;
