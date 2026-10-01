begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_security_protocols', 'lesson_tls', 1, 3)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_security_protocols', 'lesson_tls', 1, 'tls_section_what_tls_is', 1, 'section', 'What TLS is', 'what-tls-is', false),
  ('path_security_protocols', 'lesson_tls', 1, 'tls_section_the_tls_handshake', 2, 'section', 'The TLS handshake', 'the-tls-handshake', false),
  ('path_security_protocols', 'lesson_tls', 1, 'tls_section_key_exchange_and_cipher_suites', 3, 'section', 'Key exchange and cipher suites', 'key-exchange-and-cipher-suites', false),
  ('path_security_protocols', 'lesson_tls', 1, 'tls_section_certificates_and_server_authentication', 4, 'section', 'Certificates and server authentication', 'certificates-and-server-authentication', false),
  ('path_security_protocols', 'lesson_tls', 1, 'tls_interactive_interactive_tls_handshake', 5, 'interactive', 'Interactive TLS handshake', 'interactive-tls-handshake', false),
  ('path_security_protocols', 'lesson_tls', 1, 'tls_section_tls_record_protocol_and_data_protection', 6, 'section', 'TLS record protocol and data protection', 'tls-record-protocol-and-data-protection', false),
  ('path_security_protocols', 'lesson_tls', 1, 'tls_section_inspect_tls_evidence', 7, 'section', 'Inspect TLS evidence', 'inspect-tls-evidence', false),
  ('path_security_protocols', 'lesson_tls', 1, 'tls_section_guided_tls_handshake_practice', 8, 'section', 'Guided TLS handshake practice', 'guided-tls-handshake-practice', false),
  ('path_security_protocols', 'lesson_tls', 1, 'tls_section_troubleshoot_tls', 9, 'section', 'Troubleshoot TLS', 'troubleshoot-tls', false),
  ('path_security_protocols', 'lesson_tls', 1, 'tls_check_1', 10, 'knowledge_check', 'Knowledge check 1', 'tls-check-1', true),
  ('path_security_protocols', 'lesson_tls', 1, 'tls_check_2', 11, 'knowledge_check', 'Knowledge check 2', 'tls-check-2', true),
  ('path_security_protocols', 'lesson_tls', 1, 'tls_check_3', 12, 'knowledge_check', 'Knowledge check 3', 'tls-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
