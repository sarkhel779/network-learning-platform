import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/security-protocols", name), "utf8");

describe("Security fundamentals content", () => {
  it("keeps the CIA triad, threats, cryptography, hashing, and the key-exchange player public", () => {
    const lesson = read("security-fundamentals.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "why-network-security-matters",
      "common-threats-and-attacks",
      "symmetric-and-asymmetric-cryptography",
      "hashing-and-integrity",
      "interactive-diffie-hellman-key-exchange",
      "where-these-protocols-fit",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<DiffieHellmanKeyExchangePacketFlow");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(5);
    for (const phrase of ["confidentiality", "integrity", "availability", "man-in-the-middle", "symmetric", "asymmetric", "hmac", "discrete logarithm"])
      expect(lesson.toLowerCase()).toContain(phrase.toLowerCase());
  });

  it("protects evidence, guided practice, troubleshooting, checks, and the RFC-level deep dive", () => {
    const lesson = read("security-fundamentals.account.mdx");
    for (const id of ["inspect-security-evidence", "guided-cryptography-practice", "troubleshoot-security-basics", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["SECURITY_FUNDAMENTALS_ACCOUNT_SENTINEL", "openssl s_client", "tls.handshake", "hybrid encryption"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("perfect forward secrecy");
  });
});
