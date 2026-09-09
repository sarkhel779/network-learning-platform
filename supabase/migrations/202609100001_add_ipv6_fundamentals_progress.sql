begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 16)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_section_why_ipv6_exists', 1, 'section', 'Why IPv6 exists', 'why-ipv6-exists', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_section_address_structure_hex', 2, 'section', 'Address structure and hexadecimal', 'address-structure-hex', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_section_expand_shorten', 3, 'section', 'Expand and shorten addresses', 'expand-shorten', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_interactive_interactive_address_explorer', 4, 'interactive', 'Interactive address explorer', 'interactive-address-explorer', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_section_prefixes_interface_identifiers', 5, 'section', 'Prefixes and interface identifiers', 'prefixes-interface-identifiers', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_section_address_types_scopes', 6, 'section', 'Address types and scopes', 'address-types-scopes', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_section_no_broadcast', 7, 'section', 'IPv6 has no broadcast', 'no-broadcast', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_section_neighbor_discovery_icmpv6', 8, 'section', 'Neighbor Discovery and ICMPv6', 'neighbor-discovery-icmpv6', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_interactive_interactive_ndp_slaac', 9, 'interactive', 'Interactive NDP and SLAAC', 'interactive-ndp-slaac', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_section_default_router_local_delivery', 10, 'section', 'Local delivery or default router', 'default-router-local-delivery', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_section_inspect_ipv6_evidence', 11, 'section', 'Inspect IPv6 evidence', 'inspect-ipv6-evidence', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_section_practice_ipv6', 12, 'section', 'Practise IPv6 interpretation', 'practice-ipv6', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_section_troubleshoot_ipv6', 13, 'section', 'Troubleshoot IPv6', 'troubleshoot-ipv6', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_check_1', 14, 'knowledge_check', 'Knowledge check 1', 'ipv6-fundamentals-check-1', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_check_2', 15, 'knowledge_check', 'Knowledge check 2', 'ipv6-fundamentals-check-2', true),
  ('path_networking_foundations', 'lesson_ipv6_fundamentals', 1, 'ipv6_fundamentals_check_3', 16, 'knowledge_check', 'Knowledge check 3', 'ipv6-fundamentals-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
