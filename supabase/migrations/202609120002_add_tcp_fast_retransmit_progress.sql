begin;

-- Add one new required checkpoint without deleting historical learner events.
update public.lesson_progress_items
set ordinal = ordinal + 100
where pathway_id = 'path_networking_foundations'
  and lesson_id = 'lesson_tcp_udp_and_ports' and content_version = 1
  and ordinal >= 14
  and not exists (select 1 from public.lesson_progress_items existing
    where existing.pathway_id = 'path_networking_foundations'
      and existing.lesson_id = 'lesson_tcp_udp_and_ports' and existing.content_version = 1
      and existing.item_id = 'tcp_udp_and_ports_interactive_interactive_fast_retransmit');

update public.lesson_progress_items
set ordinal = ordinal - 99
where pathway_id = 'path_networking_foundations'
  and lesson_id = 'lesson_tcp_udp_and_ports' and content_version = 1
  and ordinal >= 114
  and not exists (select 1 from public.lesson_progress_items existing
    where existing.pathway_id = 'path_networking_foundations'
      and existing.lesson_id = 'lesson_tcp_udp_and_ports' and existing.content_version = 1
      and existing.item_id = 'tcp_udp_and_ports_interactive_interactive_fast_retransmit');

insert into public.lesson_progress_items
  (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required)
values
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1,
   'tcp_udp_and_ports_interactive_interactive_fast_retransmit', 14,
   'interactive', 'Interactive fast retransmit and SACK', 'interactive-fast-retransmit', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update
set ordinal = excluded.ordinal, label = excluded.label, anchor = excluded.anchor;

update public.lesson_progress_manifests
set required_item_count = 21
where pathway_id = 'path_networking_foundations'
  and lesson_id = 'lesson_tcp_udp_and_ports' and content_version = 1;

with recalculated as (
  select a.id,
    array(select i.item_id from public.lesson_progress_items i
      where i.pathway_id = a.pathway_id and i.lesson_id = a.lesson_id and i.content_version = a.content_version
        and exists (select 1 from public.learner_progress_events e
          where e.attempt_id = a.id and e.item_id = i.item_id
            and e.event_type in ('section_completed', 'interactive_completed', 'knowledge_check_attempted'))
      order by i.ordinal) as completed_ids,
    (select i.item_id from public.lesson_progress_items i
      where i.pathway_id = a.pathway_id and i.lesson_id = a.lesson_id and i.content_version = a.content_version
        and not exists (select 1 from public.learner_progress_events e
          where e.attempt_id = a.id and e.item_id = i.item_id
            and e.event_type in ('section_completed', 'interactive_completed', 'knowledge_check_attempted'))
      order by i.ordinal limit 1) as next_id
  from public.learner_lesson_attempts a
  where a.pathway_id = 'path_networking_foundations'
    and a.lesson_id = 'lesson_tcp_udp_and_ports' and a.content_version = 1
)
update public.learner_lesson_attempts a set
  completed_item_ids = r.completed_ids,
  next_item_id = r.next_id,
  completion_percent = floor(cardinality(r.completed_ids)::numeric * 100 / 21)::integer,
  status = case when cardinality(r.completed_ids) = 21 then 'completed'
    when cardinality(r.completed_ids) = 0 then 'not_started' else 'in_progress' end,
  completed_at = case when cardinality(r.completed_ids) = 21 then a.completed_at else null end
from recalculated r where a.id = r.id;

commit;
