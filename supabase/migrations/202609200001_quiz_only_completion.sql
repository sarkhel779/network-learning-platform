begin;

alter table public.lesson_progress_items drop constraint if exists lesson_progress_items_required_check;

update public.lesson_progress_items
set ordinal = ordinal + 100
where pathway_id = 'path_networking_foundations'
  and lesson_id = 'lesson_systematic_network_troubleshooting_capstone'
  and content_version = 1;

update public.lesson_progress_items
set ordinal = case item_id
  when 'capstone_section_scope_the_incident' then 1
  when 'capstone_section_form_a_hypothesis' then 2
  when 'capstone_section_collect_evidence' then 3
  when 'capstone_section_isolate_the_fault' then 4
  when 'capstone_section_restore_the_service' then 5
  when 'capstone_section_report_and_prevent' then 6
  when 'capstone_guided_incident' then 7
  when 'capstone_section_guided_incident_debrief' then 8
  when 'capstone_check_1' then 9
  when 'capstone_check_2' then 10
  when 'capstone_check_3' then 11
  when 'capstone_guided_vlan_check' then 12
  when 'capstone_guided_route_check' then 13
  when 'capstone_guided_dns_check' then 14
  when 'capstone_restoration_verification' then 15
  when 'capstone_pro_evidence' then 16
  when 'capstone_pro_validation' then 17
  when 'capstone_pro_report' then 18
  else ordinal - 100
end
where pathway_id = 'path_networking_foundations'
  and lesson_id = 'lesson_systematic_network_troubleshooting_capstone'
  and content_version = 1;

