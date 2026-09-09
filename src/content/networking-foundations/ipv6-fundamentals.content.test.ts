import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/networking-foundations", name), "utf8");

describe("IPv6 Fundamentals content", () => {
  it("keeps the complete foundation and both players public", () => {
    const lesson = read("ipv6-fundamentals.public.mdx");
    for (const id of ["why-ipv6-exists", "address-structure-hex", "expand-shorten", "interactive-address-explorer", "prefixes-interface-identifiers", "address-types-scopes", "no-broadcast", "neighbor-discovery-icmpv6", "interactive-ndp-slaac", "default-router-local-delivery"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["fe80::/10", "fc00::/7", "ff00::/8", "2001:db8::/32", "IPv6 has no broadcast", "unspecified source"])
      expect(lesson.toLowerCase()).toContain(phrase.toLowerCase());
    expect(lesson).toContain("<Ipv6AddressExplorer");
    expect(lesson).toContain("<NdpSlaacJourneyPlayer");
  });

  it("protects evidence, practice, troubleshooting, checks and Pro depth", () => {
    const lesson = read("ipv6-fundamentals.account.mdx");
    for (const id of ["inspect-ipv6-evidence", "practice-ipv6", "troubleshoot-ipv6", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["IPV6_ACCOUNT_SENTINEL", "Windows", "Linux", "ipv6", "icmpv6"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
  });
});
