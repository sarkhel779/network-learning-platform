import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/security-protocols", name), "utf8");

describe("TLS content", () => {
  it("keeps what TLS is, the handshake, key exchange, certificates, and the handshake player public", () => {
    const lesson = read("tls.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "what-tls-is",
      "the-tls-handshake",
      "key-exchange-and-cipher-suites",
      "certificates-and-server-authentication",
      "interactive-tls-handshake",
      "tls-record-protocol-and-data-protection",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<TlsHandshakePacketFlow");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(5);
    for (const phrase of ["RFC 8446", "one round trip", "(EC)DHE", "perfect forward secrecy", "certificate", "SNI", "AEAD"])
      expect(lesson.toLowerCase()).toContain(phrase.toLowerCase());
  });

  it("protects evidence, guided practice, troubleshooting, checks, and the RFC-level deep dive", () => {
    const lesson = read("tls.account.mdx");
    for (const id of ["inspect-tls-evidence", "guided-tls-handshake-practice", "troubleshoot-tls", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["TLS_ACCOUNT_SENTINEL", "openssl s_client", "tls1_3", "forward secrecy"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("0-RTT");
  });
});
