begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 19)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_section_why_automatic_configuration_exists', 1, 'section', 'Why automatic configuration exists', 'why-automatic-configuration-exists', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_section_dhcp_roles', 2, 'section', 'DHCP roles', 'dhcp-roles', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_section_udp_ports_67_68', 3, 'section', 'UDP ports 67 and 68', 'udp-ports-67-68', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_section_broadcast_unicast_rules', 4, 'section', 'Broadcast and unicast rules', 'broadcast-unicast-rules', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_section_dhcp_packet_structure', 5, 'section', 'DHCP packet structure', 'dhcp-packet-structure', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_interactive_interactive_dora_journey', 6, 'interactive', 'Interactive DHCP DORA journey', 'interactive-dora-journey', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_section_lease_contents', 7, 'section', 'Lease contents', 'lease-contents', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_section_lease_lifecycle', 8, 'section', 'Lease lifecycle', 'lease-lifecycle', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_interactive_interactive_relay_helper', 9, 'interactive', 'Interactive relay and helper journey', 'interactive-relay-helper', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_section_dhcp_boundaries', 10, 'section', 'DHCP boundaries and DHCPv6/SLAAC', 'dhcp-boundaries', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_section_dhcp_evidence', 11, 'section', 'Common DHCP evidence', 'dhcp-evidence', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_section_summary', 12, 'section', 'Summary', 'summary', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_section_inspect_dhcp_evidence', 13, 'section', 'Inspect DHCP evidence', 'inspect-dhcp-evidence', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_section_guided_dora_diagnosis', 14, 'section', 'Guided direct-DORA diagnosis', 'guided-dora-diagnosis', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_section_guided_relay_diagnosis', 15, 'section', 'Guided relay diagnosis', 'guided-relay-diagnosis', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_section_troubleshoot_dhcp', 16, 'section', 'Troubleshoot DHCP', 'troubleshoot-dhcp', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_check_1', 17, 'knowledge_check', 'Knowledge check 1', 'dhcp-automatic-address-configuration-check-1', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_check_2', 18, 'knowledge_check', 'Knowledge check 2', 'dhcp-automatic-address-configuration-check-2', true),
  ('path_networking_foundations', 'lesson_dhcp_and_automatic_address_configuration', 1, 'dhcp_automatic_address_configuration_check_3', 19, 'knowledge_check', 'Knowledge check 3', 'dhcp-automatic-address-configuration-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
