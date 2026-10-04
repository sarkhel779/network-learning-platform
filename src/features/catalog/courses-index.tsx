import Link from "next/link";

import { PathwayIcon } from "./pathway-icon";
import type { Pathway } from "./catalog.types";

type CoursesIndexProps = { pathways: Pathway[] };

function levelFor(pathway: Pathway): "Beginner" | "Intermediate" {
  return pathway.audience.toLowerCase().includes("beginner") ? "Beginner" : "Intermediate";
}

export function CoursesIndex({ pathways }: CoursesIndexProps) {
  const allLessons = pathways.flatMap((pathway) => pathway.modules.flatMap((module) => module.lessons));
  const publishedLessons = allLessons.filter((lesson) => lesson.published);
  const totalMinutes = publishedLessons.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0);
  const totalHours = Math.max(1, Math.round(totalMinutes / 60));

  return (
    <main id="main-content">
      <section aria-labelledby="courses-title" className="courses-hero">
        <p className="eyebrow">All courses</p>
        <h1 id="courses-title">Courses</h1>
        <p className="summary">Pick a learning path and start building real networking skills.</p>
        <dl className="courses-stats">
          <div>
            <dt>Learning paths</dt>
            <dd>{pathways.length}</dd>
          </div>
          <div>
            <dt>Lessons available</dt>
            <dd>{publishedLessons.length}</dd>
          </div>
          <div>
            <dt>Hours of content</dt>
            <dd>~{totalHours}</dd>
          </div>
        </dl>
      </section>
      <section aria-labelledby="courses-title" className="courses-grid">
        {pathways.map((pathway) => {
          const lessons = pathway.modules.flatMap((module) => module.lessons);
          const published = lessons.filter((lesson) => lesson.published);
          const pathwayMinutes = published.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0);
          const pathwayHours = Math.round((pathwayMinutes / 60) * 10) / 10;
          return (
            <Link className="course-card" href={`/paths/${pathway.slug}`} key={pathway.id}>
              <div className="course-card__header">
                <PathwayIcon slug={pathway.slug} />
                <span className="course-card__level">{levelFor(pathway)}</span>
              </div>
              <h2>{pathway.title}</h2>
              <p className="course-card__audience">{pathway.audience}</p>
              <p className="course-card__description">{pathway.description}</p>
              <div className="course-card__footer">
                <div className="course-card__meta">
                  <span>{published.length} {published.length === 1 ? "lesson" : "lessons"}</span>
                  {pathwayHours > 0 ? <span>~{pathwayHours} hr</span> : null}
                </div>
                <span className="course-card__cta">
                  Start learning
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
