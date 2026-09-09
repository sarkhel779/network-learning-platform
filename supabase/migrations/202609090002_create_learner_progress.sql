create table public.lesson_progress_manifests (
  pathway_id text not null,
  lesson_id text not null,
  content_version integer not null check (content_version > 0),
  required_item_count integer not null check (required_item_count > 0),
  created_at timestamptz not null default now(),
  primary key (pathway_id, lesson_id, content_version)
);

create table public.lesson_progress_items (
  pathway_id text not null,
  lesson_id text not null,
  content_version integer not null,
  item_id text not null,
  ordinal integer not null check (ordinal > 0),
  kind text not null check (kind in ('section', 'interactive', 'knowledge_check')),
  label text not null check (char_length(label) between 1 and 200),
  anchor text not null,
  required boolean not null default true check (required),
  primary key (pathway_id, lesson_id, content_version, item_id),
  unique (pathway_id, lesson_id, content_version, ordinal),
  unique (pathway_id, lesson_id, content_version, anchor),
  foreign key (pathway_id, lesson_id, content_version)
    references public.lesson_progress_manifests (pathway_id, lesson_id, content_version)
    on delete cascade
);

create table public.learner_lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pathway_id text not null,
  lesson_id text not null,
  content_version integer not null,
  attempt_number integer not null check (attempt_number > 0),
  is_current boolean not null default true,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  completed_item_ids text[] not null default array[]::text[],
  next_item_id text,
  last_item_id text,
  last_anchor text,
  completion_percent integer not null default 0 check (completion_percent between 0 and 100),
  incorrect_check_count integer not null default 0 check (incorrect_check_count >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, pathway_id, lesson_id, content_version, attempt_number),
  foreign key (pathway_id, lesson_id, content_version)
    references public.lesson_progress_manifests (pathway_id, lesson_id, content_version)
);

create unique index learner_lesson_attempts_one_current
  on public.learner_lesson_attempts (user_id, pathway_id, lesson_id, content_version)
  where is_current;
create index learner_lesson_attempts_user_updated
  on public.learner_lesson_attempts (user_id, updated_at desc);

create table public.learner_progress_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id uuid not null references public.learner_lesson_attempts(id) on delete cascade,
  idempotency_key uuid not null,
  event_type text not null check (event_type in (
    'section_completed', 'interactive_completed', 'knowledge_check_attempted',
    'position_updated', 'lesson_completed', 'lesson_restarted'
  )),
  item_id text,
  item_kind text check (item_kind is null or item_kind in ('section', 'interactive', 'knowledge_check')),
  anchor text,
  answer_correct boolean,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key),
  check (
    (event_type in ('lesson_completed', 'lesson_restarted') and item_id is null and item_kind is null)
    or
    (event_type not in ('lesson_completed', 'lesson_restarted') and item_id is not null and item_kind is not null)
  )
);

alter table public.lesson_progress_manifests enable row level security;
alter table public.lesson_progress_items enable row level security;
alter table public.learner_lesson_attempts enable row level security;
alter table public.learner_progress_events enable row level security;

create policy "progress manifests are readable"
on public.lesson_progress_manifests for select to anon, authenticated using (true);
create policy "progress manifest items are readable"
on public.lesson_progress_items for select to anon, authenticated using (true);
create policy "learners read own lesson attempts"
on public.learner_lesson_attempts for select to authenticated
using ((select auth.uid()) = user_id);
create policy "learners read own progress events"
on public.learner_progress_events for select to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.lesson_progress_manifests from anon, authenticated;
revoke all on public.lesson_progress_items from anon, authenticated;
revoke all on public.learner_lesson_attempts from anon, authenticated;
revoke all on public.learner_progress_events from anon, authenticated;
grant select on public.lesson_progress_manifests, public.lesson_progress_items to anon, authenticated;
grant select on public.learner_lesson_attempts, public.learner_progress_events to authenticated;

