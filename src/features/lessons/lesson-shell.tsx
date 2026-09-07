import Link from "next/link";
import type { ReactNode } from "react";

import type { LessonSummary, Pathway } from "@/features/catalog/catalog.types";

import { CurriculumNavigation } from "./curriculum-navigation";
import { LearningObjective } from "./learning-objective";
import { LessonSectionNavigation } from "./lesson-section-navigation";
import { RegistrationBoundary } from "./registration-boundary";

type LessonShellProps = {
  pathway: Pathway;
  lesson: LessonSummary;
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
  pathway,
  lesson,
  previous,
  next,
  children,
}: LessonShellProps) {
  return (
    <main className="lesson-page" id="main-content">
      <aside aria-label="Course contents" className="lesson-curriculum lesson-curriculum--desktop">
        <CurriculumNavigation pathway={pathway} currentLessonSlug={lesson.slug} />
      </aside>
      <article className="lesson-shell">
        <details className="lesson-curriculum lesson-curriculum--mobile">
          <summary>Course contents</summary>
          <CurriculumNavigation pathway={pathway} currentLessonSlug={lesson.slug} />
        </details>
        <header className="lesson-header">
          <p className="eyebrow">Lesson</p>
          <h1>{lesson.title}</h1>
          <p className="lesson-byline">
            {lesson.estimatedMinutes} minutes · Public introduction · Free account to continue
          </p>
        </header>

        <LearningObjective>{lesson.objective}</LearningObjective>

        <LessonSectionNavigation sections={lesson.sections} />

        <div className="lesson-content">{children}</div>

        <RegistrationBoundary returnTo={`/learn/${pathway.slug}/${lesson.slug}`} />

        <nav aria-label="Lesson navigation" className="lesson-navigation">
          <LessonDirection
            direction="Previous"
            lesson={previous}
            pathwaySlug={pathway.slug}
          />
          <LessonDirection direction="Next" lesson={next} pathwaySlug={pathway.slug} />
        </nav>
      </article>
    </main>
  );
}
