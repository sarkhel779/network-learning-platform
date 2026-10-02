import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/wireless-networking", name), "utf8");

describe("802.11 standards and association content", () => {
  it("keeps amendments, generation names, scanning, association, the interactive player, and roaming public", () => {
    const lesson = read("80211-standards-and-association.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "the-80211-amendment-alphabet",
      "wi-fi-generation-names",
      "passive-and-active-scanning",
      "authentication-and-association",
      "interactive-the-association-state-machine",
      "fast-roaming-with-80211r-k-and-v",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<AssociationStateMachinePacketFlow");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(5);
    for (const phrase of ["802.11n", "802.11ac", "802.11ax", "802.11be", "Wi-Fi 6", "Probe Request", "Association ID", "802.11r", "802.11k", "802.11v"])
      expect(lesson).toContain(phrase);
  });

  it("protects evidence, guided practice, troubleshooting, checks, and the pro deep dive", () => {
    const lesson = read("80211-standards-and-association.account.mdx");
    for (const id of ["inspect-association-evidence", "guided-standards-practice", "troubleshoot-association-issues", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["80211_STANDARDS_AND_ASSOCIATION_ACCOUNT_SENTINEL", "wlan.fc.type_subtype"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("Multi-Link Operation");
  });
});
