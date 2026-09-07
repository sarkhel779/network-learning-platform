import Link from "next/link";

import type { Module } from "./catalog.types";

type ModuleListProps = {
  modules: Module[];
  pathwaySlug: string;
};

export function ModuleList({ modules, pathwaySlug }: ModuleListProps) {
  return (
    <div className="module-list">
      {modules.map((module) => (
        <section aria-labelledby={`${module.id}-title`} className="module" key={module.id}>
          <h2 id={`${module.id}-title`}>{module.title}</h2>
          <p>{module.description}</p>
          <ol className="lesson-list">
            {module.lessons.map((lesson) => (
              <li className="lesson-card" key={lesson.id}>
                <div>
                  <h3>
                    {lesson.published ? (
                      <Link href={`/learn/${pathwaySlug}/${lesson.slug}`}>{lesson.title}</Link>
                    ) : lesson.title}
                  </h3>
                  <p>{lesson.objective}</p>
                </div>
                <div className="lesson-meta">
                  <span>{lesson.estimatedMinutes} min</span>
                  {lesson.published ? <span className="access-label">Free</span> : <span>Coming later</span>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
