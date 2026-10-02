begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_wireless_networking', 'lesson_wifi_security', 1, 3)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_wireless_networking', 'lesson_wifi_security', 1, 'wifi_security_section_what_wifi_security_protects_against', 1, 'section', 'What Wi-Fi security protects against', 'what-wifi-security-protects-against', false),
  ('path_wireless_networking', 'lesson_wifi_security', 1, 'wifi_security_section_wpa2_and_the_4_way_handshake', 2, 'section', 'WPA2 and the 4-way handshake', 'wpa2-and-the-4-way-handshake', false),
  ('path_wireless_networking', 'lesson_wifi_security', 1, 'wifi_security_section_the_offline_dictionary_attack_problem', 3, 'section', 'The offline dictionary attack problem', 'the-offline-dictionary-attack-problem', false),
  ('path_wireless_networking', 'lesson_wifi_security', 1, 'wifi_security_section_wpa3_and_sae', 4, 'section', 'WPA3 and SAE', 'wpa3-and-sae', false),
  ('path_wireless_networking', 'lesson_wifi_security', 1, 'wifi_security_interactive_interactive_wpa2_handshake_and_the_wpa3_fix', 5, 'interactive', 'Interactive WPA2 handshake and the WPA3 fix', 'interactive-wpa2-handshake-and-the-wpa3-fix', false),
  ('path_wireless_networking', 'lesson_wifi_security', 1, 'wifi_security_section_personal_vs_enterprise_authentication', 6, 'section', 'Personal vs. Enterprise authentication', 'personal-vs-enterprise-authentication', false),
  ('path_wireless_networking', 'lesson_wifi_security', 1, 'wifi_security_section_inspect_wifi_security_evidence', 7, 'section', 'Inspect Wi-Fi security evidence', 'inspect-wifi-security-evidence', false),
  ('path_wireless_networking', 'lesson_wifi_security', 1, 'wifi_security_section_guided_handshake_practice', 8, 'section', 'Guided handshake practice', 'guided-handshake-practice', false),
  ('path_wireless_networking', 'lesson_wifi_security', 1, 'wifi_security_section_troubleshoot_wifi_security', 9, 'section', 'Troubleshoot Wi-Fi security', 'troubleshoot-wifi-security', false),
  ('path_wireless_networking', 'lesson_wifi_security', 1, 'wifi_security_check_1', 10, 'knowledge_check', 'Knowledge check 1', 'wifi-security-check-1', true),
  ('path_wireless_networking', 'lesson_wifi_security', 1, 'wifi_security_check_2', 11, 'knowledge_check', 'Knowledge check 2', 'wifi-security-check-2', true),
  ('path_wireless_networking', 'lesson_wifi_security', 1, 'wifi_security_check_3', 12, 'knowledge_check', 'Knowledge check 3', 'wifi-security-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
