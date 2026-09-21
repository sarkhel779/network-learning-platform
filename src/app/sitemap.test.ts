import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ loadContentOverridesSnapshot: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/features/catalog/content-publication.repository", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/catalog/content-publication.repository")>()),
  loadContentOverridesSnapshot: mocks.loadContentOverridesSnapshot,
}));

import { listPathways } from "@/features/catalog/catalog.repository";

import sitemap from "./sitemap";

beforeEach(() => {
  mocks.loadContentOverridesSnapshot.mockReset();
  mocks.loadContentOverridesSnapshot.mockResolvedValue({ publications: {}, orders: {} });
});

describe("public sitemap", () => {
  it("lists exactly approved index pages and all published lessons, without fabricated dates", async () => {
    const entries = await sitemap();
    expect(entries).toEqual([
      { url: "https://packetsecrets.com" },
      { url: "https://packetsecrets.com/courses" },
      { url: "https://packetsecrets.com/paths/networking-foundations" },
      { url: "https://packetsecrets.com/paths/routing-protocols" },
      { url: "https://packetsecrets.com/learn/networking-foundations/how-networks-communicate" },
      { url: "https://packetsecrets.com/learn/networking-foundations/hosts-and-network-devices" },
      { url: "https://packetsecrets.com/learn/networking-foundations/hubs" },
      { url: "https://packetsecrets.com/learn/networking-foundations/bridges" },
      { url: "https://packetsecrets.com/learn/networking-foundations/switches" },
      { url: "https://packetsecrets.com/learn/networking-foundations/routers-default-gateways-and-network-boundaries" },
      { url: "https://packetsecrets.com/learn/networking-foundations/physical-and-logical-addressing" },
      { url: "https://packetsecrets.com/learn/networking-foundations/osi-and-tcp-ip-models" },
      { url: "https://packetsecrets.com/learn/networking-foundations/computer-network-basics-final-quiz" },
      { url: "https://packetsecrets.com/learn/networking-foundations/cables-fibre-wireless-and-network-connections" },
      { url: "https://packetsecrets.com/learn/networking-foundations/unicast-broadcast-and-multicast-communication" },
      { url: "https://packetsecrets.com/learn/networking-foundations/ethernet-frames-and-mac-addresses" },
      { url: "https://packetsecrets.com/learn/networking-foundations/how-switches-learn-and-forward" },
      { url: "https://packetsecrets.com/learn/networking-foundations/arp-and-local-delivery" },
      { url: "https://packetsecrets.com/learn/networking-foundations/vlans-access-ports-and-trunks" },
      { url: "https://packetsecrets.com/learn/networking-foundations/ipv4-addressing" },
      { url: "https://packetsecrets.com/learn/networking-foundations/subnetting-fundamentals" },
      { url: "https://packetsecrets.com/learn/networking-foundations/ipv6-fundamentals" },
      { url: "https://packetsecrets.com/learn/networking-foundations/routing-tables-and-default-routes" },
      { url: "https://packetsecrets.com/learn/networking-foundations/icmp-ping-and-path-discovery" },
      { url: "https://packetsecrets.com/learn/networking-foundations/tcp-reliable-transport" },
      { url: "https://packetsecrets.com/learn/networking-foundations/udp-datagrams-and-ports" },
      { url: "https://packetsecrets.com/learn/networking-foundations/dhcp-and-automatic-address-configuration" },
      { url: "https://packetsecrets.com/learn/networking-foundations/dns-and-name-resolution" },
      { url: "https://packetsecrets.com/learn/networking-foundations/http-https-tls-and-essential-network-services" },
      { url: "https://packetsecrets.com/learn/networking-foundations/access-points-modems-onts-and-firewalls" },
      { url: "https://packetsecrets.com/learn/networking-foundations/nat-pat-and-the-complete-internet-packet-journey" },
      { url: "https://packetsecrets.com/learn/networking-foundations/first-packet-journey-through-a-small-network" },
      { url: "https://packetsecrets.com/learn/networking-foundations/systematic-network-troubleshooting-capstone" },
      { url: "https://packetsecrets.com/learn/routing-protocols/routing-fundamentals" },
      { url: "https://packetsecrets.com/learn/routing-protocols/rip" },
      { url: "https://packetsecrets.com/learn/routing-protocols/ospf" },
      { url: "https://packetsecrets.com/learn/routing-protocols/eigrp" },
      { url: "https://packetsecrets.com/learn/routing-protocols/bgp" },
    ]);
    const urls = entries.map(({ url }) => url);
    for (const pathway of listPathways()) {
      for (const lesson of pathway.modules.flatMap(({ lessons }) => lessons)) {
        expect(urls.includes(`https://packetsecrets.com/learn/${pathway.slug}/${lesson.slug}`)).toBe(lesson.published);
      }
    }
    expect(urls.some((url) => url.includes("sign-in"))).toBe(false);
    expect(urls).not.toContain("https://packetsecrets.com/learn/networking-foundations/hubs-bridges-and-switches");

    const unpublishedSlugs = listPathways()
      .flatMap(({ slug: pathwaySlug, modules }) =>
        modules.flatMap(({ lessons }) => lessons
          .filter(({ published }) => !published)
          .map(({ slug }) => `https://packetsecrets.com/learn/${pathwaySlug}/${slug}`)),
      );

    for (const unpublishedUrl of unpublishedSlugs) {
      expect(urls).not.toContain(unpublishedUrl);
    }
    expect(unpublishedSlugs).toHaveLength(0);
  });

  it("removes a lesson unpublished by a live database override", async () => {
    mocks.loadContentOverridesSnapshot.mockResolvedValue({
      publications: { lesson_how_networks_communicate: false },
      orders: {},
    });
    const urls = (await sitemap()).map(({ url }) => url);
    expect(urls).not.toContain("https://packetsecrets.com/learn/networking-foundations/how-networks-communicate");
  });
});
