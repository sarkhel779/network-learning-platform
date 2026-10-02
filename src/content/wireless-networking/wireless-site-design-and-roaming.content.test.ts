import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/wireless-networking", name), "utf8");

describe("Wireless site design and roaming content", () => {
  it("keeps propagation, surveys, AP placement, the sticky client problem, the interactive player, and capacity design public", () => {
    const lesson = read("wireless-site-design-and-roaming.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "rf-propagation-and-attenuation",
      "site-surveys-predictive-active-and-passive",
      "ap-placement-and-cell-design",
      "the-sticky-client-problem",
      "interactive-the-sticky-client-and-the-roaming-trigger",
      "capacity-vs-coverage-design",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<StickyClientRoamingPacketFlow");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(5);
    for (const phrase of ["attenuation", "multipath", "predictive survey", "active survey", "passive survey", "co-channel interference", "sticky client", "802.11k", "802.11v", "capacity-based design"])
      expect(lesson.toLowerCase()).toContain(phrase.toLowerCase());
  });

  it("protects evidence, guided practice, troubleshooting, checks, and the pro deep dive", () => {
    const lesson = read("wireless-site-design-and-roaming.account.mdx");
    for (const id of ["inspect-site-design-evidence", "guided-site-design-practice", "troubleshoot-coverage-and-roaming", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["WIRELESS_SITE_DESIGN_AND_ROAMING_ACCOUNT_SENTINEL", "wlan.fc.type_subtype"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("RTLS");
  });
});
