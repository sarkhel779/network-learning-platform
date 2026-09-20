begin;

insert into public.lesson_progress_manifests (
  pathway_id, lesson_id, content_version, required_item_count
) values
  ('path_networking_foundations', 'lesson_how_networks_communicate', 1, 1),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 2),
  ('path_networking_foundations', 'lesson_hubs', 1, 1),
  ('path_networking_foundations', 'lesson_bridges', 1, 1),
  ('path_networking_foundations', 'lesson_switches', 1, 1),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 3),
  ('path_networking_foundations', 'lesson_physical_and_logical_addressing', 1, 3),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 2),
  ('path_networking_foundations', 'lesson_computer_network_basics_final_quiz', 1, 8)
on conflict (pathway_id, lesson_id, content_version) do update set
  required_item_count = excluded.required_item_count;

-- Move the prior optional rows out of the active ordinal range. Current rows are
-- restored below, while retired rows remain addressable by historical events.
update public.lesson_progress_items
set ordinal = ordinal + 100
where pathway_id = 'path_networking_foundations'
  and content_version = 1
  and lesson_id in (
    'lesson_how_networks_communicate',
    'lesson_hosts_and_network_devices',
    'lesson_routers_default_gateways_and_network_boundaries',
    'lesson_osi_and_tcp_ip_models'
  )
  and ordinal < 100;

