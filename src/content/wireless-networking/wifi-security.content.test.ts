import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/wireless-networking", name), "utf8");

describe("Wi-Fi security content", () => {
  it("keeps WPA2/WPA3, the dictionary-attack problem, the interactive player, and Personal vs. Enterprise public", () => {
    const lesson = read("wifi-security.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "what-wifi-security-protects-against",
      "wpa2-and-the-4-way-handshake",
      "the-offline-dictionary-attack-problem",
      "wpa3-and-sae",
      "interactive-wpa2-handshake-and-the-wpa3-fix",
      "personal-vs-enterprise-authentication",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<Wpa2HandshakeAndWpa3FixPacketFlow");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(5);
    for (const phrase of ["WPA2", "WPA3", "4-way handshake", "PMK", "PTK", "SAE", "Dragonfly", "forward secrecy", "802.1X", "RADIUS"])
      expect(lesson).toContain(phrase);
  });

  it("protects evidence, guided practice, troubleshooting, checks, and the RFC-level deep dive", () => {
    const lesson = read("wifi-security.account.mdx");
    for (const id of ["inspect-wifi-security-evidence", "guided-handshake-practice", "troubleshoot-wifi-security", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["WIFI_SECURITY_ACCOUNT_SENTINEL", "eapol", "EAPOL"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("KRACK");
  });
});