insert into public.lesson_progress_items (
  pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required
) values
  ('path_networking_foundations', 'lesson_systematic_network_troubleshooting_capstone', 1, 'capstone_check_1', 9, 'knowledge_check', 'Knowledge check 1', 'capstone-check-1', true),
  ('path_networking_foundations', 'lesson_systematic_network_troubleshooting_capstone', 1, 'capstone_check_2', 10, 'knowledge_check', 'Knowledge check 2', 'capstone-check-2', true),
  ('path_networking_foundations', 'lesson_systematic_network_troubleshooting_capstone', 1, 'capstone_check_3', 11, 'knowledge_check', 'Knowledge check 3', 'capstone-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal,
  kind = excluded.kind,
  label = excluded.label,
  anchor = excluded.anchor,
  required = excluded.required;

update public.lesson_progress_items
set required = (kind = 'knowledge_check')
where pathway_id = 'path_networking_foundations';

update public.lesson_progress_manifests manifest
set required_item_count = counts.required_count
from (
  select pathway_id, lesson_id, content_version, count(*)::integer as required_count
  from public.lesson_progress_items
  where required
  group by pathway_id, lesson_id, content_version
) counts
where manifest.pathway_id = counts.pathway_id
  and manifest.lesson_id = counts.lesson_id
  and manifest.content_version = counts.content_version;

drop trigger if exists sync_optional_lesson_progress_items on public.learner_lesson_attempts;
drop function if exists public.sync_optional_lesson_progress_items();

create or replace function public.record_learner_progress_event(
  p_pathway_id text,
  p_lesson_id text,
  p_content_version integer,
  p_idempotency_key uuid,
  p_event_type text,
  p_item_id text,
  p_item_kind text,
  p_anchor text,
  p_answer_correct boolean default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.learner_lesson_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempt public.learner_lesson_attempts;
  v_item public.lesson_progress_items;
  v_required integer;
  v_completed text[];
  v_next_item text;
  v_existing_attempt_id uuid;
  v_inserted boolean := false;
begin
  if v_user_id is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    v_user_id::text || ':' || p_pathway_id || ':' || p_lesson_id || ':' || p_content_version::text,
    0
  ));
  if p_metadata is null or jsonb_typeof(p_metadata) <> 'object' or pg_column_size(p_metadata) > 4096 then
    raise exception 'invalid_metadata' using errcode = '22023';
  end if;

  select required_item_count into v_required
  from public.lesson_progress_manifests
  where pathway_id = p_pathway_id and lesson_id = p_lesson_id and content_version = p_content_version;
  if not found then
    if exists (select 1 from public.lesson_progress_manifests where pathway_id = p_pathway_id and lesson_id = p_lesson_id) then
      raise exception 'stale_content_version' using errcode = '22023';
    end if;
    raise exception 'unknown_progress_manifest' using errcode = '22023';
  end if;

  select * into v_item
  from public.lesson_progress_items
  where pathway_id = p_pathway_id and lesson_id = p_lesson_id
    and content_version = p_content_version and item_id = p_item_id;
  if not found then raise exception 'unknown_progress_item' using errcode = '22023'; end if;
  if v_item.kind <> p_item_kind or v_item.anchor <> p_anchor then
    raise exception 'progress_item_mismatch' using errcode = '22023';
  end if;
  if p_event_type <> (case v_item.kind
    when 'section' then 'section_completed'
    when 'interactive' then 'interactive_completed'
    else 'knowledge_check_attempted' end) then
    raise exception 'progress_event_mismatch' using errcode = '22023';
  end if;
  if v_item.kind = 'knowledge_check' and p_answer_correct is null then
    raise exception 'answer_correct_required' using errcode = '22023';
  elsif v_item.kind <> 'knowledge_check' and p_answer_correct is not null then
    raise exception 'answer_correct_not_allowed' using errcode = '22023';
  end if;

  select attempt_id into v_existing_attempt_id
  from public.learner_progress_events
  where user_id = v_user_id and idempotency_key = p_idempotency_key;
  if found then
    select * into v_attempt from public.learner_lesson_attempts where id = v_existing_attempt_id;
    return v_attempt;
  end if;

  select * into v_attempt
  from public.learner_lesson_attempts
  where user_id = v_user_id and pathway_id = p_pathway_id and lesson_id = p_lesson_id
    and content_version = p_content_version and is_current
  for update;
  if not found then
    insert into public.learner_lesson_attempts (
      user_id, pathway_id, lesson_id, content_version, attempt_number, next_item_id
    ) values (
      v_user_id, p_pathway_id, p_lesson_id, p_content_version, 1,
      (select item_id from public.lesson_progress_items
       where pathway_id = p_pathway_id and lesson_id = p_lesson_id
         and content_version = p_content_version and required
       order by ordinal limit 1)
    ) returning * into v_attempt;
  end if;

  insert into public.learner_progress_events (
    user_id, attempt_id, idempotency_key, event_type, item_id, item_kind,
    anchor, answer_correct, metadata
  ) values (
    v_user_id, v_attempt.id, p_idempotency_key, p_event_type, p_item_id,
    p_item_kind, p_anchor, p_answer_correct, p_metadata
  ) on conflict (user_id, idempotency_key) do nothing
  returning true into v_inserted;
  if not coalesce(v_inserted, false) then
    select attempt_id into v_existing_attempt_id from public.learner_progress_events
    where user_id = v_user_id and idempotency_key = p_idempotency_key;
    select * into v_attempt from public.learner_lesson_attempts where id = v_existing_attempt_id;
    return v_attempt;
  end if;

  select coalesce(array_agg(item_id order by ordinal), array[]::text[]) into v_completed
  from (
    select distinct i.item_id, i.ordinal
    from public.lesson_progress_items i
    join public.learner_progress_events e
      on e.attempt_id = v_attempt.id and e.item_id = i.item_id
    where i.pathway_id = p_pathway_id and i.lesson_id = p_lesson_id
      and i.content_version = p_content_version and i.required
      and i.kind = 'knowledge_check'
      and e.event_type = 'knowledge_check_attempted'
      and e.answer_correct is true
  ) completed;

  select item_id into v_next_item
  from public.lesson_progress_items
  where pathway_id = p_pathway_id and lesson_id = p_lesson_id and content_version = p_content_version
    and required and not (item_id = any(v_completed))
  order by ordinal limit 1;

  update public.learner_lesson_attempts
  set completed_item_ids = v_completed,
      next_item_id = v_next_item,
      last_item_id = p_item_id,
      last_anchor = p_anchor,
      completion_percent = floor(cardinality(v_completed)::numeric * 100 / v_required)::integer,
      incorrect_check_count = (
        select count(distinct item_id) from public.learner_progress_events
        where attempt_id = v_attempt.id and event_type = 'knowledge_check_attempted' and answer_correct is false
      ),
      status = case when cardinality(v_completed) = v_required then 'completed' else 'in_progress' end,
      completed_at = case when cardinality(v_completed) = v_required then coalesce(completed_at, now()) else null end,
      updated_at = now()
  where id = v_attempt.id
  returning * into v_attempt;

  if v_attempt.status = 'completed' and not exists (
    select 1 from public.learner_progress_events
    where attempt_id = v_attempt.id
      and event_type = 'lesson_completed'
      and metadata @> '{"completionRule": "quiz-only-v1"}'::jsonb
  ) then
    insert into public.learner_progress_events (
      user_id, attempt_id, idempotency_key, event_type, metadata
    ) values (v_user_id, v_attempt.id, gen_random_uuid(), 'lesson_completed', '{"completionRule": "quiz-only-v1"}'::jsonb);
  end if;
  return v_attempt;
