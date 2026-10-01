import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/security-protocols", name), "utf8");

describe("SSH content", () => {
  it("keeps what SSH is, the transport layer, auth methods, channels, and the key-auth player public", () => {
    const lesson = read("ssh.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "what-ssh-is",
      "the-ssh-transport-layer",
      "ssh-authentication-methods",
      "the-ssh-connection-protocol-and-channels",
      "interactive-ssh-key-authentication",
      "host-key-verification-and-trust-on-first-use",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<SshKeyAuthenticationPacketFlow");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(5);
    for (const phrase of ["RFC 4251", "host key", "public-key authentication", "trust-on-first-use", "authorized_keys", "known_hosts", "channels"])
      expect(lesson.toLowerCase()).toContain(phrase.toLowerCase());
  });

  it("protects evidence, guided practice, troubleshooting, checks, and the RFC-level deep dive", () => {
    const lesson = read("ssh.account.mdx");
    for (const id of ["inspect-ssh-evidence", "guided-ssh-key-practice", "troubleshoot-ssh", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["SSH_ACCOUNT_SENTINEL", "ssh -v", "ssh-keygen -lf", "REMOTE HOST IDENTIFICATION HAS CHANGED"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("SSH certificates");
  });
});
