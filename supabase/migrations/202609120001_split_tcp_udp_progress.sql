begin;

-- Preserve learner events and the TCP lesson identity. Rebuild only the
-- catalogue-backed item definitions; old UDP events remain in history.
delete from public.lesson_progress_items
where pathway_id = 'path_networking_foundations' and lesson_id = 'lesson_tcp_udp_and_ports' and content_version = 1;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 20),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 14)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_why_transport_protocols_exist', 1, 'section', 'Why transport protocols exist', 'why-transport-protocols-exist', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_segments_datagrams_ports_sockets', 2, 'section', 'Segments, ports, and sockets', 'segments-datagrams-ports-sockets', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_source_destination_ports_multiplexing', 3, 'section', 'Source and destination ports', 'source-destination-ports-multiplexing', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_tcp_udp_header_essentials', 4, 'section', 'TCP header essentials', 'tcp-udp-header-essentials', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_interactive_interactive_tcp_connection', 5, 'interactive', 'Interactive TCP connection journey', 'interactive-tcp-connection', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_mss_and_segment_sizing', 6, 'section', 'MSS and segment sizing', 'mss-and-segment-sizing', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_window_scaling', 7, 'section', 'Window scaling', 'window-scaling', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_sequence_acknowledgements_ordered_delivery', 8, 'section', 'Sequence numbers and acknowledgements', 'sequence-acknowledgements-ordered-delivery', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_loss_retransmission_duplicates', 9, 'section', 'Loss, retransmission, and duplicates', 'loss-retransmission-duplicates', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_flow_control_receive_window', 10, 'section', 'Flow control and receive window', 'flow-control-receive-window', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_interactive_interactive_tcp_window', 11, 'interactive', 'Interactive TCP sliding window', 'interactive-tcp-window', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_sack_permitted_and_blocks', 12, 'section', 'SACK permitted and received blocks', 'sack-permitted-and-blocks', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_fast_retransmit', 13, 'section', 'Fast retransmit', 'fast-retransmit', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_graceful_closure_resets', 14, 'section', 'Graceful closure and resets', 'graceful-closure-resets', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_inspect_transport_evidence', 15, 'section', 'Inspect transport evidence', 'inspect-transport-evidence', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_guided_transport_diagnosis', 16, 'section', 'Guided transport diagnosis', 'guided-transport-diagnosis', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_udp_and_ports_section_troubleshoot_transport', 17, 'section', 'Troubleshoot transport', 'troubleshoot-transport', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_reliable_transport_check_1', 18, 'knowledge_check', 'Knowledge check 1', 'tcp-udp-and-ports-check-1', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_reliable_transport_check_2', 19, 'knowledge_check', 'Knowledge check 2', 'tcp-udp-and-ports-check-2', true),
  ('path_networking_foundations', 'lesson_tcp_udp_and_ports', 1, 'tcp_reliable_transport_check_3', 20, 'knowledge_check', 'Knowledge check 3', 'tcp-udp-and-ports-check-3', true),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 'udp_datagrams_and_ports_section_why_udp_exists', 1, 'section', 'Why UDP exists', 'why-udp-exists', true),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 'udp_datagrams_and_ports_section_udp_ports_and_sockets', 2, 'section', 'Ports and sockets', 'udp-ports-and-sockets', true),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 'udp_datagrams_and_ports_section_udp_header_and_datagrams', 3, 'section', 'UDP header and datagrams', 'udp-header-and-datagrams', true),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 'udp_datagrams_and_ports_section_udp_delivery_contract', 4, 'section', 'What UDP does and does not provide', 'udp-delivery-contract', true),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 'udp_datagrams_and_ports_interactive_interactive_udp_port_delivery', 5, 'interactive', 'Interactive UDP port delivery', 'interactive-udp-port-delivery', true),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 'udp_datagrams_and_ports_section_udp_service_examples', 6, 'section', 'DNS and DHCP examples', 'udp-service-examples', true),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 'udp_datagrams_and_ports_section_udp_errors_and_silence', 7, 'section', 'Errors and silence', 'udp-errors-and-silence', true),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 'udp_datagrams_and_ports_section_choosing_udp', 8, 'section', 'Choosing UDP', 'choosing-udp', true),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 'udp_datagrams_and_ports_section_inspect_udp_evidence', 9, 'section', 'Inspect UDP evidence', 'inspect-udp-evidence', true),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 'udp_datagrams_and_ports_section_guided_udp_diagnosis', 10, 'section', 'Guided UDP diagnosis', 'guided-udp-diagnosis', true),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 'udp_datagrams_and_ports_section_troubleshoot_udp', 11, 'section', 'Troubleshoot UDP', 'troubleshoot-udp', true),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 'udp_datagrams_and_ports_check_1', 12, 'knowledge_check', 'Knowledge check 1', 'udp-datagrams-and-ports-check-1', true),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 'udp_datagrams_and_ports_check_2', 13, 'knowledge_check', 'Knowledge check 2', 'udp-datagrams-and-ports-check-2', true),
  ('path_networking_foundations', 'lesson_udp_datagrams_and_ports', 1, 'udp_datagrams_and_ports_check_3', 14, 'knowledge_check', 'Knowledge check 3', 'udp-datagrams-and-ports-check-3', true);

-- Recompute old TCP attempts from retained completion events against the new
-- required items. Do not copy old UDP activity to the new UDP lesson.
with recalculated as (
  select a.id,
    array(select i.item_id from public.lesson_progress_items i
      where i.pathway_id = a.pathway_id and i.lesson_id = a.lesson_id and i.content_version = a.content_version
        and exists (select 1 from public.learner_progress_events e where e.attempt_id = a.id and e.item_id = i.item_id
          and e.event_type in ('section_completed', 'interactive_completed', 'knowledge_check_attempted'))
      order by i.ordinal) as completed_ids,
    (select i.item_id from public.lesson_progress_items i
      where i.pathway_id = a.pathway_id and i.lesson_id = a.lesson_id and i.content_version = a.content_version
        and not exists (select 1 from public.learner_progress_events e where e.attempt_id = a.id and e.item_id = i.item_id
          and e.event_type in ('section_completed', 'interactive_completed', 'knowledge_check_attempted'))
      order by i.ordinal limit 1) as next_id
  from public.learner_lesson_attempts a
  where a.pathway_id = 'path_networking_foundations' and a.lesson_id = 'lesson_tcp_udp_and_ports' and a.content_version = 1
)
update public.learner_lesson_attempts a set
  completed_item_ids = r.completed_ids,
  next_item_id = r.next_id,
  completion_percent = floor(cardinality(r.completed_ids)::numeric * 100 / 20)::integer,
  status = case when cardinality(r.completed_ids) = 20 then 'completed' else 'in_progress' end,
  completed_at = case when cardinality(r.completed_ids) = 20 then a.completed_at else null end,
  last_item_id = case when a.last_item_id = any(r.completed_ids) then a.last_item_id else null end,
  last_anchor = case when a.last_item_id = any(r.completed_ids) then a.last_anchor else null end
from recalculated r where a.id = r.id;

commit;
