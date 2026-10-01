begin;

insert into public.lesson_progress_manifests (
  pathway_id, lesson_id, content_version, required_item_count
) values (
  'path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 1
)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

-- Replace the previous advanced Routers catalog atomically with the approved
-- beginner lesson. Only the final knowledge check is required for completion.
delete from public.lesson_progress_items
where pathway_id = 'path_networking_foundations'
  and lesson_id = 'lesson_routers_default_gateways_and_network_boundaries'
  and content_version = 1;

insert into public.lesson_progress_items (
  pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required
) values
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_what_is_a_router', 1, 'section', 'What is a router?', 'what-is-a-router', false),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_router_interfaces', 2, 'section', 'Router interfaces', 'router-interfaces', false),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_routers_connect_networks', 3, 'section', 'Routers connect networks', 'routers-connect-networks', false),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_routers_as_default_gateways', 4, 'section', 'Routers as default gateways', 'routers-as-default-gateways', false),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_interactive_place_the_router', 5, 'interactive', 'Place the router', 'place-the-router', false),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_check_1', 6, 'knowledge_check', 'Knowledge check 1', 'routers-default-gateways-and-network-boundaries-check-1', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal,
  kind = excluded.kind,
  label = excluded.label,
  anchor = excluded.anchor,
  required = excluded.required;

-- Keep the quiz-only progress RPC aligned with the active catalog. Historical
-- events remain intact, but retired knowledge checks no longer inflate the
-- learner's incorrect-answer count.
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
        select count(distinct e.item_id)
        from public.learner_progress_events e
        join public.lesson_progress_items i
          on i.pathway_id = v_attempt.pathway_id
          and i.lesson_id = v_attempt.lesson_id
          and i.content_version = v_attempt.content_version
          and i.item_id = e.item_id
        where e.attempt_id = v_attempt.id
          and i.required
          and i.kind = 'knowledge_check'
          and e.event_type = 'knowledge_check_attempted'
          and e.answer_correct is false
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

-- Recalculate existing attempts against the replacement catalog. Learners who
-- already answered the surviving check correctly become complete; other
-- attempts point to that check instead of a removed item.
do $$
declare
  v_attempt public.learner_lesson_attempts;
  v_completed text[];
  v_next_item text;
  v_has_quiz_attempt boolean;
begin
  for v_attempt in
    select *
    from public.learner_lesson_attempts
    where pathway_id = 'path_networking_foundations'
      and lesson_id = 'lesson_routers_default_gateways_and_network_boundaries'
      and content_version = 1
  loop
    select coalesce(array_agg(item_id order by ordinal), array[]::text[])
    into v_completed
    from (
      select distinct i.item_id, i.ordinal
      from public.lesson_progress_items i
      join public.learner_progress_events e
        on e.attempt_id = v_attempt.id
        and e.item_id = i.item_id
      where i.pathway_id = v_attempt.pathway_id
        and i.lesson_id = v_attempt.lesson_id
        and i.content_version = v_attempt.content_version
        and i.required
        and i.kind = 'knowledge_check'
        and e.event_type = 'knowledge_check_attempted'
        and e.answer_correct is true
    ) completed;

    select item_id
    into v_next_item
    from public.lesson_progress_items
    where pathway_id = v_attempt.pathway_id
      and lesson_id = v_attempt.lesson_id
      and content_version = v_attempt.content_version
      and required
      and not (item_id = any(v_completed))
    order by ordinal
    limit 1;

    select exists (
      select 1
      from public.learner_progress_events
      where attempt_id = v_attempt.id
        and event_type = 'knowledge_check_attempted'
    ) into v_has_quiz_attempt;

    update public.learner_lesson_attempts
    set completed_item_ids = v_completed,
        next_item_id = v_next_item,
        completion_percent = cardinality(v_completed) * 100,
        incorrect_check_count = (
          select count(distinct e.item_id)
          from public.learner_progress_events e
          join public.lesson_progress_items i
            on i.pathway_id = v_attempt.pathway_id
            and i.lesson_id = v_attempt.lesson_id
            and i.content_version = v_attempt.content_version
            and i.item_id = e.item_id
          where e.attempt_id = v_attempt.id
            and i.required
            and i.kind = 'knowledge_check'
            and e.event_type = 'knowledge_check_attempted'
            and e.answer_correct is false
        ),
        status = case
          when cardinality(v_completed) = 1 then 'completed'
          when v_has_quiz_attempt then 'in_progress'
          else 'not_started'
        end,
        completed_at = case
          when cardinality(v_completed) = 1 then coalesce(completed_at, now())
          else null
        end
    where id = v_attempt.id;

    if cardinality(v_completed) = 1 and not exists (
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
