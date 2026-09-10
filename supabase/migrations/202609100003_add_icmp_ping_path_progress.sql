begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 18)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_section_why_icmp_exists', 1, 'section', 'Why ICMP exists', 'why-icmp-exists', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_section_icmp_message_anatomy', 2, 'section', 'ICMP message anatomy', 'icmp-message-anatomy', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_section_informational_and_error_messages', 3, 'section', 'Informational and error messages', 'informational-and-error-messages', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_section_echo_request_and_reply', 4, 'section', 'Echo request and echo reply', 'echo-request-and-reply', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_interactive_interactive_ping_evidence', 5, 'interactive', 'Interactive ping and ICMP evidence', 'interactive-ping-evidence', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_section_what_successful_ping_proves', 6, 'section', 'What successful ping proves', 'what-successful-ping-proves', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_section_timeouts_loss_and_rtt', 7, 'section', 'Timeouts, loss, and round-trip time', 'timeouts-loss-and-rtt', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_section_destination_unreachable', 8, 'section', 'Destination Unreachable', 'destination-unreachable', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_section_ttl_exceeded', 9, 'section', 'TTL Exceeded', 'ttl-exceeded', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_interactive_interactive_traceroute_discovery', 10, 'interactive', 'Interactive traceroute path discovery', 'interactive-traceroute-discovery', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_section_why_traceroute_can_be_incomplete', 11, 'section', 'Why traceroute can be incomplete', 'why-traceroute-can-be-incomplete', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_section_safe_conclusions', 12, 'section', 'Safe conclusions', 'safe-conclusions', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_section_inspect_icmp_evidence', 13, 'section', 'Inspect ICMP evidence', 'inspect-icmp-evidence', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_section_guided_icmp_diagnosis', 14, 'section', 'Guided ICMP diagnosis', 'guided-icmp-diagnosis', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_section_troubleshoot_icmp', 15, 'section', 'Troubleshoot ICMP', 'troubleshoot-icmp', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_check_1', 16, 'knowledge_check', 'Knowledge check 1', 'icmp-ping-and-path-discovery-check-1', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_check_2', 17, 'knowledge_check', 'Knowledge check 2', 'icmp-ping-and-path-discovery-check-2', true),
  ('path_networking_foundations', 'lesson_icmp_ping_and_path_discovery', 1, 'icmp_ping_and_path_discovery_check_3', 18, 'knowledge_check', 'Knowledge check 3', 'icmp-ping-and-path-discovery-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
