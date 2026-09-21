import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/routing-protocols", name), "utf8");

describe("Routing fundamentals content", () => {
  it("keeps administrative distance, metrics, and the route-selection player public", () => {
    const lesson = read("routing-fundamentals.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "why-routing-protocols-exist",
      "administrative-distance-and-trustworthiness",
      "how-routing-metrics-are-calculated",
      "distance-vector-link-state-and-path-vector",
      "interactive-route-selection",
      "choosing-an-igp-or-egp",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<RouteSelectionPacketFlow");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(5);
    for (const phrase of ["administrative distance", "hop count", "cost = reference bandwidth", "composite metric", "distance-vector", "link-state", "path-vector", "autonomous system"])
      expect(lesson.toLowerCase()).toContain(phrase.toLowerCase());
  });

  it("protects evidence, guided practice, troubleshooting, checks, and the RFC-level deep dive", () => {
    const lesson = read("routing-fundamentals.account.mdx");
    for (const id of ["inspect-routing-table-evidence", "guided-metric-calculation-practice", "troubleshoot-routing-selection", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["ROUTING_FUNDAMENTALS_ACCOUNT_SENTINEL", "show ip route", "IP protocol 89", "IP protocol 88", "TCP port 179"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("K-values");
  });
});
