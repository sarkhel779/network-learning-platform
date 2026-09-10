import { parseLeaseTimeline, parseRfcCheck } from "./dhcp.schema";

const timeline = (input: unknown) => parseLeaseTimeline(input);

export const dhcpLeaseTimelines = [
  timeline({ id: "normal-renewal", title: "Normal renewal", leaseSeconds: 7200, t1Seconds: 3600, t2Seconds: 6300, events: [
    { id: "allocate", seconds: 0, state: "Initial allocation", deliveryMode: "broadcast", leaseValid: false, explanation: "DORA begins with no usable client address." },
    { id: "bound", seconds: 0, state: "BOUND", deliveryMode: "unicast", leaseValid: true, explanation: "The ACK installs the address and starts the lease clock." },
    { id: "t1", seconds: 3600, state: "T1 RENEWING", deliveryMode: "unicast", leaseValid: true, explanation: "The client unicasts DHCPREQUEST to the original server." },
    { id: "renewed", seconds: 3601, state: "Renewed by ACK", deliveryMode: "unicast", leaseValid: true, explanation: "DHCPACK resets the lease timers from the acknowledged values." },
    { id: "release", seconds: 5400, state: "RELEASE sent", deliveryMode: "unicast", leaseValid: false, explanation: "A graceful client shutdown returns the address; the server does not reply." },
  ]}),
  timeline({ id: "delayed-renewal", title: "Delayed server response", leaseSeconds: 7200, t1Seconds: 3600, t2Seconds: 6300, events: [
    { id: "bound", seconds: 0, state: "BOUND", deliveryMode: "unicast", leaseValid: true, explanation: "The lease is usable while the client waits." },
    { id: "t1", seconds: 3600, state: "T1 RENEWING", deliveryMode: "unicast", leaseValid: true, explanation: "Unicast retries target the allocating server." },
    { id: "t2", seconds: 6300, state: "T2 REBINDING", deliveryMode: "broadcast", leaseValid: true, explanation: "The client broadcasts so any DHCP server can respond." },
    { id: "renewed", seconds: 6400, state: "Renewed by ACK", deliveryMode: "unicast", leaseValid: true, explanation: "A late ACK renews the still-valid lease." },
  ]}),
  timeline({ id: "retry-silence", title: "Retries, silence, and invalidation", leaseSeconds: 7200, t1Seconds: 3600, t2Seconds: 6300, events: [
    { id: "bound", seconds: 0, state: "BOUND", deliveryMode: "unicast", leaseValid: true, explanation: "The client begins with a valid lease." },
    { id: "t1", seconds: 3600, state: "T1 RENEWING", deliveryMode: "unicast", leaseValid: true, explanation: "No reply follows the unicast renewal." },
    { id: "t2", seconds: 6300, state: "T2 REBINDING", deliveryMode: "broadcast", leaseValid: true, explanation: "Broadcast retries continue before expiry." },
    { id: "expired", seconds: 7200, state: "Expired", deliveryMode: "silence", leaseValid: false, explanation: "The address is no longer valid and must stop being used." },
    { id: "nak", seconds: 7200, state: "NAK received", deliveryMode: "broadcast", leaseValid: false, explanation: "A NAK invalidates the requested address and restarts acquisition." },
    { id: "decline", seconds: 7200, state: "DECLINE sent", deliveryMode: "broadcast", leaseValid: false, explanation: "The client reports that conflict detection found the offered address in use." },
  ]}),
  timeline({ id: "relay-delay", title: "Relay-path delay", leaseSeconds: 7200, t1Seconds: 3600, t2Seconds: 6300, events: [
    { id: "bound", seconds: 0, state: "BOUND", deliveryMode: "relay-forwarded", leaseValid: true, explanation: "The relay path delivered the original ACK." },
    { id: "t1", seconds: 3600, state: "T1 RENEWING", deliveryMode: "unicast", leaseValid: true, explanation: "Normal renewal first targets the server directly when reachable." },
    { id: "t2", seconds: 6300, state: "T2 REBINDING", deliveryMode: "relay-forwarded", leaseValid: true, explanation: "The client broadcast is relayed with giaddr for subnet selection." },
    { id: "renewed", seconds: 6500, state: "Renewed by ACK", deliveryMode: "relay-forwarded", leaseValid: true, explanation: "The relayed ACK arrives before expiry." },
  ]}),
] as const;

