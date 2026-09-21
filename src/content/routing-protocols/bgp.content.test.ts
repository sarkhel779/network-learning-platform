import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/routing-protocols", name), "utf8");

describe("BGP content", () => {
  it("keeps path attributes, the FSM, and the session-establishment player public", () => {
    const lesson = read("bgp.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "what-bgp-is",
      "bgp-message-types",
      "the-bgp-finite-state-machine",
      "path-attributes",
      "interactive-bgp-session-establishment",
      "the-bgp-decision-process",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<BgpSessionEstablishmentPacketFlow");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(5);
    for (const phrase of ["RFC 4271", "path-vector", "autonomous system", "eBGP", "iBGP", "TCP port 179", "OPEN", "UPDATE", "NOTIFICATION", "KEEPALIVE", "Established", "AS_PATH", "NEXT_HOP", "ORIGIN", "LOCAL_PREF", "MED"])
      expect(lesson).toContain(phrase);
  });

  it("protects evidence, path-selection practice, troubleshooting, checks, and the community/reflector deep dive", () => {
    const lesson = read("bgp.account.mdx");
    for (const id of ["inspect-bgp-evidence", "guided-bgp-path-selection-practice", "troubleshoot-bgp", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["BGP_ACCOUNT_SENTINEL", "show ip bgp summary", "show ip bgp", "TCP port 179", "Active"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("route reflectors");
  });
});
