begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_wireless_networking', 'lesson_80211_standards_and_association', 1, 3)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_wireless_networking', 'lesson_80211_standards_and_association', 1, '80211_standards_and_association_section_the_80211_amendment_alphabet', 1, 'section', 'The 802.11 amendment alphabet', 'the-80211-amendment-alphabet', false),
  ('path_wireless_networking', 'lesson_80211_standards_and_association', 1, '80211_standards_and_association_section_wi_fi_generation_names', 2, 'section', 'Wi-Fi generation names', 'wi-fi-generation-names', false),
  ('path_wireless_networking', 'lesson_80211_standards_and_association', 1, '80211_standards_and_association_section_passive_and_active_scanning', 3, 'section', 'Passive and active scanning', 'passive-and-active-scanning', false),
  ('path_wireless_networking', 'lesson_80211_standards_and_association', 1, '80211_standards_and_association_section_authentication_and_association', 4, 'section', 'Authentication and association', 'authentication-and-association', false),
  ('path_wireless_networking', 'lesson_80211_standards_and_association', 1, '80211_standards_and_association_interactive_interactive_the_association_state_machine', 5, 'interactive', 'Interactive the association state machine', 'interactive-the-association-state-machine', false),
  ('path_wireless_networking', 'lesson_80211_standards_and_association', 1, '80211_standards_and_association_section_fast_roaming_with_80211r_k_and_v', 6, 'section', 'Fast roaming with 802.11r, k, and v', 'fast-roaming-with-80211r-k-and-v', false),
  ('path_wireless_networking', 'lesson_80211_standards_and_association', 1, '80211_standards_and_association_section_inspect_association_evidence', 7, 'section', 'Inspect association evidence', 'inspect-association-evidence', false),
  ('path_wireless_networking', 'lesson_80211_standards_and_association', 1, '80211_standards_and_association_section_guided_standards_practice', 8, 'section', 'Guided standards practice', 'guided-standards-practice', false),
  ('path_wireless_networking', 'lesson_80211_standards_and_association', 1, '80211_standards_and_association_section_troubleshoot_association_issues', 9, 'section', 'Troubleshoot association issues', 'troubleshoot-association-issues', false),
  ('path_wireless_networking', 'lesson_80211_standards_and_association', 1, '80211_standards_and_association_check_1', 10, 'knowledge_check', 'Knowledge check 1', '80211-standards-and-association-check-1', true),
  ('path_wireless_networking', 'lesson_80211_standards_and_association', 1, '80211_standards_and_association_check_2', 11, 'knowledge_check', 'Knowledge check 2', '80211-standards-and-association-check-2', true),
  ('path_wireless_networking', 'lesson_80211_standards_and_association', 1, '80211_standards_and_association_check_3', 12, 'knowledge_check', 'Knowledge check 3', '80211-standards-and-association-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
