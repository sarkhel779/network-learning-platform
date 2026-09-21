import Link from "next/link";

import type { Pathway } from "./catalog.types";

type CoursesIndexProps = { pathways: Pathway[] };

export function CoursesIndex({ pathways }: CoursesIndexProps) {
  return (
    <main id="main-content">
      <section aria-labelledby="courses-title" className="courses-hero">
        <p className="eyebrow">All courses</p>
        <h1 id="courses-title">Courses</h1>
        <p className="summary">Pick a learning path and start building real networking skills.</p>
      </section>
      <section aria-labelledby="courses-title" className="courses-grid">
        {pathways.map((pathway) => {
          const lessons = pathway.modules.flatMap((module) => module.lessons);
          const publishedCount = lessons.filter((lesson) => lesson.published).length;
          return (
            <Link className="course-card" href={`/paths/${pathway.slug}`} key={pathway.id}>
              <h2>{pathway.title}</h2>
              <p className="course-card__audience">{pathway.audience}</p>
              <p>{pathway.description}</p>
              <span className="course-card__scale">
                {publishedCount} {publishedCount === 1 ? "lesson" : "lessons"} available
              </span>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
