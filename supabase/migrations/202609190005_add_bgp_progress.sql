begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_routing_protocols', 'lesson_bgp', 1, 12)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_routing_protocols', 'lesson_bgp', 1, 'bgp_section_what_bgp_is', 1, 'section', 'What BGP is', 'what-bgp-is', true),
  ('path_routing_protocols', 'lesson_bgp', 1, 'bgp_section_bgp_message_types', 2, 'section', 'BGP message types', 'bgp-message-types', true),
  ('path_routing_protocols', 'lesson_bgp', 1, 'bgp_section_the_bgp_finite_state_machine', 3, 'section', 'The BGP finite state machine', 'the-bgp-finite-state-machine', true),
  ('path_routing_protocols', 'lesson_bgp', 1, 'bgp_section_path_attributes', 4, 'section', 'Path attributes', 'path-attributes', true),
  ('path_routing_protocols', 'lesson_bgp', 1, 'bgp_interactive_interactive_bgp_session_establishment', 5, 'interactive', 'Interactive BGP session establishment', 'interactive-bgp-session-establishment', true),
  ('path_routing_protocols', 'lesson_bgp', 1, 'bgp_section_the_bgp_decision_process', 6, 'section', 'The BGP decision process', 'the-bgp-decision-process', true),
  ('path_routing_protocols', 'lesson_bgp', 1, 'bgp_section_inspect_bgp_evidence', 7, 'section', 'Inspect BGP evidence', 'inspect-bgp-evidence', true),
  ('path_routing_protocols', 'lesson_bgp', 1, 'bgp_section_guided_bgp_path_selection_practice', 8, 'section', 'Guided BGP path-selection practice', 'guided-bgp-path-selection-practice', true),
  ('path_routing_protocols', 'lesson_bgp', 1, 'bgp_section_troubleshoot_bgp', 9, 'section', 'Troubleshoot BGP', 'troubleshoot-bgp', true),
  ('path_routing_protocols', 'lesson_bgp', 1, 'bgp_check_1', 10, 'knowledge_check', 'Knowledge check 1', 'bgp-check-1', true),
  ('path_routing_protocols', 'lesson_bgp', 1, 'bgp_check_2', 11, 'knowledge_check', 'Knowledge check 2', 'bgp-check-2', true),
  ('path_routing_protocols', 'lesson_bgp', 1, 'bgp_check_3', 12, 'knowledge_check', 'Knowledge check 3', 'bgp-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
