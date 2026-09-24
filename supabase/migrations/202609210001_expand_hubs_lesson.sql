begin;

insert into public.lesson_progress_manifests (
  pathway_id, lesson_id, content_version, required_item_count
) values (
  'path_networking_foundations', 'lesson_hubs', 1, 3
)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (
  pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required
) values
  ('path_networking_foundations', 'lesson_hubs', 1, 'hubs_section_what_is_a_hub', 1, 'section', 'What is a hub?', 'what-is-a-hub', false),
  ('path_networking_foundations', 'lesson_hubs', 1, 'hubs_section_how_a_hub_handles_a_signal', 2, 'section', 'How a hub handles a signal', 'how-a-hub-handles-a-signal', false),
  ('path_networking_foundations', 'lesson_hubs', 1, 'hubs_interactive_repeat_a_signal', 3, 'interactive', 'Watch a hub repeat a signal', 'repeat-a-signal', false),
  ('path_networking_foundations', 'lesson_hubs', 1, 'hubs_section_shared_network_behaviour', 4, 'section', 'Shared network behaviour', 'shared-network-behaviour', false),
  ('path_networking_foundations', 'lesson_hubs', 1, 'hubs_section_why_switches_replaced_hubs', 5, 'section', 'Why switches replaced hubs', 'why-switches-replaced-hubs', false),
  ('path_networking_foundations', 'lesson_hubs', 1, 'hubs_check_1', 6, 'knowledge_check', 'Knowledge check 1', 'hubs-check-1', true),
  ('path_networking_foundations', 'lesson_hubs', 1, 'hubs_check_2', 7, 'knowledge_check', 'Knowledge check 2', 'hubs-check-2', true),
  ('path_networking_foundations', 'lesson_hubs', 1, 'hubs_check_3', 8, 'knowledge_check', 'Knowledge check 3', 'hubs-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal,
  kind = excluded.kind,
  label = excluded.label,
  anchor = excluded.anchor,
  required = excluded.required;

-- Learners who completed the previous one-question lesson keep that completion.
insert into public.learner_progress_events (
  user_id, attempt_id, idempotency_key, event_type, item_id,
  item_kind, anchor, answer_correct, metadata
)
select
  attempt.user_id, attempt.id, gen_random_uuid(), 'knowledge_check_attempted',
  carried.item_id, 'knowledge_check', carried.anchor, true,
  '{"completionRule":"expanded-hubs-carry-forward-v1"}'::jsonb
from public.learner_lesson_attempts attempt
cross join (values
  ('hubs_check_2'::text, 'hubs-check-2'::text),
  ('hubs_check_3'::text, 'hubs-check-3'::text)
) as carried(item_id, anchor)
where attempt.pathway_id = 'path_networking_foundations'
  and attempt.lesson_id = 'lesson_hubs'
  and attempt.content_version = 1
  and attempt.status = 'completed'
  and not exists (
    select 1 from public.learner_progress_events existing
    where existing.attempt_id = attempt.id
      and existing.event_type = 'knowledge_check_attempted'
      and existing.item_id = carried.item_id
      and existing.answer_correct is true
  );

update public.learner_lesson_attempts
set completed_item_ids = array(
      select distinct completed.item_id
      from unnest(completed_item_ids || array['hubs_check_2', 'hubs_check_3']) as completed(item_id)
    ),
    next_item_id = null,
    completion_percent = 100
where pathway_id = 'path_networking_foundations'
  and lesson_id = 'lesson_hubs'
  and content_version = 1
  and status = 'completed';

commit;
