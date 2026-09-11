begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_networking_foundations', 'lesson_systematic_network_troubleshooting_capstone', 1, 8)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_networking_foundations', 'lesson_systematic_network_troubleshooting_capstone', 1, 'capstone_section_scope_the_incident', 1, 'section', 'Scope the incident', 'scope-the-incident', true),
  ('path_networking_foundations', 'lesson_systematic_network_troubleshooting_capstone', 1, 'capstone_section_form_a_hypothesis', 2, 'section', 'Form a falsifiable hypothesis', 'form-a-hypothesis', true),
  ('path_networking_foundations', 'lesson_systematic_network_troubleshooting_capstone', 1, 'capstone_section_collect_evidence', 3, 'section', 'Collect least-destructive evidence', 'collect-evidence', true),
  ('path_networking_foundations', 'lesson_systematic_network_troubleshooting_capstone', 1, 'capstone_section_isolate_the_fault', 4, 'section', 'Isolate the fault', 'isolate-the-fault', true),
  ('path_networking_foundations', 'lesson_systematic_network_troubleshooting_capstone', 1, 'capstone_section_restore_the_service', 5, 'section', 'Restore the complete service', 'restore-the-service', true),
  ('path_networking_foundations', 'lesson_systematic_network_troubleshooting_capstone', 1, 'capstone_section_report_and_prevent', 6, 'section', 'Report and prevent recurrence', 'report-and-prevent', true),
  ('path_networking_foundations', 'lesson_systematic_network_troubleshooting_capstone', 1, 'capstone_guided_incident', 7, 'interactive', 'Guided branch incident', 'guided-branch-incident', true),
  ('path_networking_foundations', 'lesson_systematic_network_troubleshooting_capstone', 1, 'capstone_section_guided_incident_debrief', 8, 'section', 'Guided incident debrief', 'guided-incident-debrief', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
