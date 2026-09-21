begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_routing_protocols', 'lesson_ospf', 1, 3)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_routing_protocols', 'lesson_ospf', 1, 'ospf_section_what_ospf_is', 1, 'section', 'What OSPF is', 'what-ospf-is', false),
  ('path_routing_protocols', 'lesson_ospf', 1, 'ospf_section_ospf_cost_and_the_link_state_database', 2, 'section', 'OSPF cost and the link-state database', 'ospf-cost-and-the-link-state-database', false),
  ('path_routing_protocols', 'lesson_ospf', 1, 'ospf_section_ospf_packet_types', 3, 'section', 'OSPF packet types', 'ospf-packet-types', false),
  ('path_routing_protocols', 'lesson_ospf', 1, 'ospf_section_forming_an_ospf_adjacency', 4, 'section', 'Forming an OSPF adjacency', 'forming-an-ospf-adjacency', false),
  ('path_routing_protocols', 'lesson_ospf', 1, 'ospf_interactive_interactive_ospf_adjacency', 5, 'interactive', 'Interactive OSPF adjacency', 'interactive-ospf-adjacency', false),
  ('path_routing_protocols', 'lesson_ospf', 1, 'ospf_section_ospf_areas_and_lsa_types', 6, 'section', 'OSPF areas and LSA types', 'ospf-areas-and-lsa-types', false),
  ('path_routing_protocols', 'lesson_ospf', 1, 'ospf_section_inspect_ospf_evidence', 7, 'section', 'Inspect OSPF evidence', 'inspect-ospf-evidence', false),
  ('path_routing_protocols', 'lesson_ospf', 1, 'ospf_section_guided_ospf_cost_practice', 8, 'section', 'Guided OSPF cost practice', 'guided-ospf-cost-practice', false),
  ('path_routing_protocols', 'lesson_ospf', 1, 'ospf_section_troubleshoot_ospf', 9, 'section', 'Troubleshoot OSPF', 'troubleshoot-ospf', false),
  ('path_routing_protocols', 'lesson_ospf', 1, 'ospf_check_1', 10, 'knowledge_check', 'Knowledge check 1', 'ospf-check-1', true),
  ('path_routing_protocols', 'lesson_ospf', 1, 'ospf_check_2', 11, 'knowledge_check', 'Knowledge check 2', 'ospf-check-2', true),
  ('path_routing_protocols', 'lesson_ospf', 1, 'ospf_check_3', 12, 'knowledge_check', 'Knowledge check 3', 'ospf-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
