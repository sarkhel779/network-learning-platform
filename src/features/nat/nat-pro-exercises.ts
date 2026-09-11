import type { NatTuple } from "./nat-scenario.schema";

export type NatCaptureRow = { interface: string; direction: string; tuple: NatTuple; flags: string; evidence: string };
export type NatCaptureCase = { id: string; title: string; rows: NatCaptureRow[]; choices: string[]; correctIndex: number; explanation: string };

export const natCaptureCases: NatCaptureCase[] = [{
  id: "pat-two-sided-capture",
  title: "Correlate an HTTPS flow across a PAT boundary",
  rows: [
    { interface: "LAN", direction: "egress toward gateway", tuple: { protocol: "tcp", sourceIp: "10.0.0.25", sourcePort: 51514, destinationIp: "198.51.100.20", destinationPort: 443 }, flags: "SYN", evidence: "Private source tuple before translation" },
    { interface: "WAN", direction: "egress toward Internet", tuple: { protocol: "tcp", sourceIp: "203.0.113.10", sourcePort: 62001, destinationIp: "198.51.100.20", destinationPort: 443 }, flags: "SYN", evidence: "Public source tuple after PAT" },
  ],
  choices: ["The gateway translated the client source tuple", "The server changed its certificate", "DNS selected a different server"],
  correctIndex: 0,
  explanation: "The matching sequence and destination reveal one flow whose inside and outside tuples differ only at the NAT source boundary.",
}];

export type NatRfcCheck = { topic: string; reference: string; url: string; prompt: string; choices: string[]; correctIndex: number; explanation: string; consequence: string };

export const natRfcChecks: NatRfcCheck[] = [
  { topic: "UDP hairpin source", reference: "RFC 4787", url: "https://www.rfc-editor.org/rfc/rfc4787", prompt: "What source should a hairpinned packet expose?", choices: ["Use the NAT external address and port", "Preserve the internal source tuple"], correctIndex: 0, explanation: "RFC 4787 requires the hairpinned packet to use the external source address and port.", consequence: "This preserves the public peer identity and keeps the return path through the translator." },
  { topic: "TCP hairpin support", reference: "RFC 5382", url: "https://www.rfc-editor.org/rfc/rfc5382", prompt: "What must a TCP NAT support for internal public-address access?", choices: ["Hairpin TCP connections", "Only outbound SYN packets"], correctIndex: 0, explanation: "RFC 5382 requires TCP hairpinning behavior for applicable mappings.", consequence: "Internal clients can reach a published internal service through its external tuple." },
  { topic: "ICMP translation", reference: "RFC 5508", url: "https://www.rfc-editor.org/rfc/rfc5508", prompt: "What must be translated inside an ICMP error?", choices: ["The quoted packet where needed", "Only the outer Ethernet header"], correctIndex: 0, explanation: "RFC 5508 covers translating ICMP and the quoted packet data used to identify a flow.", consequence: "The private endpoint can associate the error with the original socket." },
  { topic: "Checksum repair", reference: "RFC 3022", url: "https://www.rfc-editor.org/rfc/rfc3022", prompt: "What follows an address or port rewrite?", choices: ["Update affected checksums", "Leave every checksum unchanged"], correctIndex: 0, explanation: "Traditional NAT changes fields covered by IP or transport checksums.", consequence: "Recalculation prevents receivers from discarding altered packets as corrupt." },
  { topic: "IP fragments", reference: "RFC 7857", url: "https://www.rfc-editor.org/rfc/rfc7857", prompt: "Why are non-initial fragments difficult for NAT?", choices: ["They can lack transport ports", "They always contain a full TCP header"], correctIndex: 0, explanation: "Later fragments may not carry the transport fields used to select a mapping.", consequence: "A translator needs consistent fragment handling and stored context." },
  { topic: "ALG caution", reference: "RFC 2663", url: "https://www.rfc-editor.org/rfc/rfc2663", prompt: "When might an ALG be considered?", choices: ["When payload embeds translated addresses", "For every encrypted flow"], correctIndex: 0, explanation: "An ALG can adjust application data that embeds address information, but increases protocol coupling.", consequence: "Encrypted payloads and protocol changes can make rewriting impossible or unsafe." },
];
