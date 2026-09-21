import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/routing-protocols", name), "utf8");

describe("OSPF content", () => {
  it("keeps areas, LSA types, and the adjacency player public", () => {
    const lesson = read("ospf.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "what-ospf-is",
      "ospf-cost-and-the-link-state-database",
      "ospf-packet-types",
      "forming-an-ospf-adjacency",
      "interactive-ospf-adjacency",
      "ospf-areas-and-lsa-types",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<OspfAdjacencyPacketFlow");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(5);
    for (const phrase of ["RFC 2328", "link-state", "Dijkstra", "Router ID", "IP protocol 89", "Down", "ExStart", "Exchange", "Loading", "Full", "Area 0", "Type 1", "Type 3", "Type 5"])
      expect(lesson).toContain(phrase);
  });

  it("protects evidence, cost practice, troubleshooting, checks, and the LSA deep dive", () => {
    const lesson = read("ospf.account.mdx");
    for (const id of ["inspect-ospf-evidence", "guided-ospf-cost-practice", "troubleshoot-ospf", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["OSPF_ACCOUNT_SENTINEL", "show ip ospf neighbor", "show ip ospf database", "MTU mismatch", "Router ID"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("NSSA");
  });
});
