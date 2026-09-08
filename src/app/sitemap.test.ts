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
      { url: "https://packetsecrets.com/learn/networking-foundations/osi-and-tcp-ip-models" },
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
    expect(unpublishedSlugs).toHaveLength(18);
  });
});
