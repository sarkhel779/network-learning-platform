import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/security-protocols", name), "utf8");

describe("IPsec content", () => {
  it("keeps what IPsec is, IKE/SAs, AH/ESP, modes, and the tunnel-establishment player public", () => {
    const lesson = read("ipsec.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "what-ipsec-is",
      "ike-and-security-associations",
      "ah-and-esp",
      "transport-vs-tunnel-mode",
      "interactive-ipsec-tunnel-establishment",
      "nat-traversal-and-practical-considerations",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<IpsecTunnelEstablishmentPacketFlow");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(5);
    for (const phrase of ["RFC 4301", "security association", "IKEv2", "authentication header", "encapsulating security payload", "tunnel mode", "NAT-T"])
      expect(lesson.toLowerCase()).toContain(phrase.toLowerCase());
  });

  it("protects evidence, guided practice, troubleshooting, checks, and the RFC-level deep dive", () => {
    const lesson = read("ipsec.account.mdx");
    for (const id of ["ikev1-modes-main-aggressive-and-quick", "inspect-ipsec-evidence", "guided-ipsec-mode-practice", "troubleshoot-ipsec", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["IPSEC_ACCOUNT_SENTINEL", "show crypto isakmp sa", "show crypto ipsec sa", "isakmp || esp", "Main Mode", "Aggressive Mode", "Quick Mode", "IKEv1", "CREATE_CHILD_SA"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("MOBIKE");
  });
});
