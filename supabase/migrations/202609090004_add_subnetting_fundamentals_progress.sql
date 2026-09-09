begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 15)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_section_why_subnetting_exists', 1, 'section', 'Why subnetting exists', 'why-subnetting-exists', true),
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_section_prefix_length_and_mask', 2, 'section', 'Prefix length and subnet mask', 'prefix-length-and-mask', true),
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_section_network_and_host_portions', 3, 'section', 'Network and host portions', 'network-and-host-portions', true),
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_interactive_interactive_subnet_boundary', 4, 'interactive', 'Interactive subnet boundary', 'interactive-subnet-boundary', true),
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_section_repeatable_calculation_method', 5, 'section', 'A repeatable calculation method', 'repeatable-calculation-method', true),
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_section_ranges_and_capacity', 6, 'section', 'Ranges and capacity', 'ranges-and-capacity', true),
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_interactive_interactive_subnet_scenarios', 7, 'interactive', 'Interactive subnet scenarios', 'interactive-subnet-scenarios', true),
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_section_special_prefixes', 8, 'section', 'Special prefixes', 'special-prefixes', true),
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_section_local_or_gateway', 9, 'section', 'Local delivery or the default gateway', 'local-or-gateway', true),
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_section_inspect_subnet_evidence', 10, 'section', 'Inspect subnet evidence', 'inspect-subnet-evidence', true),
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_section_practice_subnet_planning', 11, 'section', 'Practice subnet planning', 'practice-subnet-planning', true),
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_section_troubleshoot_subnetting', 12, 'section', 'Troubleshoot subnetting', 'troubleshoot-subnetting', true),
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_check_1', 13, 'knowledge_check', 'Knowledge check 1', 'subnetting-fundamentals-check-1', true),
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_check_2', 14, 'knowledge_check', 'Knowledge check 2', 'subnetting-fundamentals-check-2', true),
  ('path_networking_foundations', 'lesson_subnetting_fundamentals', 1, 'subnetting_fundamentals_check_3', 15, 'knowledge_check', 'Knowledge check 3', 'subnetting-fundamentals-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
