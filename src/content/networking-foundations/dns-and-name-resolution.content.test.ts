import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (tier: string) => readFileSync(join(process.cwd(), "src/content/networking-foundations", `dns-and-name-resolution.${tier}.mdx`), "utf8");

describe("DNS and name resolution content", () => {
  it("keeps the complete beginner resolution model and two evaluations public", () => {
    const lesson = read("public");
    expect([...lesson.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)].map((match) => match[2])).toEqual([
      "Why name resolution exists", "DNS roles and responsibility boundaries", "Domain labels, zones, and delegation",
      "Recursive service versus iterative referrals", "Interactive complete DNS resolution", "DNS message and header structure",
      "Common record types and selection rules", "UDP 53, TCP 53, EDNS, and encrypted DNS", "Caching, TTL, and negative caching",
      "Response codes and NODATA", "Reverse DNS", "Interactive DNS troubleshooting", "Practical command and capture evidence",
      "Common DNS misconceptions", "Summary and next steps",
    ]);
    expect(lesson).toContain('<DnsResolutionPlayer progressItemId="dns_name_resolution_interactive_complete_resolution" />');
    expect(lesson).toContain('<DnsTroubleshootingPlayer access="public" />');
    for (const type of ["A", "AAAA", "CNAME", "NS", "SOA", "MX", "TXT", "PTR", "SRV", "CAA"]) expect(lesson).toContain(`**${type}**`);
    for (const result of ["NOERROR", "NODATA", "NXDOMAIN", "SERVFAIL", "REFUSED", "FORMERR"]) expect(lesson).toContain(result);
    expect(lesson).toMatch(/UDP 53[\s\S]*TCP 53[\s\S]*EDNS/);
    expect(lesson).toMatch(/nslookup[\s\S]*Resolve-DnsName[\s\S]*dig[\s\S]*Wireshark/);
    expect(lesson).not.toMatch(/root-server-bootstrap-bonus|RootBootstrapPlayer/);
  });

  it("reserves guided practice and three immediate checks for accounts", () => {
    const lesson = read("account");
    expect(lesson).toContain('<DnsTroubleshootingPlayer access="account" progressItemId="dns_name_resolution_interactive_troubleshooting" />');
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    for (const id of ["cold-warm-cache-practice", "record-selection-practice", "dns-packet-capture-practice", "knowledge-check-summary"]) expect(lesson).toContain(`id="${id}"`);
    expect(lesson).not.toMatch(/root-server-bootstrap-bonus|RootBootstrapPlayer/);
  });

  it("keeps timing, Wireshark, RFC, DNSSEC, and root bootstrap in Pro", () => {
    const lesson = read("pro");
    expect(lesson).toContain("<DnsTimingPlayer />");
    expect(lesson.match(/<DnsRfcCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("DS → DNSKEY → RRSIG");
    expect(lesson).toContain("NSEC/NSEC3");
    expect(lesson).toContain("Wireshark");
    expect(lesson).toContain('id="root-server-bootstrap-bonus"');
    expect(lesson).toContain("<RootBootstrapPlayer />");
  });
});
