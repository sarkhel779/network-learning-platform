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
  const otherScenarios = topic.scenarios.filter((candidate) => candidate.slug !== scenario.slug);

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
      <footer className="labs-scenario__outro">
        <Link href={`/labs/${topic.slug}`} className="labs-scenario__back-link">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M13 8H3M3 8L7 4M3 8L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to {topic.title} scenarios
        </Link>
        {otherScenarios.length > 0 ? (
          <section aria-labelledby="labs-scenario-more-heading" className="labs-scenario__more">
            <h2 id="labs-scenario-more-heading">More in {topic.title}</h2>
            <div className="labs-page__cards">
              {otherScenarios.map((other) => (
                <Link key={other.slug} href={`/labs/${topic.slug}/${other.slug}`}>
                  <strong>{other.title}</strong>
                  <span>{other.summary}</span>
                  <small>{other.difficulty} · ~{other.estimatedMinutes} min</small>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </footer>
    </main>
  );
}
