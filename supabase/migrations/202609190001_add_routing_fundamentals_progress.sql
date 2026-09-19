begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_routing_protocols', 'lesson_routing_fundamentals', 1, 12)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_routing_protocols', 'lesson_routing_fundamentals', 1, 'routing_fundamentals_section_why_routing_protocols_exist', 1, 'section', 'Why routing protocols exist', 'why-routing-protocols-exist', true),
  ('path_routing_protocols', 'lesson_routing_fundamentals', 1, 'routing_fundamentals_section_administrative_distance_and_trustworthiness', 2, 'section', 'Administrative distance and trustworthiness', 'administrative-distance-and-trustworthiness', true),
  ('path_routing_protocols', 'lesson_routing_fundamentals', 1, 'routing_fundamentals_section_how_routing_metrics_are_calculated', 3, 'section', 'How routing metrics are calculated', 'how-routing-metrics-are-calculated', true),
  ('path_routing_protocols', 'lesson_routing_fundamentals', 1, 'routing_fundamentals_section_distance_vector_link_state_and_path_vector', 4, 'section', 'Distance-vector, link-state, and path-vector', 'distance-vector-link-state-and-path-vector', true),
  ('path_routing_protocols', 'lesson_routing_fundamentals', 1, 'routing_fundamentals_interactive_interactive_route_selection', 5, 'interactive', 'Interactive route selection', 'interactive-route-selection', true),
  ('path_routing_protocols', 'lesson_routing_fundamentals', 1, 'routing_fundamentals_section_choosing_an_igp_or_egp', 6, 'section', 'Choosing an IGP or EGP', 'choosing-an-igp-or-egp', true),
  ('path_routing_protocols', 'lesson_routing_fundamentals', 1, 'routing_fundamentals_section_inspect_routing_table_evidence', 7, 'section', 'Inspect routing table evidence', 'inspect-routing-table-evidence', true),
  ('path_routing_protocols', 'lesson_routing_fundamentals', 1, 'routing_fundamentals_section_guided_metric_calculation_practice', 8, 'section', 'Guided metric-calculation practice', 'guided-metric-calculation-practice', true),
  ('path_routing_protocols', 'lesson_routing_fundamentals', 1, 'routing_fundamentals_section_troubleshoot_routing_selection', 9, 'section', 'Troubleshoot routing selection', 'troubleshoot-routing-selection', true),
  ('path_routing_protocols', 'lesson_routing_fundamentals', 1, 'routing_fundamentals_check_1', 10, 'knowledge_check', 'Knowledge check 1', 'routing-fundamentals-check-1', true),
  ('path_routing_protocols', 'lesson_routing_fundamentals', 1, 'routing_fundamentals_check_2', 11, 'knowledge_check', 'Knowledge check 2', 'routing-fundamentals-check-2', true),
  ('path_routing_protocols', 'lesson_routing_fundamentals', 1, 'routing_fundamentals_check_3', 12, 'knowledge_check', 'Knowledge check 3', 'routing-fundamentals-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
