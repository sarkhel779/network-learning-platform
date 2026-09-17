import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  applyContentOverrides,
  loadContentOverridesSnapshot,
} from "@/features/catalog/content-publication.repository";
import { PathwayOverview } from "@/features/catalog/pathway-overview";
import {
  getPathway,
  listPathways,
} from "@/features/catalog/catalog.repository";

type PathwayPageProps = { params: Promise<{ pathwaySlug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return listPathways().map(({ slug }) => ({ pathwaySlug: slug }));
}

async function findPathway(pathwaySlug: string) {
  try {
    const pathway = getPathway(pathwaySlug);
    const overrides = await loadContentOverridesSnapshot();
    return applyContentOverrides(pathway, overrides);
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: PathwayPageProps): Promise<Metadata> {
  const pathway = await findPathway((await params).pathwaySlug);
  return { title: pathway.title, description: pathway.description };
}

export default async function PathwayPage({ params }: PathwayPageProps) {
  const pathway = await findPathway((await params).pathwaySlug);
  return <PathwayOverview pathway={pathway} />;
}