insert into public.lesson_progress_items (
  pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required
) values
  ('path_networking_foundations', 'lesson_how_networks_communicate', 1, 'how_networks_communicate_section_what_is_a_computer_network', 1, 'section', 'What is a computer network?', 'what-is-a-computer-network', false),
  ('path_networking_foundations', 'lesson_how_networks_communicate', 1, 'how_networks_communicate_section_why_networks_exist', 2, 'section', 'Why networks exist', 'why-networks-exist', false),
  ('path_networking_foundations', 'lesson_how_networks_communicate', 1, 'how_networks_communicate_section_lan_wan_and_the_internet', 3, 'section', 'LAN, WAN, and the Internet', 'lan-wan-and-the-internet', false),
  ('path_networking_foundations', 'lesson_how_networks_communicate', 1, 'how_networks_communicate_section_end_and_intermediary_devices', 4, 'section', 'End and intermediary devices', 'end-and-intermediary-devices', false),
  ('path_networking_foundations', 'lesson_how_networks_communicate', 1, 'how_networks_communicate_interactive_identify_device_roles', 5, 'interactive', 'Identify device roles', 'identify-device-roles', false),
  ('path_networking_foundations', 'lesson_how_networks_communicate', 1, 'how_networks_communicate_check_1', 6, 'knowledge_check', 'Knowledge check 1', 'how-networks-communicate-check-1', true),

  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_what_makes_a_device_a_host', 1, 'section', 'What makes a device a host?', 'what-makes-a-device-a-host', false),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_network_interfaces', 2, 'section', 'Network interfaces', 'network-interfaces', false),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_clients_and_servers', 3, 'section', 'Clients and servers', 'clients-and-servers', false),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_one_host_more_than_one_role', 4, 'section', 'One host, more than one role', 'one-host-more-than-one-role', false),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_interactive_classify_host_roles', 5, 'interactive', 'Classify host roles', 'classify-host-roles', false),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_check_1', 6, 'knowledge_check', 'Knowledge check 1', 'hosts-and-network-devices-check-1', true),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_check_2', 7, 'knowledge_check', 'Knowledge check 2', 'hosts-and-network-devices-check-2', true),

  ('path_networking_foundations', 'lesson_hubs', 1, 'hubs_section_what_is_a_hub', 1, 'section', 'What is a hub?', 'what-is-a-hub', false),
  ('path_networking_foundations', 'lesson_hubs', 1, 'hubs_section_why_hubs_existed', 2, 'section', 'Why hubs existed', 'why-hubs-existed', false),
  ('path_networking_foundations', 'lesson_hubs', 1, 'hubs_section_shared_traffic_and_bandwidth', 3, 'section', 'Shared traffic and bandwidth', 'shared-traffic-and-bandwidth', false),
  ('path_networking_foundations', 'lesson_hubs', 1, 'hubs_interactive_repeat_a_signal', 4, 'interactive', 'Repeat a signal', 'repeat-a-signal', false),
  ('path_networking_foundations', 'lesson_hubs', 1, 'hubs_check_1', 5, 'knowledge_check', 'Knowledge check 1', 'hubs-check-1', true),

  ('path_networking_foundations', 'lesson_bridges', 1, 'bridges_section_what_is_a_bridge', 1, 'section', 'What is a bridge?', 'what-is-a-bridge', false),
  ('path_networking_foundations', 'lesson_bridges', 1, 'bridges_section_why_bridges_were_introduced', 2, 'section', 'Why bridges were introduced', 'why-bridges-were-introduced', false),
  ('path_networking_foundations', 'lesson_bridges', 1, 'bridges_section_network_segments', 3, 'section', 'Network segments', 'network-segments', false),
  ('path_networking_foundations', 'lesson_bridges', 1, 'bridges_interactive_compare_segments', 4, 'interactive', 'Compare segments', 'compare-segments', false),
  ('path_networking_foundations', 'lesson_bridges', 1, 'bridges_check_1', 5, 'knowledge_check', 'Knowledge check 1', 'bridges-check-1', true),

  ('path_networking_foundations', 'lesson_switches', 1, 'switches_section_what_is_a_switch', 1, 'section', 'What is a switch?', 'what-is-a-switch', false),
  ('path_networking_foundations', 'lesson_switches', 1, 'switches_section_switch_ports', 2, 'section', 'Switch ports', 'switch-ports', false),
  ('path_networking_foundations', 'lesson_switches', 1, 'switches_section_more_selective_than_a_hub', 3, 'section', 'More selective than a hub', 'more-selective-than-a-hub', false),
  ('path_networking_foundations', 'lesson_switches', 1, 'switches_section_switches_and_routers', 4, 'section', 'Switches and routers', 'switches-and-routers', false),
  ('path_networking_foundations', 'lesson_switches', 1, 'switches_interactive_match_hosts_to_ports', 5, 'interactive', 'Match hosts to ports', 'match-hosts-to-ports', false),
  ('path_networking_foundations', 'lesson_switches', 1, 'switches_check_1', 6, 'knowledge_check', 'Knowledge check 1', 'switches-check-1', true),

  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_what_a_router_does', 1, 'section', 'What a router does', 'what-a-router-does', false),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_router_interfaces', 2, 'section', 'Router interfaces', 'router-interfaces', false),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_network_boundaries', 3, 'section', 'Network boundaries', 'network-boundaries', false),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_section_default_gateway', 4, 'section', 'The default gateway', 'default-gateway', false),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_interactive_place_the_router', 5, 'interactive', 'Place the router', 'place-the-router', false),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_check_1', 6, 'knowledge_check', 'Knowledge check 1', 'routers-default-gateways-and-network-boundaries-check-1', true),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_check_2', 7, 'knowledge_check', 'Knowledge check 2', 'routers-default-gateways-and-network-boundaries-check-2', true),
  ('path_networking_foundations', 'lesson_routers_default_gateways_and_network_boundaries', 1, 'routers_default_gateways_and_network_boundaries_check_3', 8, 'knowledge_check', 'Knowledge check 3', 'routers-default-gateways-and-network-boundaries-check-3', true),

  ('path_networking_foundations', 'lesson_physical_and_logical_addressing', 1, 'physical_and_logical_addressing_section_why_networks_use_addresses', 1, 'section', 'Why networks use addresses', 'why-networks-use-addresses', false),
  ('path_networking_foundations', 'lesson_physical_and_logical_addressing', 1, 'physical_and_logical_addressing_section_mac_addresses', 2, 'section', 'MAC addresses', 'mac-addresses', false),
  ('path_networking_foundations', 'lesson_physical_and_logical_addressing', 1, 'physical_and_logical_addressing_section_universal_local_and_individual_group', 3, 'section', 'Universal/local and individual/group bits', 'universal-local-and-individual-group', false),
  ('path_networking_foundations', 'lesson_physical_and_logical_addressing', 1, 'physical_and_logical_addressing_section_ip_addresses', 4, 'section', 'IP addresses', 'ip-addresses', false),
  ('path_networking_foundations', 'lesson_physical_and_logical_addressing', 1, 'physical_and_logical_addressing_interactive_inspect_address_formats', 5, 'interactive', 'Inspect address formats', 'inspect-address-formats', false),
  ('path_networking_foundations', 'lesson_physical_and_logical_addressing', 1, 'physical_and_logical_addressing_check_1', 6, 'knowledge_check', 'Knowledge check 1', 'physical-and-logical-addressing-check-1', true),
  ('path_networking_foundations', 'lesson_physical_and_logical_addressing', 1, 'physical_and_logical_addressing_check_2', 7, 'knowledge_check', 'Knowledge check 2', 'physical-and-logical-addressing-check-2', true),
  ('path_networking_foundations', 'lesson_physical_and_logical_addressing', 1, 'physical_and_logical_addressing_check_3', 8, 'knowledge_check', 'Knowledge check 3', 'physical-and-logical-addressing-check-3', true),

  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_section_why_layers', 1, 'section', 'Why layered models exist', 'why-layers', false),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_section_osi_model', 2, 'section', 'The seven OSI layers', 'osi-model', false),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_section_tcp_ip_model', 3, 'section', 'The four-layer TCP/IP model', 'tcp-ip-model', false),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_section_model_mapping', 4, 'section', 'OSI-to-TCP/IP mapping', 'model-mapping', false),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_interactive_encapsulation_lab', 5, 'interactive', 'Interactive encapsulation and decapsulation', 'encapsulation-lab', false),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_check_1', 6, 'knowledge_check', 'Knowledge check 1', 'osi-and-tcp-ip-models-check-1', true),
  ('path_networking_foundations', 'lesson_osi_and_tcp_ip_models', 1, 'osi_and_tcp_ip_models_check_2', 7, 'knowledge_check', 'Knowledge check 2', 'osi-and-tcp-ip-models-check-2', true),

  ('path_networking_foundations', 'lesson_computer_network_basics_final_quiz', 1, 'computer_network_basics_final_quiz_section_assessment_overview', 1, 'section', 'Assessment overview', 'assessment-overview', false),
  ('path_networking_foundations', 'lesson_computer_network_basics_final_quiz', 1, 'computer_network_basics_final_quiz_check_1', 2, 'knowledge_check', 'Knowledge check 1', 'computer-network-basics-final-quiz-check-1', true),
  ('path_networking_foundations', 'lesson_computer_network_basics_final_quiz', 1, 'computer_network_basics_final_quiz_check_2', 3, 'knowledge_check', 'Knowledge check 2', 'computer-network-basics-final-quiz-check-2', true),
  ('path_networking_foundations', 'lesson_computer_network_basics_final_quiz', 1, 'computer_network_basics_final_quiz_check_3', 4, 'knowledge_check', 'Knowledge check 3', 'computer-network-basics-final-quiz-check-3', true),
  ('path_networking_foundations', 'lesson_computer_network_basics_final_quiz', 1, 'computer_network_basics_final_quiz_check_4', 5, 'knowledge_check', 'Knowledge check 4', 'computer-network-basics-final-quiz-check-4', true),
  ('path_networking_foundations', 'lesson_computer_network_basics_final_quiz', 1, 'computer_network_basics_final_quiz_check_5', 6, 'knowledge_check', 'Knowledge check 5', 'computer-network-basics-final-quiz-check-5', true),
  ('path_networking_foundations', 'lesson_computer_network_basics_final_quiz', 1, 'computer_network_basics_final_quiz_check_6', 7, 'knowledge_check', 'Knowledge check 6', 'computer-network-basics-final-quiz-check-6', true),
  ('path_networking_foundations', 'lesson_computer_network_basics_final_quiz', 1, 'computer_network_basics_final_quiz_check_7', 8, 'knowledge_check', 'Knowledge check 7', 'computer-network-basics-final-quiz-check-7', true),
  ('path_networking_foundations', 'lesson_computer_network_basics_final_quiz', 1, 'computer_network_basics_final_quiz_check_8', 9, 'knowledge_check', 'Knowledge check 8', 'computer-network-basics-final-quiz-check-8', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal,
  kind = excluded.kind,
  label = excluded.label,
  anchor = excluded.anchor,
  required = excluded.required;

do $$
declare
  v_legacy record;
  v_target record;
  v_target_attempt_id uuid;
  v_completed_at timestamptz;
begin
  for v_legacy in
    select *
    from public.learner_lesson_attempts
    where pathway_id = 'path_networking_foundations'
      and lesson_id = 'lesson_hubs_bridges_and_switches'
      and content_version = 1
      and is_current
      and status = 'completed'
  loop
    v_completed_at := coalesce(v_legacy.completed_at, v_legacy.updated_at);

    for v_target in
      select * from (values
        ('lesson_hubs'::text, 'hubs_check_1'::text, 'hubs-check-1'::text),
        ('lesson_bridges'::text, 'bridges_check_1'::text, 'bridges-check-1'::text),
        ('lesson_switches'::text, 'switches_check_1'::text, 'switches-check-1'::text)
      ) as targets(lesson_id, check_id, check_anchor)
    loop
      v_target_attempt_id := null;

      insert into public.learner_lesson_attempts (
        user_id, pathway_id, lesson_id, content_version, attempt_number,
        is_current, status, completed_item_ids, next_item_id, last_item_id,
        last_anchor, completion_percent, incorrect_check_count,
        started_at, completed_at, updated_at
      )
      select
        v_legacy.user_id, 'path_networking_foundations', v_target.lesson_id, 1, 1,
        true, 'completed', array[v_target.check_id], null, v_target.check_id,
        v_target.check_anchor, 100, 0,
        v_legacy.started_at, v_completed_at, v_completed_at
      where not exists (
        select 1
        from public.learner_lesson_attempts existing
        where existing.user_id = v_legacy.user_id
          and existing.pathway_id = 'path_networking_foundations'
          and existing.lesson_id = v_target.lesson_id
          and existing.content_version = 1
      )
      returning id into v_target_attempt_id;

      if v_target_attempt_id is not null then
        insert into public.learner_progress_events (
          user_id, attempt_id, idempotency_key, event_type, item_id,
          item_kind, anchor, answer_correct, metadata, created_at
        )
        select
          v_legacy.user_id, v_target_attempt_id, gen_random_uuid(),
          'knowledge_check_attempted', v_target.check_id,
          'knowledge_check', v_target.check_anchor, true,
          jsonb_build_object(
            'completionRule', 'legacy-split-carry-forward-v1',
            'sourceAttemptId', v_legacy.id::text
          ),
          v_completed_at
        where not exists (
          select 1 from public.learner_progress_events existing
          where existing.attempt_id = v_target_attempt_id
            and existing.event_type = 'knowledge_check_attempted'
            and existing.item_id = v_target.check_id
            and existing.answer_correct is true
            and existing.metadata @> '{"completionRule":"legacy-split-carry-forward-v1"}'::jsonb
        );

        insert into public.learner_progress_events (
          user_id, attempt_id, idempotency_key, event_type, metadata, created_at
        )
        select
          v_legacy.user_id, v_target_attempt_id, gen_random_uuid(),
          'lesson_completed',
          jsonb_build_object(
            'completionRule', 'legacy-split-carry-forward-v1',
            'sourceAttemptId', v_legacy.id::text
          ),
          v_completed_at
        where not exists (
          select 1 from public.learner_progress_events existing
          where existing.attempt_id = v_target_attempt_id
            and existing.event_type = 'lesson_completed'
            and existing.metadata @> '{"completionRule":"legacy-split-carry-forward-v1"}'::jsonb
        );
      end if;
    end loop;
  end loop;
end;
$$;

commit;
