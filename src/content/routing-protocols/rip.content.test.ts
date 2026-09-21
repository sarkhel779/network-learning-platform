import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/routing-protocols", name), "utf8");

describe("RIP content", () => {
  it("keeps the packet format, loop prevention, and the RIP exchange player public", () => {
    const lesson = read("rip.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "what-rip-is",
      "rip-packet-format",
      "how-rip-updates-work",
      "preventing-routing-loops",
      "interactive-rip-exchange",
      "rip-limits-and-ripng",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<RipExchangePacketFlow");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(5);
    for (const phrase of ["RFC 2453", "RFC 1058", "hop count", "distance-vector", "split horizon", "poisoned reverse", "triggered update", "RIPng"])
      expect(lesson).toContain(phrase);
  });

  it("protects evidence, guided practice, troubleshooting, checks, and the authentication deep dive", () => {
    const lesson = read("rip.account.mdx");
    for (const id of ["inspect-rip-evidence", "guided-rip-convergence-practice", "troubleshoot-rip", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["RIP_ACCOUNT_SENTINEL", "show ip protocols", "show ip rip database", "counting to infinity", "metric 16"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("RFC 2082");
  });
});
