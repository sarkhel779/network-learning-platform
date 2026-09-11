begin;

set local role postgres;
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
) values
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'waitlist-one@example.test', '', now(), now(), now()
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'waitlist-two@example.test', '', now(), now(), now()
  );

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}',
  true
);

do $$
declare
  first_join public.pro_waitlist_entries;
  duplicate_join public.pro_waitlist_entries;
  left_entry public.pro_waitlist_entries;
  visible_entries bigint;
begin
  first_join := public.join_pro_waitlist(true, 'founding-pro-v1', 'hosts-and-network-devices');
  duplicate_join := public.join_pro_waitlist(true, 'founding-pro-v1', null);

  if first_join.email <> 'waitlist-one@example.test' then
    raise exception 'join did not derive the authenticated email';
  end if;
  if duplicate_join.consented_at <> first_join.consented_at then
    raise exception 'duplicate join changed the original consent timestamp';
  end if;

  select count(*) into visible_entries from public.pro_waitlist_entries;
  if visible_entries <> 1 then
    raise exception 'learner one should see exactly one owned entry';
  end if;

  left_entry := public.leave_pro_waitlist();
  if left_entry.status <> 'unsubscribed' or left_entry.unsubscribed_at is null then
    raise exception 'leave did not preserve the row as unsubscribed';
  end if;
end;
$$;

set local role postgres;
update public.pro_waitlist_entries
set consented_at = now() - interval '1 day'
where user_id = '33333333-3333-3333-3333-333333333333';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}',
  true
);

do $$
declare
  rejoined public.pro_waitlist_entries;
begin
  rejoined := public.join_pro_waitlist(true, 'founding-pro-v1', null);
  if rejoined.status <> 'joined' or rejoined.unsubscribed_at is not null then
    raise exception 'explicit rejoin did not restore joined state';
  end if;
  if rejoined.consented_at < now() - interval '1 minute' then
    raise exception 'explicit rejoin did not record fresh consent';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}',
  true
);

do $$
declare
  visible_entries bigint;
begin
  select count(*) into visible_entries from public.pro_waitlist_entries;
  if visible_entries <> 0 then
    raise exception 'learner two can read another learner waitlist entry';
  end if;
end;
$$;

rollback;
