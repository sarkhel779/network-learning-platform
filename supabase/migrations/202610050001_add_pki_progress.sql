begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_security_protocols', 'lesson_pki', 1, 3)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_security_protocols', 'lesson_pki', 1, 'pki_section_what_pki_is', 1, 'section', 'What PKI is', 'what-pki-is', false),
  ('path_security_protocols', 'lesson_pki', 1, 'pki_section_x509_certificates', 2, 'section', 'X.509 certificates', 'x509-certificates', false),
  ('path_security_protocols', 'lesson_pki', 1, 'pki_section_the_chain_of_trust', 3, 'section', 'The chain of trust', 'the-chain-of-trust', false),
  ('path_security_protocols', 'lesson_pki', 1, 'pki_section_certificate_validation', 4, 'section', 'Certificate validation', 'certificate-validation', false),
  ('path_security_protocols', 'lesson_pki', 1, 'pki_interactive_interactive_certificate_chain_validation', 5, 'interactive', 'Interactive certificate chain validation', 'interactive-certificate-chain-validation', false),
  ('path_security_protocols', 'lesson_pki', 1, 'pki_section_certificate_revocation', 6, 'section', 'Certificate revocation', 'certificate-revocation', false),
  ('path_security_protocols', 'lesson_pki', 1, 'pki_section_inspect_pki_evidence', 7, 'section', 'Inspect PKI evidence', 'inspect-pki-evidence', false),
  ('path_security_protocols', 'lesson_pki', 1, 'pki_section_guided_chain_of_trust_practice', 8, 'section', 'Guided chain-of-trust practice', 'guided-chain-of-trust-practice', false),
  ('path_security_protocols', 'lesson_pki', 1, 'pki_section_troubleshoot_pki', 9, 'section', 'Troubleshoot PKI', 'troubleshoot-pki', false),
  ('path_security_protocols', 'lesson_pki', 1, 'pki_check_1', 10, 'knowledge_check', 'Knowledge check 1', 'pki-check-1', true),
  ('path_security_protocols', 'lesson_pki', 1, 'pki_check_2', 11, 'knowledge_check', 'Knowledge check 2', 'pki-check-2', true),
  ('path_security_protocols', 'lesson_pki', 1, 'pki_check_3', 12, 'knowledge_check', 'Knowledge check 3', 'pki-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
