import { type DnsMessage, type DnsRecord, type DnsScenario, type DnsStep, parseDnsScenario } from "./dns.schema";

const qname = "www.example.test.";
const question = [{ name: qname, type: "A" as const, class: "IN" as const }];
const header = (qr: boolean, counts = { answer: 0, authority: 0, additional: 0 }) => ({
  id: "0x4d2a", qr, opcode: 0, aa: false, tc: false, rd: true, ra: qr,
  ad: false, cd: false, rcode: "NOERROR" as const, qdCount: 1,
  anCount: counts.answer, nsCount: counts.authority, arCount: counts.additional,
});
const message = (overrides: Partial<DnsMessage> = {}): DnsMessage => ({
  transport: "UDP", sourcePort: 53000, destinationPort: 53, header: header(false),
  question, answer: [], authority: [], additional: [], ...overrides,
});
const record = (owner: string, type: DnsRecord["type"], data: string, purpose: string, ttl = 300): DnsRecord => ({
  owner, type, class: "IN", ttl, rdLength: Math.max(4, data.length), data, purpose,
});
const a = record(qname, "A", "203.0.113.80", "Returns the requested IPv4 address.");
const aaaa = record(qname, "AAAA", "2001:db8::80", "Returns the requested IPv6 address.");
const tldNs = record("test.", "NS", "a.nic.test.", "Delegates the test zone.", 172800);
const tldGlue = record("a.nic.test.", "A", "192.0.2.53", "Makes the delegated name server reachable.", 172800);
const authNs = record("example.test.", "NS", "ns1.example.test.", "Delegates the example.test zone.", 86400);
const authGlue = record("ns1.example.test.", "A", "198.51.100.53", "Makes the authoritative server reachable.", 86400);
const soa = record("example.test.", "SOA", "ns1.example.test. hostmaster.example.test. 2026091101 3600 900 1209600 300", "Proves authority and supplies negative-cache timing.", 300);
const cache = (result: DnsStep["cache"]["result"], explanation: string, entries: DnsStep["cache"]["entries"] = []): DnsStep["cache"] => ({ result, explanation, entries });
const step = (value: DnsStep): DnsStep => value;
const clientQuery = step({
  id: "stub-query", title: "Application asks its resolver", roles: { sender: "stub", receiver: "recursive" }, classification: "query",
  message: message(), cache: cache("miss", "The recursive resolver has no usable answer."),
  explanation: "The stub requests recursive service from its configured resolver.", evidence: "RD=1 and destination UDP 53.", terminal: false,
});
const rootReferral = step({
  id: "root-referral", title: "Root refers the resolver to test", roles: { sender: "root", receiver: "recursive" }, classification: "referral",
  message: message({ sourcePort: 53, destinationPort: 53001, header: header(true, { answer: 0, authority: 1, additional: 1 }), authority: [tldNs], additional: [tldGlue] }),
  cache: cache("store", "The resolver can cache the test delegation."), explanation: "The root returns a referral rather than the final address.", evidence: "NS is in Authority and glue is in Additional.", terminal: false,
});
const tldReferral = step({
  id: "tld-referral", title: "TLD refers the resolver to example.test", roles: { sender: "tld", receiver: "recursive" }, classification: "referral",
  message: message({ sourcePort: 53, destinationPort: 53002, header: header(true, { answer: 0, authority: 1, additional: 1 }), authority: [authNs], additional: [authGlue] }),
  cache: cache("store", "The resolver can cache the example.test delegation."), explanation: "The TLD identifies the zone's authoritative server.", evidence: "Authority contains the child NS record.", terminal: false,
});
const finalAnswer = (answer: DnsRecord[], id = "final-answer"): DnsStep => step({
  id, title: "Authoritative answer returns", roles: { sender: "authoritative", receiver: "recursive" }, classification: "answer",
  message: message({ sourcePort: 53, destinationPort: 53003, header: { ...header(true, { answer: answer.length, authority: 0, additional: 0 }), aa: true }, answer }),
  cache: cache("store", "The resolver stores eligible records until their TTL expires.", answer.map(({ owner, type, ttl }) => ({ name: owner, type, originalTtl: ttl, remainingTtl: ttl }))),
  explanation: "The authoritative server supplies the requested data.", evidence: "AA=1 and the Answer section contains the result.", terminal: true,
});

