begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_wireless_networking', 'lesson_wireless_fundamentals', 1, 3)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_wireless_networking', 'lesson_wireless_fundamentals', 1, 'wireless_fundamentals_section_what_wireless_networking_is', 1, 'section', 'What wireless networking is', 'what-wireless-networking-is', false),
  ('path_wireless_networking', 'lesson_wireless_fundamentals', 1, 'wireless_fundamentals_section_radio_frequency_bands_and_channels', 2, 'section', 'Radio frequency bands and channels', 'radio-frequency-bands-and-channels', false),
  ('path_wireless_networking', 'lesson_wireless_fundamentals', 1, 'wireless_fundamentals_section_wireless_network_roles_and_topologies', 3, 'section', 'Wireless network roles and topologies', 'wireless-network-roles-and-topologies', false),
  ('path_wireless_networking', 'lesson_wireless_fundamentals', 1, 'wireless_fundamentals_section_csma_ca_and_collision_avoidance', 4, 'section', 'CSMA/CA and collision avoidance', 'csma-ca-and-collision-avoidance', false),
  ('path_wireless_networking', 'lesson_wireless_fundamentals', 1, 'wireless_fundamentals_interactive_interactive_csma_ca_and_the_hidden_node_problem', 5, 'interactive', 'Interactive CSMA/CA and the hidden node problem', 'interactive-csma-ca-and-the-hidden-node-problem', false),
  ('path_wireless_networking', 'lesson_wireless_fundamentals', 1, 'wireless_fundamentals_section_signal_strength_and_interference', 6, 'section', 'Signal strength and interference', 'signal-strength-and-interference', false),
  ('path_wireless_networking', 'lesson_wireless_fundamentals', 1, 'wireless_fundamentals_section_inspect_wireless_evidence', 7, 'section', 'Inspect wireless evidence', 'inspect-wireless-evidence', false),
  ('path_wireless_networking', 'lesson_wireless_fundamentals', 1, 'wireless_fundamentals_section_guided_channel_planning_practice', 8, 'section', 'Guided channel-planning practice', 'guided-channel-planning-practice', false),
  ('path_wireless_networking', 'lesson_wireless_fundamentals', 1, 'wireless_fundamentals_section_troubleshoot_wireless_basics', 9, 'section', 'Troubleshoot wireless basics', 'troubleshoot-wireless-basics', false),
  ('path_wireless_networking', 'lesson_wireless_fundamentals', 1, 'wireless_fundamentals_check_1', 10, 'knowledge_check', 'Knowledge check 1', 'wireless-fundamentals-check-1', true),
  ('path_wireless_networking', 'lesson_wireless_fundamentals', 1, 'wireless_fundamentals_check_2', 11, 'knowledge_check', 'Knowledge check 2', 'wireless-fundamentals-check-2', true),
  ('path_wireless_networking', 'lesson_wireless_fundamentals', 1, 'wireless_fundamentals_check_3', 12, 'knowledge_check', 'Knowledge check 3', 'wireless-fundamentals-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
