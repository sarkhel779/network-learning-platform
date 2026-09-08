import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src/content/networking-foundations");
const publicLesson = readFileSync(join(root, "arp-and-local-delivery.public.mdx"), "utf8");
const accountLesson = readFileSync(join(root, "arp-and-local-delivery.account.mdx"), "utf8");

describe("ARP and Local Delivery content", () => {
  it("builds the public explanation from next-hop choice through ARP and local delivery", () => {
    const headings = [...publicLesson.matchAll(/<h2 id="([^"]+)">/g)].map((match) => match[1]);
    expect(headings).toEqual([
      "why-arp-exists",
      "choose-the-next-hop-first",
      "request-reply-and-cache",
      "interactive-arp-journey",
      "arp-variants-and-boundaries",
    ]);
    expect(publicLesson).toContain("<ArpLocalDeliveryPlayer />");
    expect(publicLesson).toContain("<ArpVariantPlayer />");
    expect(publicLesson).toContain("RARP");
    expect(publicLesson).toContain("Inverse ARP");
    expect(publicLesson).not.toContain("ARP_ACCOUNT_SENTINEL");
  });

  it("gives every ARP variant a scenario, packet behavior, and safe boundary", () => {
    const variantSubsections = [...publicLesson.matchAll(/<h3 id="([^"]+)">/g)].map((match) => match[1]);
    expect(variantSubsections).toEqual([
      "standard-arp",
      "proxy-arp",
      "gratuitous-arp",
      "reverse-arp",
      "inverse-arp",
      "compare-arp-variants",
    ]);

    expect(publicLesson).toContain("Scenario: Host A wants to send to Host B");
    expect(publicLesson).toContain("Scenario: a host treats a destination as local");
    expect(publicLesson).toContain("Scenario: an active gateway takes over");
    expect(publicLesson).toContain("RARP does not perform ordinary next-hop resolution");
    expect(publicLesson).toContain("Inverse ARP starts with a known virtual circuit");
    expect(publicLesson).toContain("Do not confuse Proxy ARP with forwarding an ARP broadcast through a router");
    expect(publicLesson).toContain("The full Frame Relay packet journey belongs in the later WAN lesson");
  });

  it("keeps command evidence, troubleshooting, checks, interviews, and Pro depth protected", () => {
    expect(accountLesson).toContain("ARP_ACCOUNT_SENTINEL");
    expect(accountLesson).toContain("arp -a");
    expect(accountLesson).toContain("Get-NetNeighbor");
    expect(accountLesson).toContain("ip neigh");
    expect(accountLesson).toContain("Join the Pro Member Waitlist");
    expect(accountLesson.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
    expect(accountLesson.match(/<InterviewScenario\b/g)).toHaveLength(2);
  });
});
