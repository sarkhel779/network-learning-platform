import Link from "next/link";

import type { Module, Pathway } from "@/features/catalog/catalog.types";
import type { LessonProgressStatus } from "@/features/progress/progress.types";

type CurriculumNavigationProps = {
  pathway: Pathway;
  currentLessonSlug: string;
  onLessonSelect?: () => void;
  progressByLessonId?: Readonly<Record<string, LessonProgressStatus>>;
};

function ChevronIcon() {
  return (
    <svg aria-hidden="true" className="curriculum-navigation__chevron" width="14" height="14" viewBox="0 0 20 20">
      <path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LessonStatusIcon({ state }: { state: "current" | "completed" | "locked" | "upcoming" }) {
  if (state === "locked") {
    return (
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 20 20">
        <rect x="5" y="9" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 9V6.5a3 3 0 0 1 6 0V9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (state === "completed") {
    return (
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.16" />
        <path d="m6 10 3 3 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (state === "current") {
    return (
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="10" cy="10" r="3" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ModuleSection({
  module,
  moduleIndex,
  pathwaySlug,
  currentLessonSlug,
  onLessonSelect,
  progressByLessonId,
}: {
  module: Module;
  moduleIndex: number;
  pathwaySlug: string;
  currentLessonSlug: string;
  onLessonSelect?: () => void;
  progressByLessonId?: Readonly<Record<string, LessonProgressStatus>>;
}) {
  const containsCurrent = module.lessons.some((lesson) => lesson.slug === currentLessonSlug);
  const publishedLessons = module.lessons.filter((lesson) => lesson.published);
  const completedCount = progressByLessonId
    ? publishedLessons.filter((lesson) => progressByLessonId[lesson.id] === "completed").length
    : null;

  return (
    <li className="curriculum-navigation__module">
      <details className="curriculum-navigation__module-details" open={containsCurrent}>
        <summary className="curriculum-navigation__module-summary">
          <span className="curriculum-navigation__module-index" aria-hidden="true">{moduleIndex + 1}</span>
          <span className="curriculum-navigation__module-title">
            <h2>{module.title}</h2>
            <small>{module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}</small>
          </span>
          {completedCount !== null ? (
            <span className="curriculum-navigation__module-chip">{completedCount}/{publishedLessons.length}</span>
          ) : null}
          <ChevronIcon />
        </summary>
        <ol className="curriculum-navigation__lessons">
          {module.lessons.map((lesson) => {
            const isCurrent = lesson.slug === currentLessonSlug;
            const status = progressByLessonId?.[lesson.id];
            const iconState = !lesson.published ? "locked" : isCurrent ? "current" : status === "completed" ? "completed" : "upcoming";

            const lessonMeta = (
              <span className="curriculum-navigation__lesson-body">
                <span className="curriculum-navigation__lesson-title">{lesson.title}</span>
                {lesson.published ? (
                  <span className="curriculum-navigation__lesson-tag">
                    {status === "completed" ? "Completed" : status === "in_progress" ? "In progress" : "Free"}
                  </span>
                ) : null}
                {!lesson.published ? <span className="curriculum-navigation__lesson-tag">Coming later</span> : null}
                {isCurrent ? <span className="curriculum-navigation__lesson-tag">Current lesson</span> : null}
              </span>
            );

            return (
              <li className="curriculum-navigation__lesson" data-lesson-state={iconState} key={lesson.id}>
                {lesson.published ? (
                  <Link
                    aria-current={isCurrent ? "page" : undefined}
                    href={`/learn/${pathwaySlug}/${lesson.slug}`}
                    onClick={onLessonSelect}
                  >
                    <span className="curriculum-navigation__lesson-status" aria-hidden="true"><LessonStatusIcon state={iconState} /></span>
                    {lessonMeta}
                  </Link>
                ) : (
                  <div>
                    <span className="curriculum-navigation__lesson-status" aria-hidden="true"><LessonStatusIcon state={iconState} /></span>
                    {lessonMeta}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </details>
    </li>
  );
}

export function CurriculumNavigation({
  pathway,
  currentLessonSlug,
  onLessonSelect,
  progressByLessonId,
}: CurriculumNavigationProps) {
  return (
    <nav aria-label="Course curriculum" className="curriculum-navigation">
      <ol className="curriculum-navigation__modules">
        {pathway.modules.map((module, index) => (
          <ModuleSection
            key={module.id}
            module={module}
            moduleIndex={index}
            pathwaySlug={pathway.slug}
            currentLessonSlug={currentLessonSlug}
            onLessonSelect={onLessonSelect}
            progressByLessonId={progressByLessonId}
          />
        ))}
      </ol>
    </nav>
  );
}