const check = (input: unknown) => parseRfcCheck(input);
const choices = ["Required by the standard", "Not required by the standard"];

export const dhcpRfcChecks = [
  check({ id: "expiry", question: "What must the client do after lease expiry?", options: ["The client must stop using the address after lease expiry", "The client may keep the address after lease expiry"], correctIndex: 0, rule: "After expiry, the address is no longer valid and the client must stop using it.", evidence: "The lease timer reached its terminal value without a renewing or rebinding ACK.", consequence: "Continuing to transmit can duplicate an address that the server has reassigned.", referenceLabel: "RFC 2131", referenceUrl: "https://www.rfc-editor.org/rfc/rfc2131" }),
  check({ id: "options", question: "Does the DHCP options field use typed option codes and lengths?", options: choices, correctIndex: 0, rule: "DHCP options are encoded with option code and length semantics.", evidence: "The packet inspector exposes the code, length, value, and meaning.", consequence: "Malformed lengths can make later options undecodable.", referenceLabel: "RFC 2132", referenceUrl: "https://www.rfc-editor.org/rfc/rfc2132" }),
  check({ id: "relay-info", question: "Can a relay add relay-agent information such as circuit identity?", options: choices, correctIndex: 0, rule: "A relay can insert Relay Agent Information Option 82 under the defined handling rules.", evidence: "Option 82 appears only on the trusted relayed leg.", consequence: "Trust-boundary mistakes can enable spoofed subscriber or circuit identity.", referenceLabel: "RFC 3046", referenceUrl: "https://www.rfc-editor.org/rfc/rfc3046" }),
  check({ id: "auth", question: "Does classic DHCP define an authentication option?", options: choices, correctIndex: 0, rule: "DHCP authentication mechanisms are defined but require compatible deployment and key management.", evidence: "An Authentication option can protect selected DHCP messages.", consequence: "Most operational networks still need complementary controls such as DHCP snooping.", referenceLabel: "RFC 3118", referenceUrl: "https://www.rfc-editor.org/rfc/rfc3118" }),
  check({ id: "classless-route", question: "Can DHCP communicate classless static routes?", options: choices, correctIndex: 0, rule: "The Classless Static Route option communicates destination/prefix and router pairs.", evidence: "Option 121 can carry routes more specific than the default router option.", consequence: "Clients must apply the option precedence rules to avoid conflicting routes.", referenceLabel: "RFC 3442", referenceUrl: "https://www.rfc-editor.org/rfc/rfc3442" }),
  check({ id: "bulk-leasequery", question: "Is bulk leasequery intended for operational lease-state retrieval?", options: choices, correctIndex: 0, rule: "Bulk Leasequery lets authorized requestors retrieve lease-state data efficiently.", evidence: "The exchange is a server-side operational protocol rather than client DORA.", consequence: "Access must be restricted because lease data can expose network and subscriber state.", referenceLabel: "RFC 6607", referenceUrl: "https://www.rfc-editor.org/rfc/rfc6607" }),
  check({ id: "failover-boundary", question: "Does RFC 8156 standardize DHCPv4 failover?", options: ["Yes, for DHCPv4", "No, it defines DHCPv6 failover"], correctIndex: 1, rule: "RFC 8156 defines DHCPv6 failover, not DHCPv4 failover.", evidence: "Its protocol and state model apply to DHCPv6 server relationships.", consequence: "DHCPv4 high availability and failover examples must be described as vendor-specific behavior, not this Internet standard.", referenceLabel: "RFC 8156", referenceUrl: "https://www.rfc-editor.org/rfc/rfc8156" }),
] as const;
