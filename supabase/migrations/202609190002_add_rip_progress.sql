begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_routing_protocols', 'lesson_rip', 1, 12)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_routing_protocols', 'lesson_rip', 1, 'rip_section_what_rip_is', 1, 'section', 'What RIP is', 'what-rip-is', true),
  ('path_routing_protocols', 'lesson_rip', 1, 'rip_section_rip_packet_format', 2, 'section', 'RIP packet format', 'rip-packet-format', true),
  ('path_routing_protocols', 'lesson_rip', 1, 'rip_section_how_rip_updates_work', 3, 'section', 'How RIP updates work', 'how-rip-updates-work', true),
  ('path_routing_protocols', 'lesson_rip', 1, 'rip_section_preventing_routing_loops', 4, 'section', 'Preventing routing loops', 'preventing-routing-loops', true),
  ('path_routing_protocols', 'lesson_rip', 1, 'rip_interactive_interactive_rip_exchange', 5, 'interactive', 'Interactive RIP exchange', 'interactive-rip-exchange', true),
  ('path_routing_protocols', 'lesson_rip', 1, 'rip_section_rip_limits_and_ripng', 6, 'section', 'RIP''s limits and RIPng', 'rip-limits-and-ripng', true),
  ('path_routing_protocols', 'lesson_rip', 1, 'rip_section_inspect_rip_evidence', 7, 'section', 'Inspect RIP evidence', 'inspect-rip-evidence', true),
  ('path_routing_protocols', 'lesson_rip', 1, 'rip_section_guided_rip_convergence_practice', 8, 'section', 'Guided RIP convergence practice', 'guided-rip-convergence-practice', true),
  ('path_routing_protocols', 'lesson_rip', 1, 'rip_section_troubleshoot_rip', 9, 'section', 'Troubleshoot RIP', 'troubleshoot-rip', true),
  ('path_routing_protocols', 'lesson_rip', 1, 'rip_check_1', 10, 'knowledge_check', 'Knowledge check 1', 'rip-check-1', true),
  ('path_routing_protocols', 'lesson_rip', 1, 'rip_check_2', 11, 'knowledge_check', 'Knowledge check 2', 'rip-check-2', true),
  ('path_routing_protocols', 'lesson_rip', 1, 'rip_check_3', 12, 'knowledge_check', 'Knowledge check 3', 'rip-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
