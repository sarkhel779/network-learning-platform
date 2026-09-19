begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 15)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_section_why_routing_protocols_exist', 1, 'section', 'Why routing protocols exist', 'why-routing-protocols-exist', true),
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_section_static_vs_dynamic_routing', 2, 'section', 'Static vs. dynamic routing', 'static-vs-dynamic-routing', true),
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_section_distance_vector_vs_link_state', 3, 'section', 'Distance-vector vs. link-state', 'distance-vector-vs-link-state', true),
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_section_rip_basics', 4, 'section', 'RIP basics', 'rip-basics', true),
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_section_ospf_basics', 5, 'section', 'OSPF basics', 'ospf-basics', true),
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_section_bgp_basics', 6, 'section', 'BGP basics', 'bgp-basics', true),
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_interactive_interactive_protocol_selection', 7, 'interactive', 'Interactive protocol selection', 'interactive-protocol-selection', true),
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_section_choosing_a_routing_protocol', 8, 'section', 'Choosing a routing protocol', 'choosing-a-routing-protocol', true),
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_section_eigrp_basics', 9, 'section', 'EIGRP basics', 'eigrp-basics', true),
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_section_inspect_routing_protocol_evidence', 10, 'section', 'Inspect routing protocol evidence', 'inspect-routing-protocol-evidence', true),
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_section_guided_protocol_selection_practice', 11, 'section', 'Guided protocol-selection practice', 'guided-protocol-selection-practice', true),
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_section_troubleshoot_routing_protocols', 12, 'section', 'Troubleshoot routing protocols', 'troubleshoot-routing-protocols', true),
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_check_1', 13, 'knowledge_check', 'Knowledge check 1', 'routing-protocols-check-1', true),
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_check_2', 14, 'knowledge_check', 'Knowledge check 2', 'routing-protocols-check-2', true),
  ('path_networking_foundations', 'lesson_routing_protocols', 1, 'routing_protocols_check_3', 15, 'knowledge_check', 'Knowledge check 3', 'routing-protocols-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
