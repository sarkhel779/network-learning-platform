set role postgres;

delete from auth.users
where id in (
  '51111111-1111-1111-1111-111111111111',
  '52222222-2222-2222-2222-222222222222'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
) values
  (
    '51111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'basics-completed@example.test', '',
    now(), now(), now()
  ),
  (
    '52222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'basics-incomplete@example.test', '',
    now(), now(), now()
  );

insert into public.learner_lesson_attempts (
  id, user_id, pathway_id, lesson_id, content_version, attempt_number,
  is_current, status, completed_item_ids, next_item_id, last_item_id,
  last_anchor, completion_percent, started_at, completed_at, updated_at
) values
  (
    '53333333-3333-3333-3333-333333333333',
    '51111111-1111-1111-1111-111111111111',
    'path_networking_foundations', 'lesson_hubs_bridges_and_switches', 1, 1,
    true, 'completed', array['hubs_bridges_and_switches_check_3'], null,
    'hubs_bridges_and_switches_check_3', 'hubs-bridges-and-switches-check-3',
    100, '2026-09-01 10:00:00+00', '2026-09-01 10:30:00+00', '2026-09-01 10:30:00+00'
  ),
  (
    '54444444-4444-4444-4444-444444444444',
    '52222222-2222-2222-2222-222222222222',
    'path_networking_foundations', 'lesson_hubs_bridges_and_switches', 1, 1,
    true, 'in_progress', array[]::text[], 'hubs_bridges_and_switches_check_1',
    null, null, 0, '2026-09-01 11:00:00+00', null, '2026-09-01 11:00:00+00'
  );

\ir ../migrations/202609200002_computer_network_basics_restructure.sql

select count(*)::bigint as first_attempt_count
from public.learner_lesson_attempts
where user_id = '51111111-1111-1111-1111-111111111111'
  and lesson_id in ('lesson_hubs', 'lesson_bridges', 'lesson_switches')
\gset

select count(*)::bigint as first_event_count
from public.learner_progress_events
where user_id = '51111111-1111-1111-1111-111111111111'
  and metadata @> '{"completionRule":"legacy-split-carry-forward-v1"}'::jsonb
\gset

\ir ../migrations/202609200002_computer_network_basics_restructure.sql

begin;
select plan(10);

select is(
  (select required_item_count from public.lesson_progress_manifests
   where lesson_id = 'lesson_computer_network_basics_final_quiz' and content_version = 1),
  8,
  'the final quiz requires all eight answers'
);

select is(
  (select count(*)::integer from public.lesson_progress_items
   where lesson_id = 'lesson_hubs' and content_version = 1 and required),
  1,
  'the hubs lesson has one required quiz item'
);

select is(
  (select count(*)::integer from public.learner_lesson_attempts
   where user_id = '51111111-1111-1111-1111-111111111111'
     and lesson_id in ('lesson_hubs', 'lesson_bridges', 'lesson_switches')
     and status = 'completed'),
  3,
  'a completed combined lesson is carried into all three split lessons'
);

select is(
  (select count(*)::integer from public.learner_lesson_attempts
   where user_id = '52222222-2222-2222-2222-222222222222'
     and lesson_id in ('lesson_hubs', 'lesson_bridges', 'lesson_switches')),
  0,
  'an incomplete combined lesson is not carried forward'
);

select is(
  (select count(*)::integer from public.learner_lesson_attempts
   where user_id = '51111111-1111-1111-1111-111111111111'
     and lesson_id in ('lesson_hubs', 'lesson_bridges', 'lesson_switches')
     and is_current),
  3,
  'there is exactly one current attempt for each split lesson'
);

select is(
  (select count(*)::integer from public.learner_progress_events
   where user_id = '51111111-1111-1111-1111-111111111111'
     and event_type = 'knowledge_check_attempted'
     and answer_correct is true
     and metadata @> '{"completionRule":"legacy-split-carry-forward-v1"}'::jsonb),
  3,
  'each carried lesson records one correct quiz answer'
);

select is(
  (select count(*)::integer from public.learner_progress_events
   where user_id = '51111111-1111-1111-1111-111111111111'
     and event_type = 'lesson_completed'
     and metadata @> '{"completionRule":"legacy-split-carry-forward-v1"}'::jsonb),
  3,
  'each carried lesson records one completion event'
);

select is(
  (select count(*)::integer from public.learner_lesson_attempts
   where id in (
     '53333333-3333-3333-3333-333333333333',
     '54444444-4444-4444-4444-444444444444'
   )),
  2,
  'legacy attempts remain untouched'
);

select is(
  (select count(*)::bigint from public.learner_lesson_attempts
   where user_id = '51111111-1111-1111-1111-111111111111'
     and lesson_id in ('lesson_hubs', 'lesson_bridges', 'lesson_switches')),
  :'first_attempt_count'::bigint,
  'a second migration run creates no duplicate attempts'
);

select is(
  (select count(*)::bigint from public.learner_progress_events
   where user_id = '51111111-1111-1111-1111-111111111111'
     and metadata @> '{"completionRule":"legacy-split-carry-forward-v1"}'::jsonb),
  :'first_event_count'::bigint,
  'a second migration run creates no duplicate events'
);

select * from finish();
rollback;

delete from auth.users
where id in (
  '51111111-1111-1111-1111-111111111111',
  '52222222-2222-2222-2222-222222222222'
);
