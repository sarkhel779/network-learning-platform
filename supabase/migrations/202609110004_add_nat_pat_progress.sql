begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 15)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_section_ipv4_translation_boundary', 1, 'section', 'The IPv4 translation boundary', 'ipv4-translation-boundary', true),
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_section_nat_vocabulary_address_realms', 2, 'section', 'NAT vocabulary and address realms', 'nat-vocabulary-address-realms', true),
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_section_static_nat_port_forwarding', 3, 'section', 'Static NAT and port forwarding', 'static-nat-port-forwarding', true),
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_section_dynamic_nat_address_pools', 4, 'section', 'Dynamic NAT and address pools', 'dynamic-nat-address-pools', true),
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_section_pat_translation_table_state', 5, 'section', 'PAT and translation-table state', 'pat-translation-table-state', true),
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_section_complete_internet_packet_journey', 6, 'section', 'Complete Internet packet journey', 'complete-internet-packet-journey', true),
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_section_return_traffic_timeouts_failures', 7, 'section', 'Return traffic, timeouts, and failures', 'return-traffic-timeouts-failures', true),
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_interactive_journey', 8, 'interactive', 'Control the PAT journey', 'account-pat-journey', true),
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_mapping_lab', 9, 'interactive', 'Classify and reverse mappings', 'account-mapping-lab', true),
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_troubleshooting_lab', 10, 'interactive', 'Diagnose NAT failures', 'account-troubleshooting-lab', true),
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_check_public_1', 11, 'knowledge_check', 'Knowledge check 1', 'nat-pat-check-1', true),
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_check_public_2', 12, 'knowledge_check', 'Knowledge check 2', 'nat-pat-check-2', true),
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_check_account_1', 13, 'knowledge_check', 'Knowledge check 3', 'nat-pat-check-3', true),
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_check_account_2', 14, 'knowledge_check', 'Knowledge check 4', 'nat-pat-check-4', true),
  ('path_networking_foundations', 'lesson_nat_pat_and_the_complete_internet_packet_journey', 1, 'nat_pat_check_account_3', 15, 'knowledge_check', 'Knowledge check 5', 'nat-pat-check-5', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
