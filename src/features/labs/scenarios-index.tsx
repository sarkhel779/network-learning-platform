import Link from "next/link";

import type { LabTopic } from "./labs.types";

function ScenarioOrdinal({ position }: { position: number }) {
  return (
    <svg className="course-card__icon" viewBox="0 0 24 24" aria-hidden="true">
      <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor" stroke="none">{position}</text>
    </svg>
  );
}

export function LabScenariosIndex({ topic }: { topic: LabTopic }) {
  return (
    <main id="main-content">
      <section aria-labelledby="topic-title" className="courses-hero">
        <p className="eyebrow"><Link href="/labs">Labs</Link> · {topic.scenarios.length} scenario{topic.scenarios.length === 1 ? "" : "s"}</p>
        <h1 id="topic-title">{topic.title}</h1>
        <p className="summary">{topic.description}</p>
      </section>
      <section aria-labelledby="topic-title" className="courses-grid">
        {topic.scenarios.map((scenario, index) => (
          <Link className="course-card" href={`/labs/${topic.slug}/${scenario.slug}`} key={scenario.slug}>
            <div className="course-card__header">
              <ScenarioOrdinal position={index + 1} />
              <span className="course-card__level">{scenario.difficulty}</span>
            </div>
            <h2>{scenario.title}</h2>
            <p className="course-card__description">{scenario.summary}</p>
            <div className="course-card__footer">
              <span className="course-card__meta">~{scenario.estimatedMinutes} min</span>
              <span className="course-card__cta">
                Start scenario
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
