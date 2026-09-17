import type { MetadataRoute } from "next";

import {
  applyContentOverrides,
  loadContentOverridesSnapshot,
} from "@/features/catalog/content-publication.repository";
import { listPathways } from "@/features/catalog/catalog.repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const overrides = await loadContentOverridesSnapshot();

  return [
    { url: "https://packetsecrets.com" },
    { url: "https://packetsecrets.com/paths/networking-foundations" },
    ...listPathways().flatMap((pathway) =>
      applyContentOverrides(pathway, overrides)
        .modules.flatMap(({ lessons }) => lessons)
        .filter((lesson) => lesson.published)
        .map((lesson) => ({
          url: `https://packetsecrets.com/learn/${pathway.slug}/${lesson.slug}`,
        })),
    ),
  ];
}
