import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getAdjacentLessons,
  getLesson,
  listPathways,
  listPublishedLessons,
} from "@/features/catalog/catalog.repository";
import type { LessonSummary } from "@/features/catalog/catalog.types";
import {
  loadLessonContent,
  type LessonContentModule,
} from "@/features/lessons/lesson-content.repository";
import { LessonShell } from "@/features/lessons/lesson-shell";

import { isExpectedCatalogError } from "./catalog-error";

type LessonPageProps = {
  params: Promise<{ pathwaySlug: string; lessonSlug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return listPathways().flatMap(({ slug: pathwaySlug }) =>
    listPublishedLessons(pathwaySlug).map(({ slug: lessonSlug }) => ({
      pathwaySlug,
      lessonSlug,
    })),
  );
}

function findPublishedLesson(pathwaySlug: string, lessonSlug: string): LessonSummary {
  let lesson: LessonSummary;

  try {
    lesson = getLesson(pathwaySlug, lessonSlug);
  } catch (error) {
    if (isExpectedCatalogError(error)) {
      notFound();
    }
    throw error;
  }

  if (!lesson.published) {
    notFound();
  }

  return lesson;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { pathwaySlug, lessonSlug } = await params;
  const lesson = findPublishedLesson(pathwaySlug, lessonSlug);

  return { title: lesson.title, description: lesson.objective };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { pathwaySlug, lessonSlug } = await params;
  const lesson = findPublishedLesson(pathwaySlug, lessonSlug);
  const { previous, next } = getAdjacentLessons(pathwaySlug, lessonSlug);

  let LessonContent: LessonContentModule["default"];

  try {
    ({ default: LessonContent } = await loadLessonContent(pathwaySlug, lessonSlug));
  } catch (error) {
    if (error instanceof Error && error.message === "LESSON_CONTENT_NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  return (
    <LessonShell
      lesson={lesson}
      pathwaySlug={pathwaySlug}
      previous={previous}
      next={next}
    >
      <LessonContent />
    </LessonShell>
  );
}
