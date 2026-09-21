begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_routing_protocols', 'lesson_eigrp', 1, 3)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_routing_protocols', 'lesson_eigrp', 1, 'eigrp_section_what_eigrp_is', 1, 'section', 'What EIGRP is', 'what-eigrp-is', false),
  ('path_routing_protocols', 'lesson_eigrp', 1, 'eigrp_section_the_composite_metric', 2, 'section', 'The composite metric', 'the-composite-metric', false),
  ('path_routing_protocols', 'lesson_eigrp', 1, 'eigrp_section_dual_and_loop_free_paths', 3, 'section', 'DUAL and loop-free paths', 'dual-and-loop-free-paths', false),
  ('path_routing_protocols', 'lesson_eigrp', 1, 'eigrp_section_eigrp_packet_types', 4, 'section', 'EIGRP packet types', 'eigrp-packet-types', false),
  ('path_routing_protocols', 'lesson_eigrp', 1, 'eigrp_interactive_interactive_eigrp_dual', 5, 'interactive', 'Interactive EIGRP DUAL', 'interactive-eigrp-dual', false),
  ('path_routing_protocols', 'lesson_eigrp', 1, 'eigrp_section_eigrp_vs_classic_distance_vector', 6, 'section', 'EIGRP vs. classic distance-vector', 'eigrp-vs-classic-distance-vector', false),
  ('path_routing_protocols', 'lesson_eigrp', 1, 'eigrp_section_inspect_eigrp_evidence', 7, 'section', 'Inspect EIGRP evidence', 'inspect-eigrp-evidence', false),
  ('path_routing_protocols', 'lesson_eigrp', 1, 'eigrp_section_guided_eigrp_metric_practice', 8, 'section', 'Guided EIGRP metric practice', 'guided-eigrp-metric-practice', false),
  ('path_routing_protocols', 'lesson_eigrp', 1, 'eigrp_section_troubleshoot_eigrp', 9, 'section', 'Troubleshoot EIGRP', 'troubleshoot-eigrp', false),
  ('path_routing_protocols', 'lesson_eigrp', 1, 'eigrp_check_1', 10, 'knowledge_check', 'Knowledge check 1', 'eigrp-check-1', true),
  ('path_routing_protocols', 'lesson_eigrp', 1, 'eigrp_check_2', 11, 'knowledge_check', 'Knowledge check 2', 'eigrp-check-2', true),
  ('path_routing_protocols', 'lesson_eigrp', 1, 'eigrp_check_3', 12, 'knowledge_check', 'Knowledge check 3', 'eigrp-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
