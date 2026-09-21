import { z } from "zod";

const idSchema = z.string().regex(/^(path|module|lesson)_[a-z0-9_]+$/);
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const learnerTextSchema = z.string().trim().min(1);
const contentAccessSchema = z.enum(["public", "account", "pro"]);
const lessonSeoSchema = z.object({
  title: learnerTextSchema,
  description: learnerTextSchema,
});

export const lessonSectionSchema = z
  .object({
    id: slugSchema,
    label: learnerTextSchema,
    access: contentAccessSchema,
    preview: learnerTextSchema.optional(),
  })
  .superRefine(({ access, preview }, context) => {
    if (access === "pro" && !preview) {
      context.addIssue({
        code: "custom",
        message: "Pro lesson sections require a preview.",
        path: ["preview"],
      });
    }
  });

const accessOrder = {
  public: 0,
  account: 1,
  pro: 2,
} as const;

export const lessonSummarySchema = z
  .object({
    id: idSchema,
    slug: slugSchema,
    title: learnerTextSchema,
    objective: learnerTextSchema,
    seo: lessonSeoSchema,
    published: z.boolean(),
    format: z.enum(["lesson", "assessment"]).optional(),
    estimatedMinutes: z.number().int().min(1).max(60),
    sections: z.array(lessonSectionSchema).optional(),
  })
  .superRefine(({ published, sections }, context) => {
    const seen = new Set<string>();
    let previousAccess = "public" as keyof typeof accessOrder;

    if (published && !sections?.length) {
      context.addIssue({
        code: "custom",
        message: "Published lessons require at least one section.",
        path: ["sections"],
      });
    }

    sections?.forEach((section, index) => {
      const { id, access } = section;
      if (seen.has(id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate lesson section id: ${id}`,
          path: ["sections", index, "id"],
        });
      }
      seen.add(id);

      if (accessOrder[access] < accessOrder[previousAccess]) {
        context.addIssue({
          code: "custom",
          message: `Lesson section access cannot move from ${previousAccess} back to ${access}.`,
          path: ["sections", index, "access"],
        });
      }

      previousAccess = access;
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

export const pathwayCatalogSchema = z
  .array(pathwaySchema)
  .superRefine((pathways, context) => {
    const lessonIds = new Set<string>();

    pathways.forEach((pathway, pathwayIndex) => {
      pathway.modules.forEach((module, moduleIndex) => {
        module.lessons.forEach((lesson, lessonIndex) => {
          if (lessonIds.has(lesson.id)) {
            context.addIssue({
              code: "custom",
              message: `Duplicate lesson id across pathways: ${lesson.id}`,
              path: [pathwayIndex, "modules", moduleIndex, "lessons", lessonIndex, "id"],
            });
          }
          lessonIds.add(lesson.id);
        });
      });
    });
  });
