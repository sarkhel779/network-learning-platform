import { pathways } from "./catalog.data";
import type { LessonSummary, Pathway } from "./catalog.types";

export function getPathway(pathwaySlug: string): Pathway {
  const pathway = pathways.find(({ slug }) => slug === pathwaySlug);

  if (!pathway) {
    throw new Error("PATHWAY_NOT_FOUND");
  }

  return pathway;
}

export function getLesson(pathwaySlug: string, lessonSlug: string): LessonSummary {
  const lesson = getPathway(pathwaySlug).modules
    .flatMap(({ lessons }) => lessons)
    .find(({ slug }) => slug === lessonSlug);

  if (!lesson) {
    throw new Error("LESSON_NOT_FOUND");
  }

  return lesson;
}

export function listPublishedLessons(pathwaySlug: string): LessonSummary[] {
  return getPathway(pathwaySlug).modules
    .flatMap(({ lessons }) => lessons)
    .filter(({ published }) => published);
}

export function getAdjacentLessons(
  pathwaySlug: string,
  lessonSlug: string,
): { previous: LessonSummary | undefined; next: LessonSummary | undefined } {
  const lessons = getPathway(pathwaySlug).modules.flatMap(({ lessons }) => lessons);
  const lessonIndex = lessons.findIndex(({ slug }) => slug === lessonSlug);

  if (lessonIndex === -1) {
    throw new Error("LESSON_NOT_FOUND");
  }

  return {
    previous: lessons[lessonIndex - 1],
    next: lessons[lessonIndex + 1],
  };
}
