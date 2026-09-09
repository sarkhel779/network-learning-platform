import Link from "next/link";
import type { ReactNode } from "react";

import type { LessonSummary, Pathway } from "@/features/catalog/catalog.types";
import { LearnerWorkspace } from "@/features/learner-workspace/learner-workspace";
import type { Viewer } from "@/features/learner-workspace/learner-workspace.types";
import type { LessonProgressManifest, LessonProgressSummary } from "@/features/progress/progress.types";
import { LessonProgressProvider } from "@/features/progress/lesson-progress-context";
import { LessonProgressControls } from "@/features/progress/lesson-progress-controls";

import { CurriculumNavigation } from "./curriculum-navigation";
import { LearningObjective } from "./learning-objective";
import { LessonSectionNavigation } from "./lesson-section-navigation";
import { RegistrationBoundary } from "./registration-boundary";

type LessonShellProps = {
  pathway: Pathway;
  lesson: LessonSummary;
  previous?: LessonSummary;
  next?: LessonSummary;
  viewer: Viewer | null;
  progressManifest?: LessonProgressManifest;
  initialProgress?: LessonProgressSummary | null;
  progressUnavailable?: boolean;
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
  viewer,
  progressManifest,
  initialProgress,
  progressUnavailable = false,
  children,
}: LessonShellProps) {
  const lessonContent = viewer && progressManifest
    ? (
      <LessonProgressProvider
        viewerId={viewer.id}
        manifest={progressManifest}
        initialProgress={initialProgress ?? null}
      >
        <LessonProgressControls />
        {children}
      </LessonProgressProvider>
    )
    : children;

  return (
    <main className="lesson-page" id="main-content">
      <LearnerWorkspace
        pathway={pathway}
        currentLessonSlug={lesson.slug}
        viewer={viewer}
      />
      <article
        className="lesson-shell"
        data-progress-attempt={initialProgress?.attemptId}
        data-progress-manifest={progressManifest?.contentVersion}
        data-progress-unavailable={progressUnavailable || undefined}
      >
        <noscript>
          <details className="lesson-curriculum lesson-curriculum--fallback">
            <summary>Course contents</summary>
            <CurriculumNavigation pathway={pathway} currentLessonSlug={lesson.slug} />
          </details>
        </noscript>
        <header className="lesson-header">
          <p className="eyebrow">Lesson</p>
          <h1>{lesson.title}</h1>
          <p className="lesson-byline">
            {lesson.estimatedMinutes} minutes · {lesson.sections?.some(({ access }) => access === "public")
              ? "Public introduction · Free account to continue"
              : "Free account required"}
          </p>
        </header>

        <LearningObjective>{lesson.objective}</LearningObjective>

        <LessonSectionNavigation sections={lesson.sections} />

        <div className="lesson-content">{lessonContent}</div>

        {!viewer ? <RegistrationBoundary returnTo={`/learn/${pathway.slug}/${lesson.slug}`} /> : null}

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
