import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PathwayOverview } from "@/features/catalog/pathway-overview";
import {
  getPathway,
  listPathways,
} from "@/features/catalog/catalog.repository";

type PathwayPageProps = { params: Promise<{ pathwaySlug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return listPathways().map(({ slug }) => ({ pathwaySlug: slug }));
}

function findPathway(pathwaySlug: string) {
  try {
    return getPathway(pathwaySlug);
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: PathwayPageProps): Promise<Metadata> {
  const pathway = findPathway((await params).pathwaySlug);
  return { title: pathway.title, description: pathway.description };
}

export default async function PathwayPage({ params }: PathwayPageProps) {
  const pathway = findPathway((await params).pathwaySlug);
  return <PathwayOverview pathway={pathway} />;
}
