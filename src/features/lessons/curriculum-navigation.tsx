import Link from "next/link";

import type { Pathway } from "@/features/catalog/catalog.types";

type CurriculumNavigationProps = {
  pathway: Pathway;
  currentLessonSlug: string;
};

export function CurriculumNavigation({
  pathway,
  currentLessonSlug,
}: CurriculumNavigationProps) {
  return (
    <nav aria-label="Course curriculum" className="curriculum-navigation">
      <ol className="curriculum-navigation__modules">
        {pathway.modules.map((module) => (
          <li className="curriculum-navigation__module" key={module.id}>
            <h2>{module.title}</h2>
            <ol className="curriculum-navigation__lessons">
              {module.lessons.map((lesson) => {
                const isCurrent = lesson.slug === currentLessonSlug;
                const lessonMeta = (
                  <>
                    <span>{lesson.title}</span>
                    {lesson.published ? <span>Free</span> : null}
                    {!lesson.published ? <span>Coming later</span> : null}
                    {isCurrent ? <span>Current lesson</span> : null}
                  </>
                );

                return (
                  <li className="curriculum-navigation__lesson" key={lesson.id}>
                    {lesson.published ? (
                      <Link
                        aria-current={isCurrent ? "page" : undefined}
                        href={`/learn/${pathway.slug}/${lesson.slug}`}
                      >
                        {lessonMeta}
                      </Link>
                    ) : (
                      <div>{lessonMeta}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </nav>
  );
}
