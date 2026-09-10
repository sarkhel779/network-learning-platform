import { describe, expect, it } from "vitest";

import { listPathways } from "@/features/catalog/catalog.repository";

import sitemap from "./sitemap";

describe("public sitemap", () => {
  it("lists exactly approved index pages and all published lessons, without fabricated dates", () => {
    const entries = sitemap();
    expect(entries).toEqual([
      { url: "https://packetsecrets.com" },
      { url: "https://packetsecrets.com/paths/networking-foundations" },
      { url: "https://packetsecrets.com/learn/networking-foundations/how-networks-communicate" },
      { url: "https://packetsecrets.com/learn/networking-foundations/hosts-and-network-devices" },
      { url: "https://packetsecrets.com/learn/networking-foundations/cables-fibre-wireless-and-network-connections" },
      { url: "https://packetsecrets.com/learn/networking-foundations/hubs-bridges-and-switches" },
      { url: "https://packetsecrets.com/learn/networking-foundations/unicast-broadcast-and-multicast-communication" },
      { url: "https://packetsecrets.com/learn/networking-foundations/routers-default-gateways-and-network-boundaries" },
      { url: "https://packetsecrets.com/learn/networking-foundations/access-points-modems-onts-and-firewalls" },
      { url: "https://packetsecrets.com/learn/networking-foundations/osi-and-tcp-ip-models" },
      { url: "https://packetsecrets.com/learn/networking-foundations/first-packet-journey-through-a-small-network" },
      { url: "https://packetsecrets.com/learn/networking-foundations/ethernet-frames-and-mac-addresses" },
      { url: "https://packetsecrets.com/learn/networking-foundations/how-switches-learn-and-forward" },
      { url: "https://packetsecrets.com/learn/networking-foundations/arp-and-local-delivery" },
      { url: "https://packetsecrets.com/learn/networking-foundations/vlans-access-ports-and-trunks" },
      { url: "https://packetsecrets.com/learn/networking-foundations/ipv4-addressing" },
      { url: "https://packetsecrets.com/learn/networking-foundations/subnetting-fundamentals" },
      { url: "https://packetsecrets.com/learn/networking-foundations/ipv6-fundamentals" },
      { url: "https://packetsecrets.com/learn/networking-foundations/routing-tables-and-default-routes" },
      { url: "https://packetsecrets.com/learn/networking-foundations/icmp-ping-and-path-discovery" },
      { url: "https://packetsecrets.com/learn/networking-foundations/tcp-udp-and-ports" },
      { url: "https://packetsecrets.com/learn/networking-foundations/dhcp-and-automatic-address-configuration" },
      { url: "https://packetsecrets.com/learn/networking-foundations/dns-and-name-resolution" },
      { url: "https://packetsecrets.com/learn/networking-foundations/http-https-tls-and-essential-network-services" },
    ]);
    const urls = entries.map(({ url }) => url);
    for (const pathway of listPathways()) {
      for (const lesson of pathway.modules.flatMap(({ lessons }) => lessons)) {
        expect(urls.includes(`https://packetsecrets.com/learn/${pathway.slug}/${lesson.slug}`)).toBe(lesson.published);
      }
    }
    expect(urls.some((url) => url.includes("sign-in"))).toBe(false);

    const unpublishedSlugs = listPathways()
      .flatMap(({ slug: pathwaySlug, modules }) =>
        modules.flatMap(({ lessons }) => lessons
          .filter(({ published }) => !published)
          .map(({ slug }) => `https://packetsecrets.com/learn/${pathwaySlug}/${slug}`)),
      );

    for (const unpublishedUrl of unpublishedSlugs) {
      expect(urls).not.toContain(unpublishedUrl);
    }
    expect(unpublishedSlugs).toHaveLength(2);
  });
});
