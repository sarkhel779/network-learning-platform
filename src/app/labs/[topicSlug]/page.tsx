import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LabScenariosIndex } from "@/features/labs/scenarios-index";
import { getLabTopic, listLabTopics } from "@/features/labs/labs.repository";

type TopicPageProps = { params: Promise<{ topicSlug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return listLabTopics().map(({ slug }) => ({ topicSlug: slug }));
}

function findTopic(topicSlug: string) {
  try {
    return getLabTopic(topicSlug);
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const topic = findTopic((await params).topicSlug);
  return { title: `${topic.title} · Labs`, description: topic.description };
}

export default async function LabTopicPage({ params }: TopicPageProps) {
  const topic = findTopic((await params).topicSlug);
  return <LabScenariosIndex topic={topic} />;
}
