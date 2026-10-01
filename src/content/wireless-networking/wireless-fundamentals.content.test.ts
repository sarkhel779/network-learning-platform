import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/wireless-networking", name), "utf8");

describe("Wireless fundamentals content", () => {
  it("keeps bands, roles, CSMA/CA, the interactive player, and interference public", () => {
    const lesson = read("wireless-fundamentals.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "what-wireless-networking-is",
      "radio-frequency-bands-and-channels",
      "wireless-network-roles-and-topologies",
      "csma-ca-and-collision-avoidance",
      "interactive-csma-ca-and-the-hidden-node-problem",
      "signal-strength-and-interference",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<CsmaCaHiddenNodePacketFlow");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(5);
    for (const phrase of ["2.4 GHz", "5 GHz", "6 GHz", "CSMA/CA", "CSMA/CD", "hidden node", "RSSI", "dBm", "BSS", "SSID"])
      expect(lesson).toContain(phrase);
  });

  it("protects evidence, guided practice, troubleshooting, checks, and the RFC-level deep dive", () => {
    const lesson = read("wireless-fundamentals.account.mdx");
    for (const id of ["inspect-wireless-evidence", "guided-channel-planning-practice", "troubleshoot-wireless-basics", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["WIRELESS_FUNDAMENTALS_ACCOUNT_SENTINEL", "wlan.fc.type_subtype", "RTS", "CTS"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("MU-MIMO");
  });
});
