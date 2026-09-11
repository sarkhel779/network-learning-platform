import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (tier: string) => readFileSync(join(process.cwd(), "src/content/networking-foundations", `nat-pat-and-the-complete-internet-packet-journey.${tier}.mdx`), "utf8");

describe("NAT, PAT and the complete Internet packet journey content", () => {
  it("keeps the complete IPv4 translation model public", () => {
    const lesson = read("public");
    for (const heading of ["The IPv4 translation boundary", "NAT vocabulary and address realms", "Static NAT and port forwarding", "Dynamic NAT and address pools", "PAT and translation-table state", "Complete Internet packet journey", "Return traffic, timeouts, and failure modes"]) expect(lesson).toContain(heading);
    for (const range of ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]) expect(lesson).toContain(range);
    for (const term of ["inside local", "inside global", "outside local", "outside global", "static NAT", "dynamic NAT", "PAT"]) expect(lesson.toLowerCase()).toContain(term.toLowerCase());
    expect(lesson).toMatch(/DNS[\s\S]*TCP[\s\S]*HTTPS[\s\S]*443[\s\S]*reverse translation/i);
    expect(lesson).toContain("NAT is not a firewall");
    expect(lesson).toContain("NAT64 and NPTv6");
    expect(lesson).not.toMatch(/NatCaptureAnalysisLab|U-Turn NAT lab/);
  });

  it("provides controllable mapping and troubleshooting practice to account users", () => {
    const lesson = read("account");
    expect(lesson).toContain('progressItemId="nat_pat_interactive_journey"');
    expect(lesson).toContain('<NatMappingLab progressItemId="nat_pat_mapping_lab" />');
    expect(lesson).toContain('<NatTroubleshootingLab progressItemId="nat_pat_troubleshooting_lab" />');
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(5);
    expect(lesson).not.toMatch(/NatCaptureAnalysisLab|hairpinBidirectionalJourney/);
  });

  it("reserves Wireshark, RFC validation, and both U-Turn paths for Pro", () => {
    const lesson = read("pro");
    expect(lesson).toContain("<NatCaptureAnalysisLab />");
    expect(lesson).toContain("<NatRfcValidationLab />");
    expect(lesson).toContain("hairpinDnatOnlyJourney");
    expect(lesson).toContain("hairpinBidirectionalJourney");
    expect(lesson).toMatch(/10\.0\.0\.25:51514[\s\S]*203\.0\.113\.10:443[\s\S]*10\.0\.0\.50:443/);
    expect(lesson).toMatch(/mismatched peer tuple[\s\S]*paired DNAT and SNAT/i);
    for (const reference of ["RFC 2663", "RFC 3022", "RFC 4787", "RFC 5382", "RFC 5508", "RFC 7857"]) expect(lesson).toContain(reference);
  });
});
