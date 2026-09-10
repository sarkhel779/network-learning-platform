import { describe, expect, it } from "vitest";

import { parseDnsIncident, parseDnsRfcCheck, parseDnsScenario, parseDnsTiming } from "./dns.schema";

const question = { name: "www.example.test.", type: "A", class: "IN" };
const soa = {
  owner: "example.test.", type: "SOA", class: "IN", ttl: 300, rdLength: 48,
  data: "ns1.example.test. hostmaster.example.test. 2026091101 3600 900 1209600 300",
  purpose: "Supplies authority and negative-cache timing.",
};
const query = {
  transport: "UDP", sourcePort: 53000, destinationPort: 53,
  header: { id: "0x1234", qr: false, opcode: 0, aa: false, tc: false, rd: true, ra: false, ad: false, cd: false, rcode: "NOERROR", qdCount: 1, anCount: 0, nsCount: 0, arCount: 0 },
  question: [question], answer: [], authority: [], additional: [],
};
const response = {
  ...query, sourcePort: 53, destinationPort: 53000,
  header: { ...query.header, qr: true, aa: true, ra: true, anCount: 1 },
  answer: [{ owner: "www.example.test.", type: "A", class: "IN", ttl: 300, rdLength: 4, data: "203.0.113.80", purpose: "Returns the requested IPv4 address." }],
};
const validScenario = {
  id: "answer", title: "Answer", description: "Resolve a name.",
  steps: [
    { id: "query", title: "Query", roles: { sender: "stub", receiver: "recursive" }, classification: "query", message: query, cache: { result: "miss", entries: [], explanation: "No cached answer." }, explanation: "Ask the resolver.", evidence: "RD is set.", terminal: false },
    { id: "response", title: "Response", roles: { sender: "authoritative", receiver: "recursive" }, classification: "answer", message: response, cache: { result: "store", entries: [{ name: "www.example.test.", type: "A", originalTtl: 300, remainingTtl: 300 }], explanation: "Store the answer." }, explanation: "Authority answers.", evidence: "AA is set.", terminal: true },
  ], conclusion: "The address is known.",
};

describe("DNS scenario contracts", () => {
  it("accepts a consistent DNS exchange", () => {
    expect(parseDnsScenario(validScenario).steps[1].message.header.qr).toBe(true);
  });

  it("rejects malformed names, duplicate steps, and invalid ports", () => {
    expect(() => parseDnsScenario({ ...validScenario, steps: [{ ...validScenario.steps[0], message: { ...query, question: [{ ...question, name: "not absolute" }] } }] })).toThrow(/absolute/i);
    expect(() => parseDnsScenario({ ...validScenario, steps: [validScenario.steps[0], { ...validScenario.steps[0], terminal: true }] })).toThrow(/unique/i);
    expect(() => parseDnsScenario({ ...validScenario, steps: [{ ...validScenario.steps[0], message: { ...query, sourcePort: 70_000 }, terminal: true }] })).toThrow();
  });

  it("rejects contradictory flags and section counts", () => {
    expect(() => parseDnsScenario({ ...validScenario, steps: [{ ...validScenario.steps[1], message: { ...response, header: { ...response.header, qr: false } } }] })).toThrow(/QR/i);
    expect(() => parseDnsScenario({ ...validScenario, steps: [{ ...validScenario.steps[0], message: { ...query, header: { ...query.header, aa: true } }, terminal: true }] })).toThrow(/query.*AA/i);
    expect(() => parseDnsScenario({ ...validScenario, steps: [{ ...validScenario.steps[1], message: { ...response, header: { ...response.header, anCount: 2 } } }] })).toThrow(/ANCOUNT/i);
  });

  it("rejects CNAME cycles and negative caching without SOA evidence", () => {
    const cnameResponse = { ...response, header: { ...response.header, anCount: 2 }, answer: [
      { owner: "a.example.test.", type: "CNAME", class: "IN", ttl: 60, rdLength: 10, data: "b.example.test.", purpose: "Alias." },
      { owner: "b.example.test.", type: "CNAME", class: "IN", ttl: 60, rdLength: 10, data: "a.example.test.", purpose: "Alias." },
    ] };
    expect(() => parseDnsScenario({ ...validScenario, steps: [{ ...validScenario.steps[1], message: cnameResponse }] })).toThrow(/CNAME cycle/i);
    const nx = { ...response, header: { ...response.header, rcode: "NXDOMAIN", anCount: 0, nsCount: 0 }, answer: [], authority: [] };
    expect(() => parseDnsScenario({ ...validScenario, steps: [{ ...validScenario.steps[1], classification: "negative", message: nx, cache: { result: "negative-store", entries: [], explanation: "Cache absence." } }] })).toThrow(/SOA/i);
    expect(parseDnsScenario({ ...validScenario, steps: [{ ...validScenario.steps[1], classification: "negative", message: { ...nx, header: { ...nx.header, nsCount: 1 }, authority: [soa] }, cache: { result: "negative-store", entries: [], explanation: "Cache absence." } }] }).steps[0].classification).toBe("negative");
  });

  it("requires exactly one terminal step and matching classifications", () => {
    expect(() => parseDnsScenario({ ...validScenario, steps: validScenario.steps.map((step) => ({ ...step, terminal: false })) })).toThrow(/terminal/i);
    expect(() => parseDnsScenario({ ...validScenario, steps: [{ ...validScenario.steps[1], classification: "referral" }] })).toThrow(/referral/i);
  });

  it("validates incident, timing, and RFC-check boundaries", () => {
    expect(parseDnsIncident({ id: "timeout", title: "Timeout", access: "account", evidence: ["No response"], choices: ["Timeout", "NXDOMAIN"], correctIndex: 0, diagnosis: "Transport timeout", explanation: "No DNS response arrived.", responsibleRole: "recursive", nextStep: "Test port 53." }).correctIndex).toBe(0);
    expect(parseDnsTiming({ id: "cold", title: "Cold", events: [{ id: "start", milliseconds: 0, title: "Start", explanation: "Query begins.", cacheState: "miss" }] }).events).toHaveLength(1);
    expect(() => parseDnsRfcCheck({ id: "bad", question: "What does TC mean?", options: ["Truncated", "Trusted"], correctIndex: 0, rule: "Retry as appropriate.", evidence: "TC=1", consequence: "The full answer needs another exchange.", referenceLabel: "RFC 1035", referenceUrl: "https://example.com" })).toThrow(/rfc-editor/i);
  });
});
