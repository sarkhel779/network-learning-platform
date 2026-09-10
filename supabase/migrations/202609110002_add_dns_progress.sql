begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 21)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_why_name_resolution_exists', 1, 'section', 'Why name resolution exists', 'why-name-resolution-exists', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_dns_roles_responsibility_boundaries', 2, 'section', 'DNS roles and responsibility boundaries', 'dns-roles-responsibility-boundaries', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_domain_labels_zones_delegation', 3, 'section', 'Domain labels, zones, and delegation', 'domain-labels-zones-delegation', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_recursive_service_iterative_referrals', 4, 'section', 'Recursive service versus iterative referrals', 'recursive-service-iterative-referrals', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_interactive_complete_resolution', 5, 'interactive', 'Interactive complete DNS resolution', 'interactive-complete-resolution', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_dns_message_header_structure', 6, 'section', 'DNS message and header structure', 'dns-message-header-structure', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_record_types_selection_rules', 7, 'section', 'Common record types and selection rules', 'record-types-selection-rules', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_dns_transports', 8, 'section', 'UDP 53, TCP 53, EDNS, and encrypted DNS', 'dns-transports', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_caching_ttl_negative_caching', 9, 'section', 'Caching, TTL, and negative caching', 'caching-ttl-negative-caching', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_response_codes_nodata', 10, 'section', 'Response codes and NODATA', 'response-codes-nodata', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_reverse_dns', 11, 'section', 'Reverse DNS', 'reverse-dns', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_interactive_troubleshooting', 12, 'interactive', 'Interactive DNS troubleshooting', 'interactive-dns-troubleshooting', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_dns_command_capture_evidence', 13, 'section', 'Practical command and capture evidence', 'dns-command-capture-evidence', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_common_dns_misconceptions', 14, 'section', 'Common DNS misconceptions', 'common-dns-misconceptions', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_summary_next_steps', 15, 'section', 'Summary and next steps', 'summary-next-steps', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_cold_warm_cache_practice', 16, 'section', 'Cold and warm cache practice', 'cold-warm-cache-practice', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_record_selection_practice', 17, 'section', 'Record selection practice', 'record-selection-practice', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_section_dns_packet_capture_practice', 18, 'section', 'DNS packet and capture practice', 'dns-packet-capture-practice', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_check_1', 19, 'knowledge_check', 'Knowledge check 1', 'dns-name-resolution-check-1', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_check_2', 20, 'knowledge_check', 'Knowledge check 2', 'dns-name-resolution-check-2', true),
  ('path_networking_foundations', 'lesson_dns_and_name_resolution', 1, 'dns_name_resolution_check_3', 21, 'knowledge_check', 'Knowledge check 3', 'dns-name-resolution-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
