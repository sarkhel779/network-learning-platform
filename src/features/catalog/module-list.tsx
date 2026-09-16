import Link from "next/link";

import type { Module } from "./catalog.types";
import { formatEstimatedTime } from "./estimated-time";

type ModuleListProps = {
  modules: Module[];
  pathwaySlug: string;
};

export function ModuleList({ modules, pathwaySlug }: ModuleListProps) {
  return (
    <div className="module-list">
      {modules.map((module, index) => (
        <section aria-labelledby={`${module.id}-title`} className="module" id={module.id} key={module.id}>
          <div className="module__head">
            <span aria-hidden="true" className="module__index">{index + 1}</span>
            <div className="module__heading">
              <h2 id={`${module.id}-title`}>{module.title}</h2>
              <p>{module.description}</p>
            </div>
            <span className="module__count">{module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}</span>
          </div>
          <ol className="lesson-list">
            {module.lessons.map((lesson) => (
              <li className="lesson-card" key={lesson.id}>
                <div className="lesson-card__main">
                  <h3>
                    {lesson.published ? (
                      <Link href={`/learn/${pathwaySlug}/${lesson.slug}`}>{lesson.title}</Link>
                    ) : lesson.title}
                  </h3>
                  <p>{lesson.objective}</p>
                </div>
                <div className="lesson-meta">
                  <span>{formatEstimatedTime(lesson.estimatedMinutes)}</span>
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
