import { z } from "zod";

const idSchema = z.string().regex(/^(path|module|lesson)_[a-z0-9_]+$/);
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const learnerTextSchema = z.string().trim().min(1);
const lessonSectionSchema = z.object({
  id: slugSchema,
  label: learnerTextSchema,
});

export const lessonSummarySchema = z
  .object({
    id: idSchema,
    slug: slugSchema,
    title: learnerTextSchema,
    objective: learnerTextSchema,
    access: z.enum(["free", "premium"]),
    published: z.boolean(),
    estimatedMinutes: z.number().int().min(1).max(60),
    sections: z.array(lessonSectionSchema).optional(),
  })
  .superRefine(({ sections }, context) => {
    const seen = new Set<string>();
    sections?.forEach(({ id }, index) => {
      if (seen.has(id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate lesson section id: ${id}`,
          path: ["sections", index, "id"],
        });
      }
      seen.add(id);
    });
  });

export const moduleSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  title: learnerTextSchema,
  description: learnerTextSchema,
  lessons: z.array(lessonSummarySchema),
});

export const pathwaySchema = z
  .object({
    id: idSchema,
    slug: slugSchema,
    title: learnerTextSchema,
    description: learnerTextSchema,
    audience: learnerTextSchema,
    modules: z.array(moduleSchema),
  })
  .superRefine(({ modules }, context) => {
    const moduleIds = new Set<string>();
    const moduleSlugs = new Set<string>();
    const lessonIds = new Set<string>();
    const lessonSlugs = new Set<string>();

    modules.forEach((module, moduleIndex) => {
      if (moduleIds.has(module.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate module id: ${module.id}`,
          path: ["modules", moduleIndex, "id"],
        });
      }
      moduleIds.add(module.id);

      if (moduleSlugs.has(module.slug)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate module slug: ${module.slug}`,
          path: ["modules", moduleIndex, "slug"],
        });
      }
      moduleSlugs.add(module.slug);

      module.lessons.forEach((lesson, lessonIndex) => {
        if (lessonIds.has(lesson.id)) {
          context.addIssue({
            code: "custom",
            message: `Duplicate lesson id: ${lesson.id}`,
            path: ["modules", moduleIndex, "lessons", lessonIndex, "id"],
          });
        }
        lessonIds.add(lesson.id);

        if (lessonSlugs.has(lesson.slug)) {
          context.addIssue({
            code: "custom",
            message: `Duplicate lesson slug: ${lesson.slug}`,
            path: ["modules", moduleIndex, "lessons", lessonIndex, "slug"],
          });
        }
        lessonSlugs.add(lesson.slug);
      });
    });
  });

export const pathwayCatalogSchema = z.array(pathwaySchema);
