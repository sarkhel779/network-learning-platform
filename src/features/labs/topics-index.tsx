import Link from "next/link";

import { TopicIcon } from "./topic-icon";
import type { LabTopic } from "./labs.types";

export function LabsTopicsIndex({ topics }: { topics: LabTopic[] }) {
  const totalScenarios = topics.reduce((sum, topic) => sum + topic.scenarios.length, 0);

  return (
    <main id="main-content">
      <section aria-labelledby="labs-title" className="courses-hero">
        <p className="eyebrow">Independent practice</p>
        <h1 id="labs-title">Labs</h1>
        <p className="summary">Hands-on scenarios you can run on their own — no course required. Pick a topic, then work through its scenarios one at a time.</p>
        <dl className="courses-stats">
          <div>
            <dt>Topics</dt>
            <dd>{topics.length}</dd>
          </div>
          <div>
            <dt>Scenarios</dt>
            <dd>{totalScenarios}</dd>
          </div>
        </dl>
      </section>
      <section aria-labelledby="labs-title" className="courses-grid">
        {topics.map((topic) => (
          <Link className="course-card" href={`/labs/${topic.slug}`} key={topic.slug}>
            <div className="course-card__header">
              <TopicIcon slug={topic.slug} />
              <span className="course-card__level">{topic.scenarios.length} scenario{topic.scenarios.length === 1 ? "" : "s"}</span>
            </div>
            <h2>{topic.title}</h2>
            <p className="course-card__description">{topic.description}</p>
            <div className="course-card__footer">
              <span className="course-card__meta">Independent · no course needed</span>
              <span className="course-card__cta">
                Open topic
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
