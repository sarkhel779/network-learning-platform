import type { LessonSummary } from "./catalog.types";

export function getLessonAccessLabel(lesson: LessonSummary): "Free" | "Free account" {
  return lesson.format === "assessment" ? "Free account" : "Free";
}
