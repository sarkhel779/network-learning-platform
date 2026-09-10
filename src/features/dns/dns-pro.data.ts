import { type DnsRfcCheck, type DnsTimingScenario, parseDnsRfcCheck, parseDnsTiming } from "./dns.schema";

const timing = (id: string, title: string, events: DnsTimingScenario["events"]): DnsTimingScenario => parseDnsTiming({ id, title, events });
export const dnsTimingScenarios: readonly DnsTimingScenario[] = [
  timing("cold-cache", "Cold cache", [
    { id: "query", milliseconds: 0, title: "Stub query", explanation: "The recursive resolver receives a new question.", cacheState: "Miss" },
    { id: "root", milliseconds: 18, title: "Root referral", explanation: "The resolver learns the TLD servers.", cacheState: "Store delegation" },
    { id: "answer", milliseconds: 61, title: "Final answer", explanation: "The authority returns the record.", cacheState: "Store answer" },
  ]),
  timing("warm-cache", "Warm cache", [
    { id: "hit", milliseconds: 0, title: "Cache hit", explanation: "An unexpired answer is available.", cacheState: "Hit: 214 seconds remain" },
    { id: "return", milliseconds: 2, title: "Cached response", explanation: "The resolver answers without an upstream query.", cacheState: "Hit" },
  ]),
  timing("delayed-authority", "Delayed authority", [
    { id: "send", milliseconds: 0, title: "Authority query", explanation: "The resolver sends the query.", cacheState: "Miss" },
    { id: "wait", milliseconds: 900, title: "Delayed response", explanation: "The authority responds before the resolver timeout.", cacheState: "Unchanged" },
  ]),
  timing("tcp-fallback", "UDP truncation and TCP fallback", [
    { id: "truncated", milliseconds: 0, title: "UDP response truncated", explanation: "TC=1 says the received UDP answer is incomplete.", cacheState: "TC=1; do not cache as complete" },
    { id: "tcp", milliseconds: 22, title: "TCP retry", explanation: "Triggered by TC=1, the resolver retries the DNS operation over TCP port 53.", cacheState: "Waiting for complete data" },
    { id: "complete", milliseconds: 49, title: "Complete response", explanation: "The complete TCP response can now be evaluated.", cacheState: "Store answer" },
  ]),
  timing("resolver-timeout", "Resolver timeout", [
    { id: "send", milliseconds: 0, title: "Query sent", explanation: "The client sends a DNS query.", cacheState: "Miss" },
    { id: "timeout", milliseconds: 2000, title: "Transport timeout", explanation: "No DNS response arrives, so there is no RCODE.", cacheState: "Unchanged" },
  ]),
  timing("dnssec-validation", "DNSSEC validation", [
    { id: "data", milliseconds: 0, title: "Signed data arrives", explanation: "The resolver receives data and its RRSIG.", cacheState: "Pending validation" },
    { id: "chain", milliseconds: 35, title: "Chain validated", explanation: "DS and DNSKEY evidence links the answer to a trust anchor.", cacheState: "Secure answer" },
  ]),
];

export const dnsRfcChecks: readonly DnsRfcCheck[] = [
  parseDnsRfcCheck({ id: "tcp-after-tc", question: "A UDP DNS response has TC=1. What should the resolver do to obtain the complete answer?", options: ["Retry over TCP port 53", "Treat it as NXDOMAIN", "Cache the partial message"], correctIndex: 0, rule: "General-purpose DNS implementations must support TCP, including when a complete exchange requires it.", evidence: "The response has TC=1 and the Answer section is incomplete.", consequence: "Blocking TCP port 53 can turn large valid answers into apparent DNS failures.", referenceLabel: "RFC 7766", referenceUrl: "https://www.rfc-editor.org/rfc/rfc7766.html#section-6.1.3" }),
  parseDnsRfcCheck({ id: "negative-cache", question: "What provides the cache boundary for an authoritative negative answer?", options: ["SOA data in the Authority section", "The query ID", "The client's source port"], correctIndex: 0, rule: "Negative caching derives its lifetime from authoritative SOA information.", evidence: "NXDOMAIN or NODATA is accompanied by the zone SOA.", consequence: "Missing or wrong SOA data changes how absence is cached.", referenceLabel: "RFC 2308", referenceUrl: "https://www.rfc-editor.org/rfc/rfc2308.html#section-3" }),
  parseDnsRfcCheck({ id: "edns-size", question: "What does an EDNS OPT record advertise?", options: ["Extended DNS capabilities including a UDP payload size", "A second authoritative zone", "Encryption of the whole resolution path"], correctIndex: 0, rule: "EDNS extends DNS signaling and advertises the requestor's UDP payload size.", evidence: "An OPT pseudo-record appears in the Additional section.", consequence: "Oversized datagrams may still fragment or fail along the path.", referenceLabel: "RFC 6891", referenceUrl: "https://www.rfc-editor.org/rfc/rfc6891.html#section-6" }),
];

export const dnssecWalkthrough = [
  { record: "DS", explanation: "The parent zone publishes a digest that identifies the child's trusted key material." },
  { record: "DNSKEY", explanation: "The child publishes public keys used to validate signatures over its DNS record sets." },
  { record: "RRSIG", explanation: "A signature covers a record set so a validating resolver can detect unauthorized change." },
  { record: "NSEC/NSEC3", explanation: "Authenticated denial records prove that a requested name or type does not exist." },
] as const;

export const rootBootstrapScenario = {
  title: "How a resolver finds the DNS root",
  steps: [
    { title: "The absolute name", explanation: "The final dot represents the DNS root, making the FQDN absolute. Resolver software begins with configured root hints." },
    { title: "Logical identities", explanation: "A through M are logical identities for the root-server system, not thirteen physical machines." },
    { title: "Anycast reachability", explanation: "Each logical identity can be served by many distributed anycast instances, and routing selects a reachable instance." },
    { title: "Cached delegation", explanation: "A cached delegation can let the resolver start below the root, so it does not contact a root server for every lookup." },
    { title: "Referral chain", explanation: "When required, a root referral leads to a TLD server and then to the domain's authoritative server." },
    { title: "Resilient bootstrap", explanation: "Operators refresh root hints, and failure of one address or path does not remove the distributed root service." },
  ],
} as const;
