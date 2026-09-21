import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/routing-protocols", name), "utf8");

describe("EIGRP content", () => {
  it("keeps the composite metric, DUAL, and the DUAL player public", () => {
    const lesson = read("eigrp.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "what-eigrp-is",
      "the-composite-metric",
      "dual-and-loop-free-paths",
      "eigrp-packet-types",
      "interactive-eigrp-dual",
      "eigrp-vs-classic-distance-vector",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<EigrpDualPacketFlow");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(5);
    for (const phrase of ["RFC 7868", "advanced distance-vector", "IP protocol 88", "DUAL", "Feasible Distance", "Reported Distance", "feasibility condition", "feasible successor", "Query", "Reply"])
      expect(lesson).toContain(phrase);
  });

  it("protects evidence, metric practice, troubleshooting, checks, and the K-value deep dive", () => {
    const lesson = read("eigrp.account.mdx");
    for (const id of ["inspect-eigrp-evidence", "guided-eigrp-metric-practice", "troubleshoot-eigrp", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["EIGRP_ACCOUNT_SENTINEL", "show ip eigrp neighbors", "show ip eigrp topology", "Stuck-In-Active", "Autonomous System"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("K-value");
  });
});
