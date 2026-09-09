begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 18)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_section_why_routing_exists', 1, 'section', 'Why routing exists', 'why-routing-exists', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_section_route_table_anatomy', 2, 'section', 'Route-table anatomy', 'route-table-anatomy', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_section_route_sources', 3, 'section', 'Connected, static, learned, and default routes', 'route-sources', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_section_how_prefix_matching_works', 4, 'section', 'How prefix matching works', 'how-prefix-matching-works', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_interactive_interactive_route_selection', 5, 'interactive', 'Interactive route selection', 'interactive-route-selection', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_section_longest_prefix_match', 6, 'section', 'Longest-prefix match', 'longest-prefix-match', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_section_administrative_distance', 7, 'section', 'Administrative distance', 'administrative-distance', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_section_route_metric', 8, 'section', 'Route metric', 'route-metric', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_section_next_hop_outgoing_interface', 9, 'section', 'Next hop and outgoing interface', 'next-hop-outgoing-interface', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_interactive_interactive_hop_by_hop_forwarding', 10, 'interactive', 'Interactive hop-by-hop forwarding', 'interactive-hop-by-hop-forwarding', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_section_ipv4_ipv6_routing', 11, 'section', 'IPv4 and IPv6 routing', 'ipv4-ipv6-routing', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_section_no_route_packet_disposal', 12, 'section', 'No route and packet disposal', 'no-route-packet-disposal', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_section_inspect_routing_evidence', 13, 'section', 'Inspect routing evidence', 'inspect-routing-evidence', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_section_guided_routing_practice', 14, 'section', 'Guided routing practice', 'guided-routing-practice', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_section_troubleshoot_routing', 15, 'section', 'Troubleshoot routing', 'troubleshoot-routing', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_check_1', 16, 'knowledge_check', 'Knowledge check 1', 'routing-tables-and-default-routes-check-1', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_check_2', 17, 'knowledge_check', 'Knowledge check 2', 'routing-tables-and-default-routes-check-2', true),
  ('path_networking_foundations', 'lesson_routing_tables_and_default_routes', 1, 'routing_tables_and_default_routes_check_3', 18, 'knowledge_check', 'Knowledge check 3', 'routing-tables-and-default-routes-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
