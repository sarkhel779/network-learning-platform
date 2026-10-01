import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/security-protocols", name), "utf8");

describe("PKI content", () => {
  it("keeps what PKI is, certificates, the chain of trust, validation, and the chain-validation player public", () => {
    const lesson = read("pki.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "what-pki-is",
      "x509-certificates",
      "the-chain-of-trust",
      "certificate-validation",
      "interactive-certificate-chain-validation",
      "certificate-revocation",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<CertificateChainValidationPacketFlow");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(5);
    for (const phrase of ["RFC 5280", "certificate authorities", "root ca", "intermediate ca", "trust store", "subject alternative name", "ocsp", "crl"])
      expect(lesson.toLowerCase()).toContain(phrase.toLowerCase());
  });

  it("protects evidence, guided practice, troubleshooting, checks, and the RFC-level deep dive", () => {
    const lesson = read("pki.account.mdx");
    for (const id of ["inspect-pki-evidence", "guided-chain-of-trust-practice", "troubleshoot-pki", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["PKI_ACCOUNT_SENTINEL", "openssl x509", "openssl verify", "soft-fail"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("Certificate Transparency");
  });
});