const coldCache = { id: "cold-cache", title: "Cold-cache recursive lookup", description: "Follow the complete hierarchy with an empty cache.", steps: [clientQuery, rootReferral, tldReferral, finalAnswer([a])], conclusion: "The resolver returns and caches the address." };
const warmCache = { id: "warm-cache", title: "Warm-cache answer", description: "Reuse an unexpired cached address.", steps: [
  clientQuery,
  { ...finalAnswer([a], "cached-response"), roles: { sender: "recursive" as const, receiver: "stub" as const }, title: "Resolver answers from cache", cache: cache("hit", "The cached answer still has 214 seconds remaining.", [{ name: qname, type: "A" as const, originalTtl: 300, remainingTtl: 214 }]), explanation: "No upstream server is contacted.", evidence: "Remaining TTL is positive." },
], conclusion: "A warm cache shortens the path." };
const cname = record(qname, "CNAME", "edge.example.test.", "Redirects the alias to its canonical owner.");
const cnameA = record("edge.example.test.", "A", "203.0.113.80", "Returns the canonical owner's IPv4 address.");
const cnameChain = { id: "cname-chain", title: "CNAME chain", description: "Follow an alias to address data.", steps: [clientQuery, rootReferral, tldReferral, finalAnswer([cname, cnameA])], conclusion: "The alias and canonical address are both understood." };
const aaaaAnswer = { id: "aaaa-answer", title: "AAAA lookup", description: "Request IPv6 address data independently.", steps: [{ ...clientQuery, message: message({ question: [{ ...question[0], type: "AAAA" as const }] }) }, { ...finalAnswer([aaaa]), message: message({ sourcePort: 53, destinationPort: 53003, question: [{ ...question[0], type: "AAAA" as const }], header: { ...header(true, { answer: 1, authority: 0, additional: 0 }), aa: true }, answer: [aaaa] }) }], conclusion: "AAAA returns IPv6 data, not an IPv4 substitute." };
const truncated = step({ id: "udp-truncated", title: "UDP response is truncated", roles: { sender: "authoritative", receiver: "recursive" }, classification: "answer", message: message({ sourcePort: 53, destinationPort: 53003, header: { ...header(true), aa: true, tc: true } }), cache: cache("unchanged", "An incomplete answer is not cached as final data."), explanation: "The response cannot carry the complete answer on this UDP path.", evidence: "TC=1.", terminal: false });
const tcpQuery = step({ id: "tcp-retry", title: "Resolver retries over TCP", roles: { sender: "recursive", receiver: "authoritative" }, classification: "query", message: message({ transport: "TCP", sourcePort: 53004, destinationPort: 53 }), cache: cache("unchanged", "The resolver is still waiting for complete data."), explanation: "TCP provides the complete DNS message stream.", evidence: "TCP destination port 53.", terminal: false });
const truncatedTcp = { id: "truncated-tcp-retry", title: "Truncation and TCP retry", description: "Inspect transport fallback after TC=1.", steps: [clientQuery, truncated, tcpQuery, { ...finalAnswer([a]), message: message({ transport: "TCP", sourcePort: 53, destinationPort: 53004, header: { ...header(true, { answer: 1, authority: 0, additional: 0 }), aa: true }, answer: [a] }) }], conclusion: "TCP returns the complete answer." };
const negative = step({ id: "negative-answer", title: "Authoritative NXDOMAIN", roles: { sender: "authoritative", receiver: "recursive" }, classification: "negative", message: message({ sourcePort: 53, destinationPort: 53003, header: { ...header(true, { answer: 0, authority: 1, additional: 0 }), aa: true, rcode: "NXDOMAIN" }, authority: [soa] }), cache: cache("negative-store", "The SOA supplies the negative-cache boundary."), explanation: "The authoritative server says the queried name does not exist.", evidence: "RCODE=NXDOMAIN with SOA in Authority.", terminal: true });
const nxdomain = { id: "nxdomain", title: "NXDOMAIN", description: "Trace an authoritative negative answer.", steps: [clientQuery, rootReferral, tldReferral, negative], conclusion: "The resolver can cache the authoritative negative result." };

export const resolutionScenarios: readonly DnsScenario[] = [coldCache, warmCache, cnameChain, aaaaAnswer, truncatedTcp, nxdomain].map(parseDnsScenario);
export const buildResolutionJourney = (scenario: DnsScenario): readonly DnsStep[] => scenario.steps;
