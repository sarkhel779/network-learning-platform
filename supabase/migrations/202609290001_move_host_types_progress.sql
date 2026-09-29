begin;

insert into public.lesson_progress_manifests (
  pathway_id, lesson_id, content_version, required_item_count
) values (
  'path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 2
)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

-- Replace the prior Hosts catalog atomically so the relocated section can take
-- its correct ordinal without colliding with the existing active rows.
delete from public.lesson_progress_items
where pathway_id = 'path_networking_foundations'
  and lesson_id = 'lesson_hosts_and_network_devices'
  and content_version = 1;

insert into public.lesson_progress_items (
  pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required
) values
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_what_makes_a_device_a_host', 1, 'section', 'What makes a device a host?', 'what-makes-a-device-a-host', false),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_types_of_hosts', 2, 'section', 'Types of hosts', 'types-of-hosts', false),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_network_interfaces', 3, 'section', 'Network interfaces', 'network-interfaces', false),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_clients_and_servers', 4, 'section', 'Clients and servers', 'clients-and-servers', false),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_section_one_host_more_than_one_role', 5, 'section', 'One host, more than one role', 'one-host-more-than-one-role', false),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_interactive_classify_host_roles', 6, 'interactive', 'Classify host roles', 'classify-host-roles', false),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_check_1', 7, 'knowledge_check', 'Knowledge check 1', 'hosts-and-network-devices-check-1', true),
  ('path_networking_foundations', 'lesson_hosts_and_network_devices', 1, 'hosts_and_network_devices_check_2', 8, 'knowledge_check', 'Knowledge check 2', 'hosts-and-network-devices-check-2', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal,
  kind = excluded.kind,
  label = excluded.label,
  anchor = excluded.anchor,
  required = excluded.required;

commit;
