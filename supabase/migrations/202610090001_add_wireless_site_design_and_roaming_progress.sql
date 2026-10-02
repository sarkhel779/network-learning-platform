begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_wireless_networking', 'lesson_wireless_site_design_and_roaming', 1, 3)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_wireless_networking', 'lesson_wireless_site_design_and_roaming', 1, 'wireless_site_design_and_roaming_section_rf_propagation_and_attenuation', 1, 'section', 'RF propagation and attenuation', 'rf-propagation-and-attenuation', false),
  ('path_wireless_networking', 'lesson_wireless_site_design_and_roaming', 1, 'wireless_site_design_and_roaming_section_site_surveys_predictive_active_and_passive', 2, 'section', 'Site surveys: predictive, active, and passive', 'site-surveys-predictive-active-and-passive', false),
  ('path_wireless_networking', 'lesson_wireless_site_design_and_roaming', 1, 'wireless_site_design_and_roaming_section_ap_placement_and_cell_design', 3, 'section', 'AP placement and cell design', 'ap-placement-and-cell-design', false),
  ('path_wireless_networking', 'lesson_wireless_site_design_and_roaming', 1, 'wireless_site_design_and_roaming_section_the_sticky_client_problem', 4, 'section', 'The sticky client problem', 'the-sticky-client-problem', false),
  ('path_wireless_networking', 'lesson_wireless_site_design_and_roaming', 1, 'wireless_site_design_and_roaming_interactive_interactive_the_sticky_client_and_the_roaming_trigger', 5, 'interactive', 'Interactive the sticky client and the roaming trigger', 'interactive-the-sticky-client-and-the-roaming-trigger', false),
  ('path_wireless_networking', 'lesson_wireless_site_design_and_roaming', 1, 'wireless_site_design_and_roaming_section_capacity_vs_coverage_design', 6, 'section', 'Capacity vs. coverage design', 'capacity-vs-coverage-design', false),
  ('path_wireless_networking', 'lesson_wireless_site_design_and_roaming', 1, 'wireless_site_design_and_roaming_section_inspect_site_design_evidence', 7, 'section', 'Inspect site design evidence', 'inspect-site-design-evidence', false),
  ('path_wireless_networking', 'lesson_wireless_site_design_and_roaming', 1, 'wireless_site_design_and_roaming_section_guided_site_design_practice', 8, 'section', 'Guided site design practice', 'guided-site-design-practice', false),
  ('path_wireless_networking', 'lesson_wireless_site_design_and_roaming', 1, 'wireless_site_design_and_roaming_section_troubleshoot_coverage_and_roaming', 9, 'section', 'Troubleshoot coverage and roaming', 'troubleshoot-coverage-and-roaming', false),
  ('path_wireless_networking', 'lesson_wireless_site_design_and_roaming', 1, 'wireless_site_design_and_roaming_check_1', 10, 'knowledge_check', 'Knowledge check 1', 'wireless-site-design-and-roaming-check-1', true),
  ('path_wireless_networking', 'lesson_wireless_site_design_and_roaming', 1, 'wireless_site_design_and_roaming_check_2', 11, 'knowledge_check', 'Knowledge check 2', 'wireless-site-design-and-roaming-check-2', true),
  ('path_wireless_networking', 'lesson_wireless_site_design_and_roaming', 1, 'wireless_site_design_and_roaming_check_3', 12, 'knowledge_check', 'Knowledge check 3', 'wireless-site-design-and-roaming-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
