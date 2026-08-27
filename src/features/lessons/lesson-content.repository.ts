import type { ComponentType } from "react";

export type LessonContentModule = { default: ComponentType };
type LessonContentImport = () => Promise<LessonContentModule>;
type LessonContentKey = `${string}/${string}`;

const lessonImports: Readonly<Record<LessonContentKey, LessonContentImport>> = {};

export async function loadLessonContent(
  pathwaySlug: string,
  lessonSlug: string,
): Promise<LessonContentModule> {
  const key: LessonContentKey = `${pathwaySlug}/${lessonSlug}`;
  const loadContent = lessonImports[key];

  if (!loadContent) {
    throw new Error("LESSON_CONTENT_NOT_FOUND");
  }

  return loadContent();
}