create function public.record_learner_progress_event(
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
  if p_event_type <> case v_item.kind
    when 'section' then 'section_completed'
    when 'interactive' then 'interactive_completed'
    else 'knowledge_check_attempted' end then
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
       where pathway_id = p_pathway_id and lesson_id = p_lesson_id and content_version = p_content_version
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
      and e.event_type in ('section_completed', 'interactive_completed', 'knowledge_check_attempted')
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
      completion_percent = floor(array_length(v_completed, 1)::numeric * 100 / v_required)::integer,
      incorrect_check_count = (
        select count(distinct item_id) from public.learner_progress_events
        where attempt_id = v_attempt.id and event_type = 'knowledge_check_attempted' and answer_correct is false
      ),
      status = case when array_length(v_completed, 1) = v_required then 'completed' else 'in_progress' end,
      completed_at = case when array_length(v_completed, 1) = v_required then coalesce(completed_at, now()) else null end,
      updated_at = now()
  where id = v_attempt.id
  returning * into v_attempt;

  if v_attempt.status = 'completed' and not exists (
    select 1 from public.learner_progress_events where attempt_id = v_attempt.id and event_type = 'lesson_completed'
  ) then
    insert into public.learner_progress_events (
      user_id, attempt_id, idempotency_key, event_type, metadata
    ) values (v_user_id, v_attempt.id, gen_random_uuid(), 'lesson_completed', '{}'::jsonb);
  end if;
  return v_attempt;
end;
$$;

create function public.restart_learner_lesson(
  p_pathway_id text,
  p_lesson_id text,
  p_content_version integer,
  p_idempotency_key uuid
)
returns public.learner_lesson_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempt public.learner_lesson_attempts;
  v_previous public.learner_lesson_attempts;
  v_existing_attempt_id uuid;
  v_next_number integer;
begin
  if v_user_id is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    v_user_id::text || ':' || p_pathway_id || ':' || p_lesson_id || ':' || p_content_version::text,
    0
  ));
  if not exists (
    select 1 from public.lesson_progress_manifests
    where pathway_id = p_pathway_id and lesson_id = p_lesson_id and content_version = p_content_version
  ) then raise exception 'stale_content_version' using errcode = '22023'; end if;

  select attempt_id into v_existing_attempt_id from public.learner_progress_events
  where user_id = v_user_id and idempotency_key = p_idempotency_key;
  if found then
    select * into v_attempt from public.learner_lesson_attempts where id = v_existing_attempt_id;
    return v_attempt;
  end if;

  select * into v_previous from public.learner_lesson_attempts
  where user_id = v_user_id and pathway_id = p_pathway_id and lesson_id = p_lesson_id
    and content_version = p_content_version and is_current
  for update;
  select coalesce(max(attempt_number), 0) + 1 into v_next_number
  from public.learner_lesson_attempts
  where user_id = v_user_id and pathway_id = p_pathway_id and lesson_id = p_lesson_id
    and content_version = p_content_version;
  if v_previous.id is not null then
    update public.learner_lesson_attempts set is_current = false, updated_at = now() where id = v_previous.id;
  end if;

  insert into public.learner_lesson_attempts (
    user_id, pathway_id, lesson_id, content_version, attempt_number, next_item_id
  ) values (
    v_user_id, p_pathway_id, p_lesson_id, p_content_version, v_next_number,
    (select item_id from public.lesson_progress_items
     where pathway_id = p_pathway_id and lesson_id = p_lesson_id and content_version = p_content_version
     order by ordinal limit 1)
  ) returning * into v_attempt;
  insert into public.learner_progress_events (
    user_id, attempt_id, idempotency_key, event_type, metadata
  ) values (v_user_id, v_attempt.id, p_idempotency_key, 'lesson_restarted', '{}'::jsonb);
  return v_attempt;
end;
$$;

