import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(process.cwd(), "src/content/networking-foundations", name), "utf8");

describe("Routing tables and default routes content", () => {
  it("keeps the complete routing method and both players public", () => {
    const lesson = read("routing-tables-and-default-routes.public.mdx");
    const headings = [...lesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual(["why-routing-exists", "route-table-anatomy", "route-sources", "how-prefix-matching-works", "interactive-route-selection", "longest-prefix-match", "administrative-distance", "route-metric", "next-hop-outgoing-interface", "interactive-hop-by-hop-forwarding", "ipv4-ipv6-routing", "no-route-packet-disposal"]);
    expect(lesson.match(/<LearningObjective>/g)).toHaveLength(1);
    expect(lesson).toContain("<RoutingTableDecisionPlayer");
    expect(lesson).toContain("<HopByHopForwardingPlayer");
    expect(lesson.match(/<SectionContinue\b/g)).toHaveLength(10);
    for (const phrase of ["address family", "prefix match", "longest prefix", "administrative distance", "comparable metric", "destination IP address does not change", "TTL", "Hop Limit", "no usable route", "may generate ICMP"])
      expect(lesson.toLowerCase()).toContain(phrase.toLowerCase());
  });

  it("protects evidence, practice, troubleshooting, checks, and advanced depth", () => {
    const lesson = read("routing-tables-and-default-routes.account.mdx");
    for (const id of ["inspect-routing-evidence", "guided-routing-practice", "troubleshoot-routing", "knowledge-check-summary", "pro-deep-dive"])
      expect(lesson).toContain(`id="${id}"`);
    for (const phrase of ["ROUTING_TABLES_ACCOUNT_SENTINEL", "route print", "Get-NetRoute", "ip route", "ip -6 route", "show ip route", "Wireshark", "ICMP", "ICMPv6"])
      expect(lesson).toContain(phrase);
    expect(lesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(lesson).toContain("<PremiumPreview");
    expect(lesson).toContain("recursive lookup");
    expect(lesson).toContain("protocol best-path");
  });
});
