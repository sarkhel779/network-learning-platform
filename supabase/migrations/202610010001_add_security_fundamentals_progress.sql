begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_security_protocols', 'lesson_security_fundamentals', 1, 3)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_security_protocols', 'lesson_security_fundamentals', 1, 'security_fundamentals_section_why_network_security_matters', 1, 'section', 'Why network security matters', 'why-network-security-matters', false),
  ('path_security_protocols', 'lesson_security_fundamentals', 1, 'security_fundamentals_section_common_threats_and_attacks', 2, 'section', 'Common threats and attacks', 'common-threats-and-attacks', false),
  ('path_security_protocols', 'lesson_security_fundamentals', 1, 'security_fundamentals_section_symmetric_and_asymmetric_cryptography', 3, 'section', 'Symmetric and asymmetric cryptography', 'symmetric-and-asymmetric-cryptography', false),
  ('path_security_protocols', 'lesson_security_fundamentals', 1, 'security_fundamentals_section_hashing_and_integrity', 4, 'section', 'Hashing and integrity', 'hashing-and-integrity', false),
  ('path_security_protocols', 'lesson_security_fundamentals', 1, 'security_fundamentals_interactive_interactive_diffie_hellman_key_exchange', 5, 'interactive', 'Interactive Diffie-Hellman key exchange', 'interactive-diffie-hellman-key-exchange', false),
  ('path_security_protocols', 'lesson_security_fundamentals', 1, 'security_fundamentals_section_where_these_protocols_fit', 6, 'section', 'Where these protocols fit', 'where-these-protocols-fit', false),
  ('path_security_protocols', 'lesson_security_fundamentals', 1, 'security_fundamentals_section_inspect_security_evidence', 7, 'section', 'Inspect security evidence', 'inspect-security-evidence', false),
  ('path_security_protocols', 'lesson_security_fundamentals', 1, 'security_fundamentals_section_guided_cryptography_practice', 8, 'section', 'Guided cryptography practice', 'guided-cryptography-practice', false),
  ('path_security_protocols', 'lesson_security_fundamentals', 1, 'security_fundamentals_section_troubleshoot_security_basics', 9, 'section', 'Troubleshoot security basics', 'troubleshoot-security-basics', false),
  ('path_security_protocols', 'lesson_security_fundamentals', 1, 'security_fundamentals_check_1', 10, 'knowledge_check', 'Knowledge check 1', 'security-fundamentals-check-1', true),
  ('path_security_protocols', 'lesson_security_fundamentals', 1, 'security_fundamentals_check_2', 11, 'knowledge_check', 'Knowledge check 2', 'security-fundamentals-check-2', true),
  ('path_security_protocols', 'lesson_security_fundamentals', 1, 'security_fundamentals_check_3', 12, 'knowledge_check', 'Knowledge check 3', 'security-fundamentals-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
