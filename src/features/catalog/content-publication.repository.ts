import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { LessonSummary, Pathway } from "./catalog.types";
import type { ContentOverridesSnapshot } from "./content-publication.types";

const emptySnapshot: ContentOverridesSnapshot = { publications: {}, orders: {} };

export async function loadContentOverridesSnapshot(): Promise<ContentOverridesSnapshot> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("content_overrides_snapshot");
    if (error || !data || typeof data !== "object") return emptySnapshot;

    const result = data as { publications?: unknown; orders?: unknown };
    const publications: Record<string, boolean> = {};
    if (result.publications && typeof result.publications === "object") {
      for (const [lessonId, published] of Object.entries(result.publications as Record<string, unknown>)) {
        if (typeof published === "boolean") publications[lessonId] = published;
      }
    }

    const orders: Record<string, string[]> = {};
    if (result.orders && typeof result.orders === "object") {
      for (const [moduleId, order] of Object.entries(result.orders as Record<string, unknown>)) {
        if (Array.isArray(order) && order.every((id) => typeof id === "string")) {
          orders[moduleId] = order;
        }
      }
    }

    return { publications, orders };
  } catch {
    return emptySnapshot;
  }
}

export function isExactLessonOrder(currentIds: readonly string[], overrideIds: readonly string[]) {
  return overrideIds.length === currentIds.length
    && new Set(overrideIds).size === currentIds.length
    && currentIds.every((id) => overrideIds.includes(id));
}

export function applyContentOverrides(pathway: Pathway, overrides: ContentOverridesSnapshot): Pathway {
  return {
    ...pathway,
    modules: pathway.modules.map((module) => {
      const order = overrides.orders[module.id];
      let lessons = module.lessons;

      if (order && isExactLessonOrder(module.lessons.map(({ id }) => id), order)) {
        const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
        lessons = order
          .map((lessonId) => byId.get(lessonId))
          .filter((lesson): lesson is LessonSummary => lesson !== undefined);
      }

      return {
        ...module,
        lessons: lessons.map((lesson) => {
          const published = overrides.publications[lesson.id];
          return published === undefined ? lesson : { ...lesson, published };
        }),
      };
    }),
  };
}