revoke all on function public.record_learner_progress_event(text, text, integer, uuid, text, text, text, text, boolean, jsonb) from public, anon;
revoke all on function public.restart_learner_lesson(text, text, integer, uuid) from public, anon;
grant execute on function public.record_learner_progress_event(text, text, integer, uuid, text, text, text, text, boolean, jsonb) to authenticated;
grant execute on function public.restart_learner_lesson(text, text, integer, uuid) to authenticated;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_networking_foundations', 'lesson_how_networks_communicate', 1, 5),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 9),
  ('path_networking_foundations', 'lesson_cables_fibre_wireless_and_network_connections', 1, 11),
  ('path_networking_foundations', 'lesson_hubs_bridges_and_switches', 1, 11),
  ('path_networking_foundations', 'lesson_unicast_broadcast_and_multicast_communication', 1, 13),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 12),
  ('path_networking_foundations', 'lesson_access_points_modems_onts_and_firewalls', 1, 11),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 10),
  ('path_networking_foundations', 'lesson_first_packet_journey_through_a_small_network', 1, 10),
  ('path_networking_foundations', 'lesson_ethernet_frames_and_mac_addresses', 1, 10),
  ('path_networking_foundations', 'lesson_how_switches_learn_and_forward', 1, 10),
  ('path_networking_foundations', 'lesson_arp_and_local_delivery', 1, 10),
  ('path_networking_foundations', 'lesson_vlans_access_ports_and_trunks', 1, 11);

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_networking_foundations', 'lesson_how_networks_communicate', 1, 'how_networks_communicate_section_communication_decisions', 1, 'section', 'Communication decisions', 'communication-decisions', true),
  ('path_networking_foundations', 'lesson_how_networks_communicate', 1, 'how_networks_communicate_interactive_packet_journey', 2, 'interactive', 'Interactive packet journey', 'packet-journey', true),
  ('path_networking_foundations', 'lesson_how_networks_communicate', 1, 'how_networks_communicate_section_wireshark_check', 3, 'section', 'Basic Wireshark check', 'wireshark-check', true),
  ('path_networking_foundations', 'lesson_how_networks_communicate', 1, 'how_networks_communicate_section_interview_scenario', 4, 'section', 'Interview scenario', 'interview-scenario', true),
  ('path_networking_foundations', 'lesson_how_networks_communicate', 1, 'how_networks_communicate_check_1', 5, 'knowledge_check', 'Knowledge check 1', 'how-networks-communicate-check-1', true),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_what_is_a_host', 1, 'section', 'What is a host?', 'what-is-a-host', true),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_connecting_devices', 2, 'section', 'Devices that connect hosts', 'connecting-devices', true),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_explore_topology', 3, 'section', 'Explore the topology', 'explore-topology', true),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_interactive_compare_journeys', 4, 'interactive', 'Compare packet journeys', 'compare-journeys', true),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_windows_checks', 5, 'section', 'Windows checks', 'windows-checks', true),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_wireshark_checks', 6, 'section', 'Wireshark checks', 'wireshark-checks', true),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_summary', 7, 'section', 'Summary', 'summary', true),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_check_1', 8, 'knowledge_check', 'Knowledge check 1', 'hosts-and-network-devices-check-1', true),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_check_2', 9, 'knowledge_check', 'Knowledge check 2', 'hosts-and-network-devices-check-2', true),
  ('path_networking_foundations', 'lesson_cables_fibre_wireless_and_network_connections', 1, 'cables_fibre_wireless_and_network_connections_section_how_connections_carry_data', 1, 'section', 'How connections carry data', 'how-connections-carry-data', true),
  ('path_networking_foundations', 'lesson_cables_fibre_wireless_and_network_connections', 1, 'cables_fibre_wireless_and_network_connections_section_connection_qualities', 2, 'section', 'Connection qualities', 'connection-qualities', true),
  ('path_networking_foundations', 'lesson_cables_fibre_wireless_and_network_connections', 1, 'cables_fibre_wireless_and_network_connections_section_copper_ethernet', 3, 'section', 'Copper Ethernet', 'copper-ethernet', true),
  ('path_networking_foundations', 'lesson_cables_fibre_wireless_and_network_connections', 1, 'cables_fibre_wireless_and_network_connections_section_fibre_connections', 4, 'section', 'Fibre connections', 'fibre-connections', true),
  ('path_networking_foundations', 'lesson_cables_fibre_wireless_and_network_connections', 1, 'cables_fibre_wireless_and_network_connections_section_wireless_connections', 5, 'section', 'Wireless connections', 'wireless-connections', true),
  ('path_networking_foundations', 'lesson_cables_fibre_wireless_and_network_connections', 1, 'cables_fibre_wireless_and_network_connections_interactive_compare_media', 6, 'interactive', 'Compare connection media', 'compare-media', true),
  ('path_networking_foundations', 'lesson_cables_fibre_wireless_and_network_connections', 1, 'cables_fibre_wireless_and_network_connections_interactive_design_a_connection', 7, 'interactive', 'Design a connection', 'design-a-connection', true),
  ('path_networking_foundations', 'lesson_cables_fibre_wireless_and_network_connections', 1, 'cables_fibre_wireless_and_network_connections_section_diagnose_link_symptoms', 8, 'section', 'Diagnose link symptoms', 'diagnose-link-symptoms', true),
  ('path_networking_foundations', 'lesson_cables_fibre_wireless_and_network_connections', 1, 'cables_fibre_wireless_and_network_connections_check_1', 9, 'knowledge_check', 'Knowledge check 1', 'cables-fibre-wireless-and-network-connections-check-1', true),
  ('path_networking_foundations', 'lesson_cables_fibre_wireless_and_network_connections', 1, 'cables_fibre_wireless_and_network_connections_check_2', 10, 'knowledge_check', 'Knowledge check 2', 'cables-fibre-wireless-and-network-connections-check-2', true),
  ('path_networking_foundations', 'lesson_cables_fibre_wireless_and_network_connections', 1, 'cables_fibre_wireless_and_network_connections_check_3', 11, 'knowledge_check', 'Knowledge check 3', 'cables-fibre-wireless-and-network-connections-check-3', true),
  ('path_networking_foundations', 'lesson_hubs_bridges_and_switches', 1, 'hubs_bridges_and_switches_section_one_local_ethernet_conversation', 1, 'section', 'One local Ethernet conversation', 'one-local-ethernet-conversation', true),
  ('path_networking_foundations', 'lesson_hubs_bridges_and_switches', 1, 'hubs_bridges_and_switches_section_what_a_hub_does', 2, 'section', 'What a hub does', 'what-a-hub-does', true),
  ('path_networking_foundations', 'lesson_hubs_bridges_and_switches', 1, 'hubs_bridges_and_switches_section_why_bridges_changed_ethernet', 3, 'section', 'Why bridges changed Ethernet', 'why-bridges-changed-ethernet', true),
  ('path_networking_foundations', 'lesson_hubs_bridges_and_switches', 1, 'hubs_bridges_and_switches_section_how_a_switch_learns', 4, 'section', 'How a switch learns', 'how-a-switch-learns', true),
  ('path_networking_foundations', 'lesson_hubs_bridges_and_switches', 1, 'hubs_bridges_and_switches_section_how_a_switch_forwards', 5, 'section', 'How a switch forwards', 'how-a-switch-forwards', true),
  ('path_networking_foundations', 'lesson_hubs_bridges_and_switches', 1, 'hubs_bridges_and_switches_interactive_compare_hub_bridge_switch', 6, 'interactive', 'Compare hub, bridge and switch', 'compare-hub-bridge-switch', true),
  ('path_networking_foundations', 'lesson_hubs_bridges_and_switches', 1, 'hubs_bridges_and_switches_interactive_forward_the_frame', 7, 'interactive', 'Forward the frame', 'forward-the-frame', true),
  ('path_networking_foundations', 'lesson_hubs_bridges_and_switches', 1, 'hubs_bridges_and_switches_section_diagnose_local_switching_symptoms', 8, 'section', 'Diagnose local switching symptoms', 'diagnose-local-switching-symptoms', true),
  ('path_networking_foundations', 'lesson_hubs_bridges_and_switches', 1, 'hubs_bridges_and_switches_check_1', 9, 'knowledge_check', 'Knowledge check 1', 'hubs-bridges-and-switches-check-1', true),
  ('path_networking_foundations', 'lesson_hubs_bridges_and_switches', 1, 'hubs_bridges_and_switches_check_2', 10, 'knowledge_check', 'Knowledge check 2', 'hubs-bridges-and-switches-check-2', true),
  ('path_networking_foundations', 'lesson_hubs_bridges_and_switches', 1, 'hubs_bridges_and_switches_check_3', 11, 'knowledge_check', 'Knowledge check 3', 'hubs-bridges-and-switches-check-3', true),
  ('path_networking_foundations', 'lesson_unicast_broadcast_and_multicast_communication', 1, 'unicast_broadcast_and_multicast_communication_section_why_delivery_scope_matters', 1, 'section', 'Why delivery scope matters', 'why-delivery-scope-matters', true),
  ('path_networking_foundations', 'lesson_unicast_broadcast_and_multicast_communication', 1, 'unicast_broadcast_and_multicast_communication_section_unicast_one_destination', 2, 'section', 'Unicast: one intended destination', 'unicast-one-destination', true),
  ('path_networking_foundations', 'lesson_unicast_broadcast_and_multicast_communication', 1, 'unicast_broadcast_and_multicast_communication_section_broadcast_local_domain', 3, 'section', 'Broadcast: the local broadcast domain', 'broadcast-local-domain', true),
  ('path_networking_foundations', 'lesson_unicast_broadcast_and_multicast_communication', 1, 'unicast_broadcast_and_multicast_communication_section_multicast_receiver_group', 4, 'section', 'Multicast: an interested receiver group', 'multicast-receiver-group', true),
  ('path_networking_foundations', 'lesson_unicast_broadcast_and_multicast_communication', 1, 'unicast_broadcast_and_multicast_communication_section_unknown_unicast_is_not_broadcast', 5, 'section', 'Unknown unicast is not broadcast', 'unknown-unicast-is-not-broadcast', true),
  ('path_networking_foundations', 'lesson_unicast_broadcast_and_multicast_communication', 1, 'unicast_broadcast_and_multicast_communication_section_compare_delivery_types', 6, 'section', 'Compare delivery types', 'compare-delivery-types', true),
  ('path_networking_foundations', 'lesson_unicast_broadcast_and_multicast_communication', 1, 'unicast_broadcast_and_multicast_communication_interactive_delivery_scope_player', 7, 'interactive', 'Interactive delivery-scope player', 'delivery-scope-player', true),
  ('path_networking_foundations', 'lesson_unicast_broadcast_and_multicast_communication', 1, 'unicast_broadcast_and_multicast_communication_interactive_predict_delivery', 8, 'interactive', 'Predict traffic delivery', 'predict-delivery', true),
  ('path_networking_foundations', 'lesson_unicast_broadcast_and_multicast_communication', 1, 'unicast_broadcast_and_multicast_communication_section_diagnose_delivery_scope', 9, 'section', 'Diagnose delivery-scope scenarios', 'diagnose-delivery-scope', true),
  ('path_networking_foundations', 'lesson_unicast_broadcast_and_multicast_communication', 1, 'unicast_broadcast_and_multicast_communication_section_packet_evidence', 10, 'section', 'Packet evidence', 'packet-evidence', true),
  ('path_networking_foundations', 'lesson_unicast_broadcast_and_multicast_communication', 1, 'unicast_broadcast_and_multicast_communication_check_1', 11, 'knowledge_check', 'Knowledge check 1', 'unicast-broadcast-and-multicast-communication-check-1', true),
  ('path_networking_foundations', 'lesson_unicast_broadcast_and_multicast_communication', 1, 'unicast_broadcast_and_multicast_communication_check_2', 12, 'knowledge_check', 'Knowledge check 2', 'unicast-broadcast-and-multicast-communication-check-2', true),
  ('path_networking_foundations', 'lesson_unicast_broadcast_and_multicast_communication', 1, 'unicast_broadcast_and_multicast_communication_check_3', 13, 'knowledge_check', 'Knowledge check 3', 'unicast-broadcast-and-multicast-communication-check-3', true),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_why_network_boundaries_matter', 1, 'section', 'Why network boundaries matter', 'why-network-boundaries-matter', true),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_what_a_router_does', 2, 'section', 'What a router does', 'what-a-router-does', true),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_local_or_remote', 3, 'section', 'Local or remote?', 'local-or-remote', true),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_default_gateway', 4, 'section', 'The default gateway', 'default-gateway', true),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_direct_and_routed_delivery', 5, 'section', 'Direct delivery and routed delivery', 'direct-and-routed-delivery', true),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_what_changes_at_each_hop', 6, 'section', 'What changes at each hop', 'what-changes-at-each-hop', true),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_interactive_route_decision_player', 7, 'interactive', 'Interactive route-decision player', 'route-decision-player', true),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_interactive_read_a_basic_routing_table', 8, 'interactive', 'Read a basic routing table', 'read-a-basic-routing-table', true),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_diagnose_gateway_boundary_problems', 9, 'section', 'Diagnose gateway and boundary problems', 'diagnose-gateway-boundary-problems', true),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_check_1', 10, 'knowledge_check', 'Knowledge check 1', 'routers-default-gateways-and-network-boundaries-check-1', true),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_check_2', 11, 'knowledge_check', 'Knowledge check 2', 'routers-default-gateways-and-network-boundaries-check-2', true),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_check_3', 12, 'knowledge_check', 'Knowledge check 3', 'routers-default-gateways-and-network-boundaries-check-3', true),
  ('path_networking_foundations', 'lesson_access_points_modems_onts_and_firewalls', 1, 'access_points_modems_onts_and_firewalls_section_one_box_many_jobs', 1, 'section', 'One box, many jobs', 'one-box-many-jobs', true),
  ('path_networking_foundations', 'lesson_access_points_modems_onts_and_firewalls', 1, 'access_points_modems_onts_and_firewalls_section_access_points_bridge_wireless', 2, 'section', 'Access points bridge wireless', 'access-points-bridge-wireless', true),
  ('path_networking_foundations', 'lesson_access_points_modems_onts_and_firewalls', 1, 'access_points_modems_onts_and_firewalls_section_modems_and_onts_convert_signals', 3, 'section', 'Modems and ONTs convert signals', 'modems-and-onts-convert-signals', true),
  ('path_networking_foundations', 'lesson_access_points_modems_onts_and_firewalls', 1, 'access_points_modems_onts_and_firewalls_section_routers_and_firewalls_set_boundaries', 4, 'section', 'Routers and firewalls set boundaries', 'routers-and-firewalls-set-boundaries', true),
  ('path_networking_foundations', 'lesson_access_points_modems_onts_and_firewalls', 1, 'access_points_modems_onts_and_firewalls_section_compare_edge_devices', 5, 'section', 'Compare edge devices', 'compare-edge-devices', true),
  ('path_networking_foundations', 'lesson_access_points_modems_onts_and_firewalls', 1, 'access_points_modems_onts_and_firewalls_interactive_interactive_edge_journey', 6, 'interactive', 'Interactive edge-device journey', 'interactive-edge-journey', true),
  ('path_networking_foundations', 'lesson_access_points_modems_onts_and_firewalls', 1, 'access_points_modems_onts_and_firewalls_section_identify_device_roles', 7, 'section', 'Identify device roles', 'identify-device-roles', true),
  ('path_networking_foundations', 'lesson_access_points_modems_onts_and_firewalls', 1, 'access_points_modems_onts_and_firewalls_section_diagnose_edge_failures', 8, 'section', 'Diagnose edge failures', 'diagnose-edge-failures', true),
  ('path_networking_foundations', 'lesson_access_points_modems_onts_and_firewalls', 1, 'access_points_modems_onts_and_firewalls_check_1', 9, 'knowledge_check', 'Knowledge check 1', 'access-points-modems-onts-and-firewalls-check-1', true),
  ('path_networking_foundations', 'lesson_access_points_modems_onts_and_firewalls', 1, 'access_points_modems_onts_and_firewalls_check_2', 10, 'knowledge_check', 'Knowledge check 2', 'access-points-modems-onts-and-firewalls-check-2', true),
  ('path_networking_foundations', 'lesson_access_points_modems_onts_and_firewalls', 1, 'access_points_modems_onts_and_firewalls_check_3', 11, 'knowledge_check', 'Knowledge check 3', 'access-points-modems-onts-and-firewalls-check-3', true),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_section_why_layers', 1, 'section', 'Why layered models exist', 'why-layers', true),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_section_osi_model', 2, 'section', 'The seven OSI layers', 'osi-model', true),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_section_tcp_ip_model', 3, 'section', 'The four-layer TCP/IP model', 'tcp-ip-model', true),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_section_model_mapping', 4, 'section', 'OSI-to-TCP/IP mapping', 'model-mapping', true),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_interactive_encapsulation_lab', 5, 'interactive', 'Interactive encapsulation and decapsulation', 'encapsulation-lab', true),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_section_device_layer_scope', 6, 'section', 'What each network device examines', 'device-layer-scope', true),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_section_wireshark_layers', 7, 'section', 'Wireshark layer identification', 'wireshark-layers', true),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_section_troubleshooting_interview', 8, 'section', 'Troubleshooting and interview scenarios', 'troubleshooting-interview', true),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_check_1', 9, 'knowledge_check', 'Knowledge check 1', 'osi-and-tcp-ip-models-check-1', true),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_check_2', 10, 'knowledge_check', 'Knowledge check 2', 'osi-and-tcp-ip-models-check-2', true),
  ('path_networking_foundations', 'lesson_first_packet_journey_through_a_small_network', 1, 'first_packet_journey_through_a_small_network_section_before_the_first_frame', 1, 'section', 'Before the first frame', 'before-the-first-frame', true),
  ('path_networking_foundations', 'lesson_first_packet_journey_through_a_small_network', 1, 'first_packet_journey_through_a_small_network_section_resolve_the_next_hop', 2, 'section', 'Resolve the next hop', 'resolve-the-next-hop', true),
  ('path_networking_foundations', 'lesson_first_packet_journey_through_a_small_network', 1, 'first_packet_journey_through_a_small_network_section_switch_and_route_the_request', 3, 'section', 'Switch and route the request', 'switch-and-route-the-request', true),
  ('path_networking_foundations', 'lesson_first_packet_journey_through_a_small_network', 1, 'first_packet_journey_through_a_small_network_section_return_traffic', 4, 'section', 'Return traffic', 'return-traffic', true),
  ('path_networking_foundations', 'lesson_first_packet_journey_through_a_small_network', 1, 'first_packet_journey_through_a_small_network_interactive_complete_packet_journey', 5, 'interactive', 'Complete packet journey', 'complete-packet-journey', true),
  ('path_networking_foundations', 'lesson_first_packet_journey_through_a_small_network', 1, 'first_packet_journey_through_a_small_network_section_match_evidence_to_the_journey', 6, 'section', 'Match evidence to the journey', 'match-evidence-to-the-journey', true),
  ('path_networking_foundations', 'lesson_first_packet_journey_through_a_small_network', 1, 'first_packet_journey_through_a_small_network_section_troubleshoot_the_first_failed_hop', 7, 'section', 'Troubleshoot the first failed hop', 'troubleshoot-the-first-failed-hop', true),
  ('path_networking_foundations', 'lesson_first_packet_journey_through_a_small_network', 1, 'first_packet_journey_through_a_small_network_check_1', 8, 'knowledge_check', 'Knowledge check 1', 'first-packet-journey-through-a-small-network-check-1', true),
  ('path_networking_foundations', 'lesson_first_packet_journey_through_a_small_network', 1, 'first_packet_journey_through_a_small_network_check_2', 9, 'knowledge_check', 'Knowledge check 2', 'first-packet-journey-through-a-small-network-check-2', true),
  ('path_networking_foundations', 'lesson_first_packet_journey_through_a_small_network', 1, 'first_packet_journey_through_a_small_network_check_3', 10, 'knowledge_check', 'Knowledge check 3', 'first-packet-journey-through-a-small-network-check-3', true),
  ('path_networking_foundations', 'lesson_ethernet_frames_and_mac_addresses', 1, 'ethernet_frames_and_mac_addresses_section_ethernet_delivers_on_the_local_link', 1, 'section', 'Ethernet delivers on the local link', 'ethernet-delivers-on-the-local-link', true),
  ('path_networking_foundations', 'lesson_ethernet_frames_and_mac_addresses', 1, 'ethernet_frames_and_mac_addresses_section_read_an_ethernet_frame', 2, 'section', 'Read an Ethernet frame', 'read-an-ethernet-frame', true),
  ('path_networking_foundations', 'lesson_ethernet_frames_and_mac_addresses', 1, 'ethernet_frames_and_mac_addresses_section_understand_mac_addresses', 3, 'section', 'Understand MAC addresses', 'understand-mac-addresses', true),
  ('path_networking_foundations', 'lesson_ethernet_frames_and_mac_addresses', 1, 'ethernet_frames_and_mac_addresses_section_delivery_addresses', 4, 'section', 'Unicast, broadcast, multicast and unknown unicast', 'delivery-addresses', true),
  ('path_networking_foundations', 'lesson_ethernet_frames_and_mac_addresses', 1, 'ethernet_frames_and_mac_addresses_interactive_interactive_frame_delivery', 5, 'interactive', 'Interactive frame delivery', 'interactive-frame-delivery', true),
  ('path_networking_foundations', 'lesson_ethernet_frames_and_mac_addresses', 1, 'ethernet_frames_and_mac_addresses_section_inspect_frame_evidence', 6, 'section', 'Inspect frame evidence', 'inspect-frame-evidence', true),
  ('path_networking_foundations', 'lesson_ethernet_frames_and_mac_addresses', 1, 'ethernet_frames_and_mac_addresses_section_diagnose_frame_problems', 7, 'section', 'Diagnose frame problems', 'diagnose-frame-problems', true),
  ('path_networking_foundations', 'lesson_ethernet_frames_and_mac_addresses', 1, 'ethernet_frames_and_mac_addresses_check_1', 8, 'knowledge_check', 'Knowledge check 1', 'ethernet-frames-and-mac-addresses-check-1', true),
  ('path_networking_foundations', 'lesson_ethernet_frames_and_mac_addresses', 1, 'ethernet_frames_and_mac_addresses_check_2', 9, 'knowledge_check', 'Knowledge check 2', 'ethernet-frames-and-mac-addresses-check-2', true),
  ('path_networking_foundations', 'lesson_ethernet_frames_and_mac_addresses', 1, 'ethernet_frames_and_mac_addresses_check_3', 10, 'knowledge_check', 'Knowledge check 3', 'ethernet-frames-and-mac-addresses-check-3', true),
  ('path_networking_foundations', 'lesson_how_switches_learn_and_forward', 1, 'how_switches_learn_and_forward_section_the_switch_decision_cycle', 1, 'section', 'The switch decision cycle', 'the-switch-decision-cycle', true),
  ('path_networking_foundations', 'lesson_how_switches_learn_and_forward', 1, 'how_switches_learn_and_forward_section_learn_the_source_address', 2, 'section', 'Learn the source address', 'learn-the-source-address', true),
  ('path_networking_foundations', 'lesson_how_switches_learn_and_forward', 1, 'how_switches_learn_and_forward_section_look_up_the_destination', 3, 'section', 'Look up the destination', 'look-up-the-destination', true),
  ('path_networking_foundations', 'lesson_how_switches_learn_and_forward', 1, 'how_switches_learn_and_forward_section_forward_filter_or_flood', 4, 'section', 'Forward, filter or flood', 'forward-filter-or-flood', true),
  ('path_networking_foundations', 'lesson_how_switches_learn_and_forward', 1, 'how_switches_learn_and_forward_interactive_interactive_switch_learning', 5, 'interactive', 'Interactive switch learning', 'interactive-switch-learning', true),
  ('path_networking_foundations', 'lesson_how_switches_learn_and_forward', 1, 'how_switches_learn_and_forward_interactive_read_mac_table_evidence', 6, 'interactive', 'Read MAC-table evidence', 'read-mac-table-evidence', true),
  ('path_networking_foundations', 'lesson_how_switches_learn_and_forward', 1, 'how_switches_learn_and_forward_section_diagnose_switching_behaviour', 7, 'section', 'Diagnose switching behaviour', 'diagnose-switching-behaviour', true),
  ('path_networking_foundations', 'lesson_how_switches_learn_and_forward', 1, 'how_switches_learn_and_forward_check_1', 8, 'knowledge_check', 'Knowledge check 1', 'how-switches-learn-and-forward-check-1', true),
  ('path_networking_foundations', 'lesson_how_switches_learn_and_forward', 1, 'how_switches_learn_and_forward_check_2', 9, 'knowledge_check', 'Knowledge check 2', 'how-switches-learn-and-forward-check-2', true),
  ('path_networking_foundations', 'lesson_how_switches_learn_and_forward', 1, 'how_switches_learn_and_forward_check_3', 10, 'knowledge_check', 'Knowledge check 3', 'how-switches-learn-and-forward-check-3', true),
  ('path_networking_foundations', 'lesson_arp_and_local_delivery', 1, 'arp_and_local_delivery_section_why_arp_exists', 1, 'section', 'Why ARP exists', 'why-arp-exists', true),
  ('path_networking_foundations', 'lesson_arp_and_local_delivery', 1, 'arp_and_local_delivery_section_choose_the_next_hop_first', 2, 'section', 'Choose the next hop first', 'choose-the-next-hop-first', true),
  ('path_networking_foundations', 'lesson_arp_and_local_delivery', 1, 'arp_and_local_delivery_section_request_reply_and_cache', 3, 'section', 'Request, reply and cache', 'request-reply-and-cache', true),
  ('path_networking_foundations', 'lesson_arp_and_local_delivery', 1, 'arp_and_local_delivery_interactive_interactive_arp_journey', 4, 'interactive', 'Interactive ARP journey', 'interactive-arp-journey', true),
  ('path_networking_foundations', 'lesson_arp_and_local_delivery', 1, 'arp_and_local_delivery_interactive_arp_variants_and_boundaries', 5, 'interactive', 'ARP variants and boundaries', 'arp-variants-and-boundaries', true),
  ('path_networking_foundations', 'lesson_arp_and_local_delivery', 1, 'arp_and_local_delivery_section_inspect_neighbour_evidence', 6, 'section', 'Inspect neighbour evidence', 'inspect-neighbour-evidence', true),
  ('path_networking_foundations', 'lesson_arp_and_local_delivery', 1, 'arp_and_local_delivery_section_troubleshoot_arp_methodically', 7, 'section', 'Troubleshoot ARP methodically', 'troubleshoot-arp-methodically', true),
  ('path_networking_foundations', 'lesson_arp_and_local_delivery', 1, 'arp_and_local_delivery_check_1', 8, 'knowledge_check', 'Knowledge check 1', 'arp-and-local-delivery-check-1', true),
  ('path_networking_foundations', 'lesson_arp_and_local_delivery', 1, 'arp_and_local_delivery_check_2', 9, 'knowledge_check', 'Knowledge check 2', 'arp-and-local-delivery-check-2', true),
  ('path_networking_foundations', 'lesson_arp_and_local_delivery', 1, 'arp_and_local_delivery_check_3', 10, 'knowledge_check', 'Knowledge check 3', 'arp-and-local-delivery-check-3', true),
  ('path_networking_foundations', 'lesson_vlans_access_ports_and_trunks', 1, 'vlans_access_ports_and_trunks_section_why_vlans_exist', 1, 'section', 'Why VLANs exist', 'why-vlans-exist', true),
  ('path_networking_foundations', 'lesson_vlans_access_ports_and_trunks', 1, 'vlans_access_ports_and_trunks_section_access_ports_and_membership', 2, 'section', 'Access ports and membership', 'access-ports-and-membership', true),
  ('path_networking_foundations', 'lesson_vlans_access_ports_and_trunks', 1, 'vlans_access_ports_and_trunks_interactive_interactive_vlan_membership', 3, 'interactive', 'Interactive VLAN membership', 'interactive-vlan-membership', true),
  ('path_networking_foundations', 'lesson_vlans_access_ports_and_trunks', 1, 'vlans_access_ports_and_trunks_section_trunks_and_802_1q', 4, 'section', 'Trunks and 802.1Q', 'trunks-and-802-1q', true),
  ('path_networking_foundations', 'lesson_vlans_access_ports_and_trunks', 1, 'vlans_access_ports_and_trunks_interactive_interactive_tag_journey', 5, 'interactive', 'Interactive tag journey', 'interactive-tag-journey', true),
  ('path_networking_foundations', 'lesson_vlans_access_ports_and_trunks', 1, 'vlans_access_ports_and_trunks_section_allowed_vlans_and_routing_boundary', 6, 'section', 'Allowed VLANs and routing boundary', 'allowed-vlans-and-routing-boundary', true),
  ('path_networking_foundations', 'lesson_vlans_access_ports_and_trunks', 1, 'vlans_access_ports_and_trunks_section_read_port_and_capture_evidence', 7, 'section', 'Read port and capture evidence', 'read-port-and-capture-evidence', true),
  ('path_networking_foundations', 'lesson_vlans_access_ports_and_trunks', 1, 'vlans_access_ports_and_trunks_section_solve_vlan_reachability', 8, 'section', 'Solve VLAN reachability', 'solve-vlan-reachability', true),
  ('path_networking_foundations', 'lesson_vlans_access_ports_and_trunks', 1, 'vlans_access_ports_and_trunks_check_1', 9, 'knowledge_check', 'Knowledge check 1', 'vlans-access-ports-and-trunks-check-1', true),
  ('path_networking_foundations', 'lesson_vlans_access_ports_and_trunks', 1, 'vlans_access_ports_and_trunks_check_2', 10, 'knowledge_check', 'Knowledge check 2', 'vlans-access-ports-and-trunks-check-2', true),
  ('path_networking_foundations', 'lesson_vlans_access_ports_and_trunks', 1, 'vlans_access_ports_and_trunks_check_3', 11, 'knowledge_check', 'Knowledge check 3', 'vlans-access-ports-and-trunks-check-3', true);
