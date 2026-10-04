import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getScenarioComponent } from "@/features/labs/scenario-registry";
import { getLabScenario, getLabTopic, listLabTopics } from "@/features/labs/labs.repository";

type ScenarioPageProps = { params: Promise<{ topicSlug: string; scenarioSlug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return listLabTopics().flatMap((topic) => topic.scenarios.map((scenario) => ({ topicSlug: topic.slug, scenarioSlug: scenario.slug })));
}

function findScenario(topicSlug: string, scenarioSlug: string) {
  try {
    const topic = getLabTopic(topicSlug);
    const scenario = getLabScenario(topicSlug, scenarioSlug);
    return { topic, scenario };
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: ScenarioPageProps): Promise<Metadata> {
  const { topicSlug, scenarioSlug } = await params;
  const { scenario } = findScenario(topicSlug, scenarioSlug);
  return { title: `${scenario.title} · Labs`, description: scenario.summary };
}

export default async function LabScenarioPage({ params }: ScenarioPageProps) {
  const { topicSlug, scenarioSlug } = await params;
  const { topic, scenario } = findScenario(topicSlug, scenarioSlug);
  const ScenarioComponent = getScenarioComponent(topicSlug, scenarioSlug);
  if (!ScenarioComponent) notFound();

  return (
    <main id="main-content" className="labs-page">
      <nav aria-label="Breadcrumb" className="labs-scenario__breadcrumb">
        <Link href="/labs">Labs</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/labs/${topic.slug}`}>{topic.title}</Link>
      </nav>
      <header className="labs-page__intro">
        <p className="home-eyebrow">{topic.title} · {scenario.difficulty} · ~{scenario.estimatedMinutes} min</p>
        <h1>{scenario.title}</h1>
        <p>{scenario.summary}</p>
      </header>
      <ScenarioComponent />
    </main>
  );
}
