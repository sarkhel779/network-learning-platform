import { parseCaptureExercise, parseRfcExercise, type CaptureExercise, type RfcExercise, type ServiceId } from "./essential-services.schema";

const capture = (service: ServiceId, protocol: string, filter: string, source: string, destination: string, summary: string, evidence: string) => parseCaptureExercise({
  id: `${service}-capture`, service, title: `${protocol} capture`, displayFilter: filter,
  conversation: `${source} exchanges ${protocol} traffic with ${destination}.`,
  rows: [
    { number: 1, relativeTime: "0.000000", source, destination, protocol, length: 74, summary },
    { number: 2, relativeTime: "0.024100", source: destination, destination: source, protocol, length: 86, summary: `Response: ${summary}` },
  ],
  question: `Which evidence best identifies this ${protocol} conversation?`, options: [evidence, "The Ethernet vendor name alone"], correctIndex: 0,
  evidence, explanation: `The display filter and conversation fields expose ${evidence}.`,
});

const rfc = (service: ServiceId, number: number, question: string, rule: string, evidence: string, consequence: string) => parseRfcExercise({
  id: `${service}-rfc`, service, question, options: ["Valid", "Invalid"], correctIndex: 1,
  rule, evidence, consequence, referenceLabel: `RFC ${number}`, referenceUrl: `https://www.rfc-editor.org/rfc/rfc${number}.html`,
});

export const captureExercises: Record<ServiceId, readonly CaptureExercise[]> = {
  web: [capture("web", "HTTP", "http || tcp.port == 443", "192.0.2.10", "198.51.100.80", "GET / HTTP/1.1", "request method, status, and TCP service port")],
  "remote-access": [capture("remote-access", "SSH", "ssh || tcp.port == 23", "192.0.2.10", "198.51.100.22", "Protocol exchange", "SSH identification or clear-text Telnet data")],
  email: [capture("email", "SMTP", "smtp || imap || pop", "192.0.2.25", "198.51.100.25", "MAIL FROM", "mail command, reply code, and service port")],
  "file-transfer": [capture("file-transfer", "FTP", "ftp || ftp-data || ssh", "192.0.2.21", "198.51.100.21", "PASV", "control and negotiated data conversations")],
  time: [capture("time", "NTP", "udp.port == 123", "192.0.2.10", "198.51.100.123", "Client request", "UDP port 123 and four timestamps")],
  monitoring: [capture("monitoring", "SNMP", "snmp || udp.port == 162", "192.0.2.161", "198.51.100.162", "GetRequest", "operation, request ID, OID, and error status")],
};

export const rfcExercises: Record<ServiceId, readonly RfcExercise[]> = {
  web: [rfc("web", 9110, "A response sends both an invalid framing length and a conflicting message boundary. Is it valid?", "HTTP message framing must be unambiguous.", "Conflicting boundary evidence is present.", "Recipients can parse different messages, creating request-smuggling risk.")],
  "remote-access": [rfc("remote-access", 4253, "An SSH transport skips server host-key proof. Is it valid?", "SSH transport authenticates the server using its host key.", "No server identity proof is present.", "The client cannot establish which server it reached.")],
  email: [rfc("email", 5321, "An SMTP server accepts DATA before a valid recipient. Is it valid?", "SMTP requires a valid reverse-path and recipient sequence before message data.", "DATA follows no accepted RCPT TO.", "The transaction state is invalid and delivery cannot be determined.")],
  "file-transfer": [rfc("file-transfer", 959, "An FTP server sends file data over the control connection. Is it valid?", "FTP defines separate control and data connections.", "Payload bytes appear on the command channel.", "Commands and transferred data lose their defined channel boundaries.")],
  time: [rfc("time", 5905, "An NTP reply omits usable originate and receive timestamps. Is it valid?", "NTP calculations depend on the timestamp exchange and matching origin evidence.", "The reply cannot be matched or used for delay/offset.", "The client must reject the sample.")],
  monitoring: [rfc("monitoring", 3416, "An SNMP response changes the request-id from its request. Is it valid?", "A response uses the request-id to correlate with the request.", "The response request-id differs.", "The manager cannot safely associate the response.")],
};
