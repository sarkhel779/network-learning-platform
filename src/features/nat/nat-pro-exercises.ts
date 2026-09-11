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
}, {
  id: "pat-return-path",
  title: "Reverse a returning HTTPS packet",
  rows: [
    { interface: "WAN", direction: "ingress from Internet", tuple: { protocol: "tcp", sourceIp: "198.51.100.20", sourcePort: 443, destinationIp: "203.0.113.10", destinationPort: 62001 }, flags: "SYN, ACK", evidence: "Reply targets the active public mapping" },
    { interface: "LAN", direction: "egress toward client", tuple: { protocol: "tcp", sourceIp: "198.51.100.20", sourcePort: 443, destinationIp: "10.0.0.25", destinationPort: 51514 }, flags: "SYN, ACK", evidence: "Destination is restored from NAT state" },
  ],
  choices: ["The gateway reversed the destination tuple", "The client opened a second connection", "The server performed DNAT"], correctIndex: 0,
  explanation: "The sequence and server source match while the gateway restores the public destination tuple to its private owner.",
}, {
  id: "udp-timeout-reuse",
  title: "Identify a stale UDP mapping",
  rows: [
    { interface: "WAN", direction: "ingress", tuple: { protocol: "udp", sourceIp: "192.0.2.53", sourcePort: 53, destinationIp: "203.0.113.10", destinationPort: 53000 }, flags: "UDP response", evidence: "Response arrives after the UDP mapping expired" },
  ],
  choices: ["No live reverse owner exists for the public port", "TCP rejected the SYN", "The IPv4 header has no destination"], correctIndex: 0,
  explanation: "Connectionless UDP still depends on timed translation state; an expired entry leaves the returning datagram without a private owner.",
}, {
  id: "icmp-quoted-packet",
  title: "Inspect an ICMP error across NAT",
  rows: [
    { interface: "WAN", direction: "ingress", tuple: { protocol: "icmp", sourceIp: "192.0.2.1", destinationIp: "203.0.113.10" }, flags: "Destination unreachable", evidence: "ICMP payload quotes the translated TCP tuple" },
    { interface: "LAN", direction: "egress", tuple: { protocol: "icmp", sourceIp: "192.0.2.1", destinationIp: "10.0.0.25" }, flags: "Destination unreachable", evidence: "Outer destination and quoted packet identify the private flow" },
  ],
  choices: ["The translator repaired both outer and quoted flow evidence", "ICMP bypassed translation", "The server allocated a PAT port"], correctIndex: 0,
  explanation: "Useful ICMP delivery requires the NAT to translate the outer packet and the quoted tuple used by the client to associate the error.",
}, {
  id: "fragment-checksum-evidence",
  title: "Validate fragment context and checksum repair",
  rows: [
    { interface: "LAN", direction: "ingress fragment 0", tuple: { protocol: "udp", sourceIp: "10.0.0.25", sourcePort: 40000, destinationIp: "198.51.100.30", destinationPort: 5000 }, flags: "MF=1, offset=0", evidence: "Initial fragment supplies ports and creates mapping context" },
    { interface: "WAN", direction: "egress later fragment", tuple: { protocol: "udp", sourceIp: "203.0.113.10", destinationIp: "198.51.100.30" }, flags: "MF=0, offset=1480", evidence: "Later fragment reuses stored context; IPv4 checksum is updated" },
  ],
  choices: ["Fragment context links the portless fragment to the mapping", "Every fragment repeats the UDP header", "Checksums are unaffected by address rewrites"], correctIndex: 0,
  explanation: "Only the initial fragment carries transport ports, so subsequent fragments need consistent stored context and repaired checksums after address translation.",
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
