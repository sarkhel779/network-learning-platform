begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_security_protocols', 'lesson_ipsec', 1, 3)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_security_protocols', 'lesson_ipsec', 1, 'ipsec_section_what_ipsec_is', 1, 'section', 'What IPsec is', 'what-ipsec-is', false),
  ('path_security_protocols', 'lesson_ipsec', 1, 'ipsec_section_ike_and_security_associations', 2, 'section', 'IKE and security associations', 'ike-and-security-associations', false),
  ('path_security_protocols', 'lesson_ipsec', 1, 'ipsec_section_ah_and_esp', 3, 'section', 'AH and ESP', 'ah-and-esp', false),
  ('path_security_protocols', 'lesson_ipsec', 1, 'ipsec_section_transport_vs_tunnel_mode', 4, 'section', 'Transport vs. tunnel mode', 'transport-vs-tunnel-mode', false),
  ('path_security_protocols', 'lesson_ipsec', 1, 'ipsec_interactive_interactive_ipsec_tunnel_establishment', 5, 'interactive', 'Interactive IPsec tunnel establishment', 'interactive-ipsec-tunnel-establishment', false),
  ('path_security_protocols', 'lesson_ipsec', 1, 'ipsec_section_nat_traversal_and_practical_considerations', 6, 'section', 'NAT traversal and practical considerations', 'nat-traversal-and-practical-considerations', false),
  ('path_security_protocols', 'lesson_ipsec', 1, 'ipsec_section_ikev1_modes_main_aggressive_and_quick', 7, 'section', 'IKEv1 vs. IKEv2: modes and phases', 'ikev1-modes-main-aggressive-and-quick', false),
  ('path_security_protocols', 'lesson_ipsec', 1, 'ipsec_section_inspect_ipsec_evidence', 8, 'section', 'Inspect IPsec evidence', 'inspect-ipsec-evidence', false),
  ('path_security_protocols', 'lesson_ipsec', 1, 'ipsec_section_guided_ipsec_mode_practice', 9, 'section', 'Guided IPsec mode practice', 'guided-ipsec-mode-practice', false),
  ('path_security_protocols', 'lesson_ipsec', 1, 'ipsec_section_troubleshoot_ipsec', 10, 'section', 'Troubleshoot IPsec', 'troubleshoot-ipsec', false),
  ('path_security_protocols', 'lesson_ipsec', 1, 'ipsec_check_1', 11, 'knowledge_check', 'Knowledge check 1', 'ipsec-check-1', true),
  ('path_security_protocols', 'lesson_ipsec', 1, 'ipsec_check_2', 12, 'knowledge_check', 'Knowledge check 2', 'ipsec-check-2', true),
  ('path_security_protocols', 'lesson_ipsec', 1, 'ipsec_check_3', 13, 'knowledge_check', 'Knowledge check 3', 'ipsec-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
