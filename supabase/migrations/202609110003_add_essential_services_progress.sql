begin;

insert into public.lesson_progress_manifests (pathway_id, lesson_id, content_version, required_item_count) values
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 24)
on conflict (pathway_id, lesson_id, content_version) do update
set required_item_count = excluded.required_item_count;

insert into public.lesson_progress_items (pathway_id, lesson_id, content_version, item_id, ordinal, kind, label, anchor, required) values
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_section_web_services', 1, 'section', 'HTTP, HTTPS, and web services', 'web-services', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_section_remote_access_services', 2, 'section', 'SSH and Telnet remote access', 'remote-access-services', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_section_email_services', 3, 'section', 'SMTP, IMAP, and POP3 email services', 'email-services', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_section_file_transfer_services', 4, 'section', 'FTP, FTPS, and SFTP file transfer', 'file-transfer-services', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_section_time_services', 5, 'section', 'NTP time synchronization', 'time-services', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_section_monitoring_services', 6, 'section', 'SNMP monitoring and notifications', 'monitoring-services', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_interactive_web', 7, 'interactive', 'Interactive web-service journey', 'web-service-journey', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_troubleshooting_web', 8, 'interactive', 'Web-service troubleshooting', 'web-troubleshooting', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_interactive_remote_access', 9, 'interactive', 'Interactive remote-access journey', 'remote-access-journey', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_troubleshooting_remote_access', 10, 'interactive', 'Remote-access troubleshooting', 'remote-access-troubleshooting', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_interactive_email', 11, 'interactive', 'Interactive email-service journey', 'email-journey', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_troubleshooting_email', 12, 'interactive', 'Email-service troubleshooting', 'email-troubleshooting', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_interactive_file_transfer', 13, 'interactive', 'Interactive file-transfer journey', 'file-transfer-journey', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_troubleshooting_file_transfer', 14, 'interactive', 'File-transfer troubleshooting', 'file-transfer-troubleshooting', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_interactive_time', 15, 'interactive', 'Interactive NTP journey', 'time-journey', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_troubleshooting_time', 16, 'interactive', 'NTP troubleshooting', 'time-troubleshooting', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_interactive_monitoring', 17, 'interactive', 'Interactive SNMP journey', 'monitoring-journey', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_troubleshooting_monitoring', 18, 'interactive', 'SNMP troubleshooting', 'monitoring-troubleshooting', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_check_web', 19, 'knowledge_check', 'Knowledge check 1', 'essential-services-check-1', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_check_remote_access', 20, 'knowledge_check', 'Knowledge check 2', 'essential-services-check-2', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_check_email', 21, 'knowledge_check', 'Knowledge check 3', 'essential-services-check-3', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_check_file_transfer', 22, 'knowledge_check', 'Knowledge check 4', 'essential-services-check-4', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_check_time', 23, 'knowledge_check', 'Knowledge check 5', 'essential-services-check-5', true),
  ('path_networking_foundations', 'lesson_http_https_tls_and_essential_network_services', 1, 'essential_services_check_monitoring', 24, 'knowledge_check', 'Knowledge check 6', 'essential-services-check-6', true)
on conflict (pathway_id, lesson_id, content_version, item_id) do update set
  ordinal = excluded.ordinal, kind = excluded.kind, label = excluded.label,
  anchor = excluded.anchor, required = excluded.required;

commit;
