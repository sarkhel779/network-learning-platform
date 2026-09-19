begin;

set local role postgres;
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
) values (
  '41111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'progress-functions@example.test', '', now(), now(), now()
);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"41111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

do $$
declare
  result public.learner_lesson_attempts;
  first_item text;
  item_kind text;
  item_anchor text;
  event_count bigint;
begin
  select item_id, kind, anchor into first_item, item_kind, item_anchor
  from public.lesson_progress_items
  where pathway_id = 'path_networking_foundations'
    and lesson_id = 'lesson_how_networks_communicate'
    and content_version = 1
    and kind = 'section'
  order by ordinal
  limit 1;

  result := public.record_learner_progress_event(
    'path_networking_foundations', 'lesson_how_networks_communicate', 1,
    '42111111-1111-1111-1111-111111111111',
    case item_kind when 'section' then 'section_completed' when 'interactive' then 'interactive_completed' else 'knowledge_check_attempted' end,
    first_item, item_kind, item_anchor, null, '{}'::jsonb
  );
  if result.status <> 'in_progress' or result.completion_percent <> 0 then
    raise exception 'section event unexpectedly advanced quiz-only progress';
  end if;

  perform public.record_learner_progress_event(
    'path_networking_foundations', 'lesson_how_networks_communicate', 1,
    '42111111-1111-1111-1111-111111111111',
    case item_kind when 'section' then 'section_completed' when 'interactive' then 'interactive_completed' else 'knowledge_check_attempted' end,
    first_item, item_kind, item_anchor, null, '{}'::jsonb
  );
  select count(*) into event_count
  from public.learner_progress_events
  where idempotency_key = '42111111-1111-1111-1111-111111111111';
  if event_count <> 1 then
    raise exception 'idempotency key produced % events', event_count;
  end if;
end;
$$;

do $$
begin
  begin
    perform public.record_learner_progress_event(
      'path_networking_foundations', 'lesson_how_networks_communicate', 999,
      '42222222-2222-2222-2222-222222222222', 'section_completed',
      'missing', 'section', 'missing', null, '{}'::jsonb
    );
    raise exception 'stale version unexpectedly accepted';
  exception when others then
    if sqlerrm not like '%stale_content_version%' then raise; end if;
  end;

  begin
    perform public.record_learner_progress_event(
      'path_networking_foundations', 'lesson_how_networks_communicate', 1,
      '42333333-3333-3333-3333-333333333333', 'section_completed',
      'missing', 'section', 'missing', null, '{}'::jsonb
    );
    raise exception 'unknown item unexpectedly accepted';
  exception when others then
    if sqlerrm not like '%unknown_progress_item%' then raise; end if;
  end;
end;
$$;

do $$
declare
  candidate record;
  result public.learner_lesson_attempts;
  key_counter bigint := 100;
  completion_events bigint;
begin
  for candidate in
    select item_id, kind, anchor
    from public.lesson_progress_items
    where pathway_id = 'path_networking_foundations'
      and lesson_id = 'lesson_how_networks_communicate'
      and content_version = 1
    order by ordinal
  loop
    key_counter := key_counter + 1;
    result := public.record_learner_progress_event(
      'path_networking_foundations', 'lesson_how_networks_communicate', 1,
      ('00000000-0000-0000-0000-' || lpad(key_counter::text, 12, '0'))::uuid,
      case candidate.kind when 'section' then 'section_completed' when 'interactive' then 'interactive_completed' else 'knowledge_check_attempted' end,
      candidate.item_id, candidate.kind, candidate.anchor,
      case when candidate.kind = 'knowledge_check' then false else null end,
      '{}'::jsonb
    );
  end loop;

  if result.status <> 'in_progress' or result.completion_percent <> 0 then
    raise exception 'non-quiz and incorrect events advanced lesson: %, %', result.status, result.completion_percent;
  end if;
  if result.incorrect_check_count < 1 then
    raise exception 'incorrect attempted answer was not stored';
  end if;

  for candidate in
    select item_id, kind, anchor
    from public.lesson_progress_items
    where pathway_id = 'path_networking_foundations'
      and lesson_id = 'lesson_how_networks_communicate'
      and content_version = 1
      and required
    order by ordinal
  loop
    key_counter := key_counter + 1;
    result := public.record_learner_progress_event(
      'path_networking_foundations', 'lesson_how_networks_communicate', 1,
      ('00000000-0000-0000-0000-' || lpad(key_counter::text, 12, '0'))::uuid,
      'knowledge_check_attempted', candidate.item_id, candidate.kind, candidate.anchor,
      true, '{}'::jsonb
    );
  end loop;

  if result.status <> 'completed' or result.completion_percent <> 100 then
    raise exception 'correct knowledge checks did not complete lesson: %, %', result.status, result.completion_percent;
  end if;

  select count(*) into completion_events
  from public.learner_progress_events
  where attempt_id = result.id and event_type = 'lesson_completed';
  if completion_events <> 1 then
    raise exception 'expected exactly one lesson_completed event, got %', completion_events;
  end if;

  result := public.restart_learner_lesson(
    'path_networking_foundations', 'lesson_how_networks_communicate', 1,
    '42444444-4444-4444-4444-444444444444'
  );
  if result.attempt_number <> 2 or result.status <> 'not_started' or result.completion_percent <> 0 then
    raise exception 'restart did not create clean second attempt';
  end if;
  if (select count(*) from public.learner_lesson_attempts where user_id = auth.uid()) <> 2 then
    raise exception 'restart did not preserve attempt history';
  end if;

  perform public.restart_learner_lesson(
    'path_networking_foundations', 'lesson_how_networks_communicate', 1,
    '42444444-4444-4444-4444-444444444444'
  );
  if (select count(*) from public.learner_lesson_attempts where user_id = auth.uid()) <> 2 then
    raise exception 'idempotent restart created another attempt';
  end if;
end;
$$;

rollback;
