begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 18)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_why_transport_protocols_exist', 1, 'section', 'Why transport protocols exist', 'why-transport-protocols-exist', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_segments_datagrams_ports_sockets', 2, 'section', 'Segments, datagrams, ports, and sockets', 'segments-datagrams-ports-sockets', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_source_destination_ports_multiplexing', 3, 'section', 'Source and destination ports', 'source-destination-ports-multiplexing', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_tcp_udp_header_essentials', 4, 'section', 'TCP and UDP header essentials', 'tcp-udp-header-essentials', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_interactive_interactive_tcp_connection', 5, 'interactive', 'Interactive TCP connection journey', 'interactive-tcp-connection', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_sequence_acknowledgements_ordered_delivery', 6, 'section', 'Sequence numbers and acknowledgements', 'sequence-acknowledgements-ordered-delivery', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_loss_retransmission_duplicates', 7, 'section', 'Loss, retransmission, and duplicates', 'loss-retransmission-duplicates', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_flow_control_receive_window', 8, 'section', 'Flow control and receive window', 'flow-control-receive-window', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_graceful_closure_resets', 9, 'section', 'Graceful closure and resets', 'graceful-closure-resets', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_interactive_interactive_tcp_udp_port_delivery', 10, 'interactive', 'Interactive TCP vs UDP port delivery', 'interactive-tcp-udp-port-delivery', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_common_service_ephemeral_ports', 11, 'section', 'Common service and ephemeral ports', 'common-service-ephemeral-ports', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_choosing_tcp_or_udp', 12, 'section', 'Choosing TCP or UDP', 'choosing-tcp-or-udp', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_inspect_transport_evidence', 13, 'section', 'Inspect transport evidence', 'inspect-transport-evidence', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_guided_transport_diagnosis', 14, 'section', 'Guided transport diagnosis', 'guided-transport-diagnosis', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_troubleshoot_transport', 15, 'section', 'Troubleshoot transport', 'troubleshoot-transport', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_check_1', 16, 'knowledge_check', 'Knowledge check 1', 'tcp-udp-and-ports-check-1', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_check_2', 17, 'knowledge_check', 'Knowledge check 2', 'tcp-udp-and-ports-check-2', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_check_3', 18, 'knowledge_check', 'Knowledge check 3', 'tcp-udp-and-ports-check-3', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
