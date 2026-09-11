import { z } from "zod";

import { listPublishedLessons } from "@/features/catalog/catalog.repository";

const publishedLessonSlugs = new Set(
  listPublishedLessons("networking-foundations").map(({ slug }) => slug),
);

export function isPublishedLessonSlug(value: string): boolean {
  return publishedLessonSlugs.has(value);
}

const waitlistJoinSchema = z.object({
  consent: z.literal(true),
  sourceLessonSlug: z.string().min(1).refine(isPublishedLessonSlug).optional(),
}).strict();

export type WaitlistJoinInput = z.infer<typeof waitlistJoinSchema>;

export function parseWaitlistJoinInput(value: unknown): WaitlistJoinInput {
  return waitlistJoinSchema.parse(value);
}
