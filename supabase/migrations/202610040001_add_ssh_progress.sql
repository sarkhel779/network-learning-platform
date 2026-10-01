begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_security_protocols', 'lesson_ssh', 1, 3)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_security_protocols', 'lesson_ssh', 1, 'ssh_section_what_ssh_is', 1, 'section', 'What SSH is', 'what-ssh-is', false),
  ('path_security_protocols', 'lesson_ssh', 1, 'ssh_section_the_ssh_transport_layer', 2, 'section', 'The SSH transport layer', 'the-ssh-transport-layer', false),
  ('path_security_protocols', 'lesson_ssh', 1, 'ssh_section_ssh_authentication_methods', 3, 'section', 'SSH authentication methods', 'ssh-authentication-methods', false),
  ('path_security_protocols', 'lesson_ssh', 1, 'ssh_section_the_ssh_connection_protocol_and_channels', 4, 'section', 'The SSH connection protocol and channels', 'the-ssh-connection-protocol-and-channels', false),
  ('path_security_protocols', 'lesson_ssh', 1, 'ssh_interactive_interactive_ssh_key_authentication', 5, 'interactive', 'Interactive SSH key authentication', 'interactive-ssh-key-authentication', false),
  ('path_security_protocols', 'lesson_ssh', 1, 'ssh_section_host_key_verification_and_trust_on_first_use', 6, 'section', 'Host-key verification and trust-on-first-use', 'host-key-verification-and-trust-on-first-use', false),
  ('path_security_protocols', 'lesson_ssh', 1, 'ssh_section_inspect_ssh_evidence', 7, 'section', 'Inspect SSH evidence', 'inspect-ssh-evidence', false),
  ('path_security_protocols', 'lesson_ssh', 1, 'ssh_section_guided_ssh_key_practice', 8, 'section', 'Guided SSH key practice', 'guided-ssh-key-practice', false),
  ('path_security_protocols', 'lesson_ssh', 1, 'ssh_section_troubleshoot_ssh', 9, 'section', 'Troubleshoot SSH', 'troubleshoot-ssh', false),
  ('path_security_protocols', 'lesson_ssh', 1, 'ssh_check_1', 10, 'knowledge_check', 'Knowledge check 1', 'ssh-check-1', true),
  ('path_security_protocols', 'lesson_ssh', 1, 'ssh_check_2', 11, 'knowledge_check', 'Knowledge check 2', 'ssh-check-2', true),
  ('path_security_protocols', 'lesson_ssh', 1, 'ssh_check_3', 12, 'knowledge_check', 'Knowledge check 3', 'ssh-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
