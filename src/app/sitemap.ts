import type { MetadataRoute } from "next";

import { listPathways, listPublishedLessons } from "@/features/catalog/catalog.repository";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://packetsecrets.com" },
    { url: "https://packetsecrets.com/paths/networking-foundations" },
    ...listPathways().flatMap((pathway) =>
      listPublishedLessons(pathway.slug).map((lesson) => ({
        url: `https://packetsecrets.com/learn/${pathway.slug}/${lesson.slug}`,
      })),
    ),
  ];
}
