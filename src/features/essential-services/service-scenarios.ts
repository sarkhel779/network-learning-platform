import { parseServiceScenario, type ServiceMessage, type ServiceScenario } from "./essential-services.schema";

const message = (name: string, fields: Array<[string, string, string]>): ServiceMessage => ({
  name,
  fields: fields.map(([fieldName, value, explanation]) => ({ name: fieldName, value, explanation })),
});

export const canonicalPorts = {
  web: [80, 443, 8080],
  remoteAccess: [22, 23],
  email: [25, 465, 587, 143, 993, 110, 995],
  fileTransfer: [20, 21, 22, 990],
  time: [123],
  monitoring: [161, 162],
} as const;

const authoredScenarios = {
  web: {
    id: "web-service-journey", service: "web", title: "HTTP and HTTPS service journey",
    steps: [
      { id: "http-request", title: "HTTP request", sender: "browser", receiver: "web-server", transport: "TCP", sourcePort: 51_000, destinationPort: 80, message: message("HTTP request", [["Method", "GET", "Requests a representation."], ["Host", "www.example.test", "Selects the virtual host."]]), explanation: "The browser sends a clear-text HTTP request after transport setup.", evidence: "tcp.dstport == 80 && http.request", terminal: false },
      { id: "https-service", title: "HTTPS service", sender: "browser", receiver: "secure-web-server", transport: "TCP", sourcePort: 51_001, destinationPort: 443, message: message("Protected HTTP service", [["Application", "HTTPS", "HTTP is carried inside TLS protection."], ["Security", "TLS", "Modern TLS replaces obsolete SSL."]]), explanation: "Port 443 identifies the HTTPS service; encrypted application bytes follow TLS setup.", evidence: "tcp.dstport == 443", terminal: false },
      { id: "alternate-http", title: "Alternate HTTP listener", sender: "browser", receiver: "development-server", transport: "TCP", sourcePort: 51_002, destinationPort: 8080, message: message("Alternate HTTP request", [["Method", "GET", "Uses the same HTTP semantics."], ["Port", "8080", "A common alternate web-service port."]]), explanation: "Applications may expose HTTP on an explicitly selected alternate port.", evidence: "tcp.dstport == 8080", terminal: true },
    ],
    conclusion: "Web services use HTTP semantics on a selected listener; HTTPS adds TLS protection rather than replacing HTTP.",
  },
  "remote-access": {
    id: "remote-access-journey", service: "remote-access", title: "SSH and Telnet service journey",
    steps: [
      { id: "ssh-session", title: "Protected SSH session", sender: "administrator", receiver: "network-device", transport: "TCP", sourcePort: 52_000, destinationPort: 22, message: message("SSH identification", [["Protocol", "SSH-2.0", "Negotiates the SSH protocol generation."], ["Host identity", "host key", "Lets the client validate the server identity."]]), explanation: "SSH protects authentication and commands over the remote-access session.", evidence: "tcp.dstport == 22", terminal: false },
      { id: "telnet-session", title: "Clear-text Telnet session", sender: "administrator", receiver: "legacy-device", transport: "TCP", sourcePort: 52_001, destinationPort: 23, message: message("Telnet negotiation", [["Protocol", "Telnet", "Provides terminal negotiation without encryption."], ["Risk", "clear text", "Credentials and commands can be observed."]]), explanation: "Telnet demonstrates why unprotected remote administration is unsafe.", evidence: "tcp.dstport == 23", terminal: true },
    ],
    conclusion: "SSH is the secure remote-access choice; Telnet remains useful only for recognizing legacy clear-text behavior.",
  },
  email: {
    id: "email-service-journey", service: "email", title: "Email submission, relay, and retrieval journey",
    steps: [
      { id: "smtp-relay", title: "SMTP server relay", sender: "mail-server", receiver: "mail-server", transport: "TCP", sourcePort: 53_000, destinationPort: 25, message: message("SMTP relay", [["Command", "MAIL FROM", "Begins the message envelope."], ["Reply", "250", "Reports successful processing."]]), explanation: "Mail servers commonly exchange SMTP traffic on port 25.", evidence: "tcp.dstport == 25 && smtp", terminal: false },
      { id: "smtps", title: "Implicit TLS SMTP", sender: "mail-client", receiver: "submission-server", transport: "TCP", sourcePort: 53_001, destinationPort: 465, message: message("Implicit TLS submission", [["Protection", "TLS from connection start", "Protects the submission channel immediately."]]), explanation: "Port 465 is used for implicit TLS mail submission.", evidence: "tcp.dstport == 465", terminal: false },
      { id: "smtp-submission", title: "Message submission", sender: "mail-client", receiver: "submission-server", transport: "TCP", sourcePort: 53_002, destinationPort: 587, message: message("SMTP submission", [["Role", "submission", "Accepts mail from an authenticated user."], ["Upgrade", "STARTTLS", "Can upgrade the connection to TLS."]]), explanation: "Port 587 separates authenticated message submission from server relay.", evidence: "tcp.dstport == 587", terminal: false },
      { id: "imap", title: "IMAP mailbox synchronization", sender: "mail-client", receiver: "mailbox-server", transport: "TCP", sourcePort: 53_003, destinationPort: 143, message: message("IMAP command", [["Command", "SELECT INBOX", "Opens a mailbox for synchronization."]]), explanation: "IMAP keeps server mailbox state synchronized with clients.", evidence: "tcp.dstport == 143", terminal: false },
      { id: "imaps", title: "Protected IMAP", sender: "mail-client", receiver: "mailbox-server", transport: "TCP", sourcePort: 53_004, destinationPort: 993, message: message("IMAP over TLS", [["Protection", "implicit TLS", "Protects mailbox credentials and content."]]), explanation: "Port 993 provides IMAP with TLS from connection establishment.", evidence: "tcp.dstport == 993", terminal: false },
      { id: "pop3", title: "POP3 retrieval", sender: "mail-client", receiver: "mailbox-server", transport: "TCP", sourcePort: 53_005, destinationPort: 110, message: message("POP3 command", [["Command", "RETR 1", "Downloads one message."], ["Model", "download", "Uses a simpler retrieval model than IMAP synchronization."]]), explanation: "POP3 retrieves messages, often for local storage.", evidence: "tcp.dstport == 110", terminal: false },
      { id: "pop3s", title: "Protected POP3", sender: "mail-client", receiver: "mailbox-server", transport: "TCP", sourcePort: 53_006, destinationPort: 995, message: message("POP3 over TLS", [["Protection", "implicit TLS", "Protects retrieval credentials and content."]]), explanation: "Port 995 protects POP3 with TLS.", evidence: "tcp.dstport == 995", terminal: true },
    ],
    conclusion: "SMTP submits and relays mail; IMAP and POP3 retrieve it using different mailbox models.",
  },
  "file-transfer": {
    id: "file-transfer-journey", service: "file-transfer", title: "FTP, FTPS, and SFTP journey",
    steps: [
      { id: "ftp-control", title: "FTP control channel", sender: "ftp-client", receiver: "ftp-server", transport: "TCP", sourcePort: 54_000, destinationPort: 21, message: message("FTP command", [["Command", "USER learner", "Travels on the persistent control channel."], ["Channel", "control", "Keeps commands separate from file data."]]), explanation: "FTP commands use the control channel on port 21.", evidence: "tcp.dstport == 21 && ftp", terminal: false },
      { id: "ftp-active-data", title: "FTP active data", sender: "ftp-server", receiver: "ftp-client", transport: "TCP", sourcePort: 20, destinationPort: 54_001, message: message("Active data connection", [["Server source", "20", "The server initiates the classic active-mode data connection."], ["Direction", "server to client", "Inbound filtering can block this connection."]]), explanation: "In active mode the server opens the data connection toward the client.", evidence: "tcp.srcport == 20", terminal: false },
      { id: "ftp-passive-data", title: "FTP passive data", sender: "ftp-client", receiver: "ftp-server", transport: "TCP", sourcePort: 54_002, destinationPort: 50_100, message: message("Passive data connection", [["Command", "PASV", "Asks the server to advertise a data listener."], ["Port", "negotiated high port", "The client initiates the data connection."]]), explanation: "Passive mode works better through typical client-side NAT and firewalls.", evidence: "ftp.request.command == PASV", terminal: false },
      { id: "ftps-control", title: "Implicit FTPS control", sender: "ftps-client", receiver: "ftps-server", transport: "TCP", sourcePort: 54_003, destinationPort: 990, message: message("FTPS control", [["Protocol", "FTP over TLS", "Adds TLS protection to FTP semantics."], ["Port", "990", "Common implicit FTPS control port."]]), explanation: "FTPS retains FTP's channel model while protecting it with TLS.", evidence: "tcp.dstport == 990", terminal: false },
      { id: "sftp-session", title: "SFTP over SSH", sender: "sftp-client", receiver: "ssh-server", transport: "TCP", sourcePort: 54_004, destinationPort: 22, message: message("SSH subsystem", [["Subsystem", "sftp", "Runs file operations inside an SSH session."], ["Design", "not FTP", "SFTP does not use FTP control and data channels."]]), explanation: "SFTP is an SSH subsystem and is not the same protocol as FTPS.", evidence: "tcp.dstport == 22", terminal: true },
    ],
    conclusion: "FTP separates control and data, FTPS protects FTP with TLS, and SFTP uses a different SSH-based design.",
  },
  time: {
    id: "time-service-journey", service: "time", title: "NTP time synchronization journey",
    steps: [
      { id: "ntp-four-timestamps", title: "Calculate delay and offset", sender: "ntp-client", receiver: "ntp-server", transport: "UDP", sourcePort: 55_000, destinationPort: 123, message: message("NTP exchange", [["T1 origin timestamp", "client send", "Records when the client transmitted the request."], ["T2 receive timestamp", "server receive", "Records when the server received it."], ["T3 transmit timestamp", "server send", "Records when the server transmitted the response."], ["T4 destination timestamp", "client receive", "Records when the client received the response."]]), explanation: "The four timestamps let the client estimate network delay and clock offset.", evidence: "udp.dstport == 123 || udp.srcport == 123", terminal: true },
    ],
    conclusion: "NTP uses measured timestamps and a clock hierarchy to improve system time rather than simply copying one value.",
  },
  monitoring: {
    id: "monitoring-service-journey", service: "monitoring", title: "SNMP polling and notification journey",
    steps: [
      { id: "snmp-poll", title: "Manager polls an agent", sender: "snmp-manager", receiver: "snmp-agent", transport: "UDP", sourcePort: 56_000, destinationPort: 161, message: message("SNMP GetRequest", [["Operation", "GetRequest", "Requests one or more managed objects."], ["OID", "1.3.6.1.2.1.1.3.0", "Identifies a managed value in the MIB tree."]]), explanation: "Managers normally send polls to an agent on UDP 161.", evidence: "udp.dstport == 161 && snmp", terminal: false },
      { id: "snmp-trap", title: "Agent sends a trap", sender: "snmp-agent", receiver: "snmp-manager", transport: "UDP", sourcePort: 161, destinationPort: 162, message: message("SNMP Trap", [["Operation", "Trap", "Sends an unsolicited event notification."], ["Acknowledgement", "none", "A trap is not confirmed by a response."]]), explanation: "Agents send traps to a manager's notification listener on UDP 162.", evidence: "udp.dstport == 162 && snmp", terminal: false },
      { id: "snmp-inform", title: "Agent sends a confirmed inform", sender: "snmp-agent", receiver: "snmp-manager", transport: "UDP", sourcePort: 161, destinationPort: 162, message: message("SNMP InformRequest", [["Operation", "InformRequest", "Requests acknowledgement of the notification."], ["Reliability", "response expected", "The sender can detect a missing acknowledgement."]]), explanation: "An Inform adds acknowledgement behavior that a Trap lacks.", evidence: "udp.dstport == 162 && snmp", terminal: true },
    ],
    conclusion: "SNMP uses UDP 161 for manager requests and UDP 162 for agent notifications, with Trap and Inform offering different delivery assurance.",
  },
} as const;

export const serviceScenarios: Record<keyof typeof authoredScenarios, ServiceScenario> = Object.fromEntries(
  Object.entries(authoredScenarios).map(([id, scenario]) => [id, parseServiceScenario(scenario)]),
) as Record<keyof typeof authoredScenarios, ServiceScenario>;
