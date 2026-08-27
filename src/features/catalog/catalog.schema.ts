import { z } from "zod";

const idSchema = z.string().regex(/^(path|module|lesson)_[a-z0-9_]+$/);
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const learnerTextSchema = z.string().trim().min(1);

export const lessonSummarySchema = z.object({
  id: idSchema,
  slug: slugSchema,
  title: learnerTextSchema,
  objective: learnerTextSchema,
  access: z.enum(["free", "premium"]),
  published: z.boolean(),
  estimatedMinutes: z.number().int().min(1).max(60),
});

export const moduleSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  title: learnerTextSchema,
  description: learnerTextSchema,
  lessons: z.array(lessonSummarySchema),
});

export const pathwaySchema = z.object({
  id: idSchema,
  slug: slugSchema,
  title: learnerTextSchema,
  description: learnerTextSchema,
  audience: learnerTextSchema,
  modules: z.array(moduleSchema),
});

export const pathwayCatalogSchema = z.array(pathwaySchema);
