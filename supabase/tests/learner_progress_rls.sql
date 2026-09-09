begin;

set local role postgres;
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
) values
  ('31111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'progress-one@example.test', '', now(), now(), now()),
  ('32222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'progress-two@example.test', '', now(), now(), now());

insert into public.learner_lesson_attempts (
  id, user_id, pathway_id, lesson_id, content_version, attempt_number,
  is_current, status, completed_item_ids, completion_percent
) values
  ('33111111-1111-1111-1111-111111111111', '31111111-1111-1111-1111-111111111111', 'path_networking_foundations', 'lesson_how_networks_communicate', 1, 1, true, 'in_progress', array[]::text[], 0),
  ('33222222-2222-2222-2222-222222222222', '32222222-2222-2222-2222-222222222222', 'path_networking_foundations', 'lesson_how_networks_communicate', 1, 1, true, 'in_progress', array[]::text[], 0);

insert into public.learner_progress_events (
  user_id, attempt_id, idempotency_key, event_type, item_id, item_kind, anchor
) values
  ('31111111-1111-1111-1111-111111111111', '33111111-1111-1111-1111-111111111111', '34111111-1111-1111-1111-111111111111', 'section_completed', 'how_networks_communicate_section_what-is-a-network', 'section', 'what-is-a-network'),
  ('32222222-2222-2222-2222-222222222222', '33222222-2222-2222-2222-222222222222', '34222222-2222-2222-2222-222222222222', 'section_completed', 'how_networks_communicate_section_what-is-a-network', 'section', 'what-is-a-network');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"31111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

do $$
declare
  attempt_count bigint;
  event_count bigint;
begin
  select count(*) into attempt_count from public.learner_lesson_attempts;
  select count(*) into event_count from public.learner_progress_events;
  if attempt_count <> 1 or event_count <> 1 then
    raise exception 'learner must see exactly their own attempt and event; got attempts %, events %', attempt_count, event_count;
  end if;
end;
$$;

do $$
begin
  begin
    insert into public.learner_lesson_attempts (
      user_id, pathway_id, lesson_id, content_version, attempt_number
    ) values (
      auth.uid(), 'path_networking_foundations', 'lesson_how_networks_communicate', 1, 2
    );
    raise exception 'direct attempt insert unexpectedly succeeded';
  exception when insufficient_privilege then
    null;
  end;

  begin
    update public.learner_lesson_attempts set completion_percent = 100;
    raise exception 'direct attempt update unexpectedly succeeded';
  exception when insufficient_privilege then
    null;
  end;

  begin
    delete from public.learner_progress_events;
    raise exception 'direct event delete unexpectedly succeeded';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"32222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

do $$
declare
  leaked bigint;
begin
  select count(*) into leaked
  from public.learner_lesson_attempts
  where user_id = '31111111-1111-1111-1111-111111111111';
  if leaked <> 0 then
    raise exception 'cross-user attempt was visible';
  end if;
end;
$$;

rollback;
