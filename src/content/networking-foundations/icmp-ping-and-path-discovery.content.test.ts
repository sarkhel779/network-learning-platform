import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/networking-foundations", name), "utf8");

describe("ICMP, Ping and Path Discovery content", () => {
  it("keeps the complete packet-first foundation and both players public", () => {
    const lesson = read("icmp-ping-and-path-discovery.public.mdx");
    expect([...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1])).toEqual([
      "why-icmp-exists", "icmp-message-anatomy", "informational-and-error-messages",
      "echo-request-and-reply", "interactive-ping-evidence", "what-successful-ping-proves",
      "timeouts-loss-and-rtt", "destination-unreachable", "ttl-exceeded",
      "interactive-traceroute-discovery", "why-traceroute-can-be-incomplete", "safe-conclusions",
    ]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<PingEvidencePlayer");
    expect(lesson).toContain("<TracerouteDiscoveryPlayer");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(10);
    for (const phrase of ["type", "code", "checksum", "quoted", "Echo Request", "Echo Reply", "Destination Unreachable", "Time Exceeded", "round-trip time", "no reply was observed", "does not prove", "different probe transports", "asymmetric return path", "silent hop"])
      expect(lesson.toLowerCase()).toContain(phrase.toLowerCase());
  });

  it("protects inspection, diagnosis, troubleshooting, checks, and Pro depth", () => {
    const lesson = read("icmp-ping-and-path-discovery.account.mdx");
    for (const id of ["inspect-icmp-evidence", "guided-icmp-diagnosis", "troubleshoot-icmp", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["ICMP_ACCOUNT_SENTINEL", "Windows", "tracert", "Linux", "traceroute", "tracepath", "icmp.type == 0", "icmp.type == 3", "icmp.type == 11", "local policy", "remote policy", "return path", "application reachability"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    for (const phrase of ["rate-limited", "Path MTU Discovery", "fragmentation-needed", "asymmetric", "protocol-specific"])
      expect(lesson).toContain(phrase);
  });
});
