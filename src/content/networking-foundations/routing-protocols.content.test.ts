import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/networking-foundations", name), "utf8");

describe("Routing protocols content", () => {
  it("keeps the protocol survey and the selector player public", () => {
    const lesson = read("routing-protocols.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual(["why-routing-protocols-exist", "static-vs-dynamic-routing", "distance-vector-vs-link-state", "rip-basics", "ospf-basics", "bgp-basics", "interactive-protocol-selection", "choosing-a-routing-protocol"]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<RoutingProtocolSelectorPlayer");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(7);
    for (const phrase of ["distance-vector", "link-state", "hop count", "shortest-path", "autonomous systems", "path-vector", "eBGP", "iBGP"])
      expect(lesson.toLowerCase()).toContain(phrase.toLowerCase());
  });

  it("protects EIGRP depth, evidence, practice, troubleshooting, checks, and advanced depth", () => {
    const lesson = read("routing-protocols.account.mdx");
    for (const id of ["eigrp-basics", "inspect-routing-protocol-evidence", "guided-protocol-selection-practice", "troubleshoot-routing-protocols", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["ROUTING_PROTOCOLS_ACCOUNT_SENTINEL", "DUAL", "show ip protocols", "show ip ospf neighbor", "show ip bgp summary", "Wireshark", "Established"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("best-path selection");
  });
});
