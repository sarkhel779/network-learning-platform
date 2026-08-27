import Link from "next/link";
import type { ReactNode } from "react";

import type { LessonSummary } from "@/features/catalog/catalog.types";

import { LearningObjective } from "./learning-objective";

type LessonShellProps = {
  lesson: LessonSummary;
  pathwaySlug: string;
  previous?: LessonSummary;
  next?: LessonSummary;
  children: ReactNode;
};

type LessonDirectionProps = {
  direction: "Previous" | "Next";
  lesson?: LessonSummary;
  pathwaySlug: string;
};

function LessonDirection({ direction, lesson, pathwaySlug }: LessonDirectionProps) {
  if (!lesson) {
    return <span>{direction}: {direction === "Previous" ? "Start of pathway" : "End of pathway"}</span>;
  }

  const label = `${direction}: ${lesson.title}`;

  if (!lesson.published) {
    return <span>{label} — Coming later</span>;
  }

  return <Link href={`/learn/${pathwaySlug}/${lesson.slug}`}>{label}</Link>;
}

export function LessonShell({
  lesson,
  pathwaySlug,
  previous,
  next,
  children,
}: LessonShellProps) {
  const accessLabel = lesson.access === "premium" ? "Premium" : "Free";

  return (
    <main className="lesson-page" id="main-content">
      <article className="lesson-shell">
        <header className="lesson-header">
          <p className="eyebrow">Lesson</p>
          <h1>{lesson.title}</h1>
          <p className="lesson-byline">
            {lesson.estimatedMinutes} minutes · {accessLabel}
          </p>
        </header>

        <LearningObjective>{lesson.objective}</LearningObjective>

        <div className="lesson-content">{children}</div>

        <nav aria-label="Lesson navigation" className="lesson-navigation">
          <LessonDirection
            direction="Previous"
            lesson={previous}
            pathwaySlug={pathwaySlug}
          />
          <LessonDirection direction="Next" lesson={next} pathwaySlug={pathwaySlug} />
        </nav>
      </article>
    </main>
  );
}