end;
$$;

update public.learner_progress_events
set metadata = metadata || '{"completionRule": "legacy-all-items-v1"}'::jsonb
where event_type = 'lesson_completed'
  and not (metadata ? 'completionRule');

do $$
declare
  v_attempt public.learner_lesson_attempts;
  v_completed text[];
  v_required integer;
  v_next_item text;
  v_has_quiz_attempt boolean;
begin
  for v_attempt in select * from public.learner_lesson_attempts loop
    select required_item_count into v_required
    from public.lesson_progress_manifests
    where pathway_id = v_attempt.pathway_id
      and lesson_id = v_attempt.lesson_id
      and content_version = v_attempt.content_version;

    select coalesce(array_agg(item_id order by ordinal), array[]::text[]) into v_completed
    from (
      select distinct i.item_id, i.ordinal
      from public.lesson_progress_items i
      join public.learner_progress_events e
        on e.attempt_id = v_attempt.id and e.item_id = i.item_id
      where i.pathway_id = v_attempt.pathway_id
        and i.lesson_id = v_attempt.lesson_id
        and i.content_version = v_attempt.content_version
        and i.required
        and i.kind = 'knowledge_check'
        and e.event_type = 'knowledge_check_attempted'
        and e.answer_correct is true
    ) completed;

    select item_id into v_next_item
    from public.lesson_progress_items
    where pathway_id = v_attempt.pathway_id
      and lesson_id = v_attempt.lesson_id
      and content_version = v_attempt.content_version
      and required
      and not (item_id = any(v_completed))
    order by ordinal limit 1;

    select exists (
      select 1
      from public.learner_progress_events
      where attempt_id = v_attempt.id
        and event_type = 'knowledge_check_attempted'
    ) into v_has_quiz_attempt;

    update public.learner_lesson_attempts
    set completed_item_ids = v_completed,
        next_item_id = v_next_item,
        completion_percent = floor(cardinality(v_completed)::numeric * 100 / v_required)::integer,
        status = case
          when cardinality(v_completed) = v_required then 'completed'
          when v_has_quiz_attempt then 'in_progress'
          else 'not_started'
        end,
        completed_at = case when cardinality(v_completed) = v_required then coalesce(completed_at, now()) else null end
    where id = v_attempt.id;

    if cardinality(v_completed) = v_required and not exists (
      select 1
      from public.learner_progress_events
      where attempt_id = v_attempt.id
        and event_type = 'lesson_completed'
        and metadata @> '{"completionRule": "quiz-only-v1"}'::jsonb
    ) then
      insert into public.learner_progress_events (
        user_id, attempt_id, idempotency_key, event_type, metadata
      ) values (
        v_attempt.user_id, v_attempt.id, gen_random_uuid(), 'lesson_completed',
        '{"completionRule": "quiz-only-v1"}'::jsonb
      );
    end if;
  end loop;
end;
$$;

commit;
