"use server";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/features/admin/admin-access";
import { parseLessonMove, parseLessonPublication } from "@/features/admin/admin-input.schema";
import { setLessonPublished, setModuleLessonOrder } from "@/features/admin/admin.repository";
import { listPathways } from "@/features/catalog/catalog.repository";
import type { LessonSummary, Module, Pathway } from "@/features/catalog/catalog.types";
import {
  applyContentOverrides,
  loadContentOverridesSnapshot,
} from "@/features/catalog/content-publication.repository";

function findLessonLocation(lessonId: string): { pathway: Pathway; lesson: LessonSummary } | null {
  for (const pathway of listPathways()) {
    const lesson = pathway.modules.flatMap(({ lessons }) => lessons).find((candidate) => candidate.id === lessonId);
    if (lesson) return { pathway, lesson };
  }
  return null;
}

function findModuleLocation(moduleId: string): { pathway: Pathway; courseModule: Module } | null {
  for (const pathway of listPathways()) {
    const courseModule = pathway.modules.find((candidate) => candidate.id === moduleId);
    if (courseModule) return { pathway, courseModule };
  }
  return null;
}

function revalidateCourseContent(pathwaySlug: string, lessonSlug?: string) {
  revalidatePath("/admin/courses");
  revalidatePath(`/paths/${pathwaySlug}`);
  if (lessonSlug) revalidatePath(`/learn/${pathwaySlug}/${lessonSlug}`);
  revalidatePath("/sitemap.xml");
}

export async function setLessonPublishedAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireStaff("courses");
  const lessonId = formData.get("lessonId");
  const published = formData.get("published");
  if (typeof lessonId !== "string" || typeof published !== "string") {
    return { ok: false, message: "Invalid publication change." };
  }

  let input;
  try {
    input = parseLessonPublication({ lessonId, published });
  } catch {
    return { ok: false, message: "Enter a valid lesson and publication state." };
  }

  const location = findLessonLocation(input.lessonId);
  if (!location) {
    return { ok: false, message: "That lesson no longer exists in the catalogue." };
  }

  try {
    await setLessonPublished(input.lessonId, input.published);
    revalidateCourseContent(location.pathway.slug, location.lesson.slug);
    return { ok: true, message: `${location.lesson.title} is now ${input.published ? "published" : "a draft"}.` };
  } catch {
    return { ok: false, message: "Lesson publication could not be updated." };
  }
}

export async function moveLessonAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireStaff("courses");
  const moduleId = formData.get("moduleId");
  const lessonId = formData.get("lessonId");
  const direction = formData.get("direction");
  if (typeof moduleId !== "string" || typeof lessonId !== "string" || typeof direction !== "string") {
    return { ok: false, message: "Invalid reorder request." };
  }

  let input;
  try {
    input = parseLessonMove({ moduleId, lessonId, direction });
  } catch {
    return { ok: false, message: "Enter a valid module, lesson, and direction." };
  }

  const location = findModuleLocation(input.moduleId);
  if (!location) {
    return { ok: false, message: "That module no longer exists in the catalogue." };
  }

  const overrides = await loadContentOverridesSnapshot();
  const orderedModule = applyContentOverrides(location.pathway, overrides).modules.find(
    (candidate) => candidate.id === input.moduleId,
  );
  const lessonIds = (orderedModule ?? location.courseModule).lessons.map((lesson) => lesson.id);

  const index = lessonIds.indexOf(input.lessonId);
  if (index === -1) {
    return { ok: false, message: "That lesson is not part of this module." };
  }

  const swapIndex = input.direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= lessonIds.length) {
    return { ok: true, message: "That lesson is already at the end of the module." };
  }

  const reordered = [...lessonIds];
  [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];

  try {
    await setModuleLessonOrder(input.moduleId, reordered);
    revalidateCourseContent(location.pathway.slug);
    return { ok: true, message: "Lesson order updated." };
  } catch {
    return { ok: false, message: "Lesson order could not be updated." };
  }
}
