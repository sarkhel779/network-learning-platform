import { describe, expect, it } from "vitest";

import { lessonSummarySchema, pathwayCatalogSchema } from "./catalog.schema";

function validPathway() {
  return {
    id: "path_example",
    slug: "example",
    title: "Example pathway",
    description: "A pathway used for schema validation.",
    audience: "Learners",
    modules: [
      {
        id: "module_first",
        slug: "first",
        title: "First module",
        description: "The first module.",
        lessons: [
          {
            id: "lesson_first",
            slug: "first-lesson",
            title: "First lesson",
            objective: "Explain the first lesson.",
            access: "free",
            published: true,
            estimatedMinutes: 10,
          },
        ],
      },
      {
        id: "module_second",
        slug: "second",
        title: "Second module",
        description: "The second module.",
        lessons: [
          {
            id: "lesson_second",
            slug: "second-lesson",
            title: "Second lesson",
            objective: "Explain the second lesson.",
            access: "premium",
            published: false,
            estimatedMinutes: 10,
          },
        ],
      },
    ],
  };
}

describe("lesson summary schema", () => {
  it("accepts ordered lesson sections", () => {
    const lesson = lessonSummarySchema.parse({
      id: "lesson_example",
      slug: "example",
      title: "Example",
      objective: "Explain an example.",
      access: "free",
      published: true,
      estimatedMinutes: 10,
      sections: [{ id: "first-section", label: "First section" }],
    });

    expect(lesson.sections).toEqual([
      { id: "first-section", label: "First section" },
    ]);
  });

  it("rejects duplicate section ids", () => {
    expect(() =>
      lessonSummarySchema.parse({
        id: "lesson_example",
        slug: "example",
        title: "Example",
        objective: "Explain an example.",
        access: "free",
        published: true,
        estimatedMinutes: 10,
        sections: [
          { id: "repeated", label: "First" },
          { id: "repeated", label: "Second" },
        ],
      }),
    ).toThrow();
  });

  it("rejects duplicate module ids within a pathway", () => {
    const pathway = validPathway();
    pathway.modules[1].id = pathway.modules[0].id;

    expect(() => pathwayCatalogSchema.parse([pathway])).toThrow(/duplicate module id/i);
  });

  it("rejects duplicate module slugs within a pathway", () => {
    const pathway = validPathway();
    pathway.modules[1].slug = pathway.modules[0].slug;

    expect(() => pathwayCatalogSchema.parse([pathway])).toThrow(/duplicate module slug/i);
  });

  it("rejects duplicate lesson ids across a pathway", () => {
    const pathway = validPathway();
    pathway.modules[1].lessons[0].id = pathway.modules[0].lessons[0].id;

    expect(() => pathwayCatalogSchema.parse([pathway])).toThrow(/duplicate lesson id/i);
  });

  it("rejects duplicate lesson slugs across a pathway", () => {
    const pathway = validPathway();
    pathway.modules[1].lessons[0].slug = pathway.modules[0].lessons[0].slug;

    expect(() => pathwayCatalogSchema.parse([pathway])).toThrow(/duplicate lesson slug/i);
  });
});
