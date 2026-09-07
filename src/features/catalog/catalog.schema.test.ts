import { describe, expect, it } from "vitest";

import {
  lessonSectionSchema,
  lessonSummarySchema,
  pathwayCatalogSchema,
} from "./catalog.schema";

function validLesson() {
  return {
    id: "lesson_example",
    slug: "example",
    title: "Example",
    objective: "Explain an example.",
    seo: {
      title: "Example lesson | Packetsecrets",
      description: "Learn the example networking concept.",
    },
    published: true,
    estimatedMinutes: 10,
    sections: [{ id: "introduction", label: "Introduction", access: "public" }],
  };
}

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
            seo: {
              title: "First lesson | Packetsecrets",
              description: "Learn the first lesson.",
            },
            published: true,
            estimatedMinutes: 10,
            sections: [{ id: "introduction", label: "Introduction", access: "public" }],
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
            seo: {
              title: "Second lesson | Packetsecrets",
              description: "Learn the second lesson.",
            },
            published: false,
            estimatedMinutes: 10,
          },
        ],
      },
    ],
  };
}

describe("lesson summary schema", () => {
  it("accepts public, account, and pro section access", () => {
    expect(() =>
      lessonSectionSchema.parse({
        id: "introduction",
        label: "Introduction",
        access: "public",
      }),
    ).not.toThrow();
    expect(() =>
      lessonSectionSchema.parse({
        id: "practice",
        label: "Practice",
        access: "account",
      }),
    ).not.toThrow();
    expect(() =>
      lessonSectionSchema.parse({
        id: "rfc-and-vendor-deep-dive",
        label: "Pro Deep Dive",
        access: "pro",
        preview: "Connect the standard to read-only vendor checks.",
      }),
    ).not.toThrow();
  });

  it("rejects an unknown section access value", () => {
    expect(() =>
      lessonSectionSchema.parse({
        id: "restricted",
        label: "Restricted",
        access: "enterprise",
      }),
    ).toThrow();
  });

  it("rejects a Pro section without a preview when parsed directly", () => {
    expect(() =>
      lessonSectionSchema.parse({
        id: "pro-deep-dive",
        label: "Pro Deep Dive",
        access: "pro",
      }),
    ).toThrow(/preview/i);
  });

  it("requires published lessons to have at least one section", () => {
    const publishedLesson = { ...validLesson(), sections: undefined };

    expect(() => lessonSummarySchema.parse(publishedLesson)).toThrow(/section/i);
    expect(() =>
      lessonSummarySchema.parse({ ...validLesson(), sections: [] }),
    ).toThrow(/section/i);
  });

  it("allows unpublished lesson placeholders without sections", () => {
    const unpublishedLesson = { ...validLesson(), sections: undefined };

    expect(() =>
      lessonSummarySchema.parse({ ...unpublishedLesson, published: false }),
    ).not.toThrow();
  });

  it("accepts ordered lesson sections and preserves SEO metadata", () => {
    const lesson = lessonSummarySchema.parse({
      ...validLesson(),
      sections: [
        { id: "first-section", label: "First section", access: "public" },
        { id: "practice", label: "Practice", access: "account" },
        {
          id: "pro-deep-dive",
          label: "Pro Deep Dive",
          access: "pro",
          preview: "Connect the standard to vendor diagnostics.",
        },
      ],
    });

    expect(lesson.sections).toEqual([
      { id: "first-section", label: "First section", access: "public" },
      { id: "practice", label: "Practice", access: "account" },
      {
        id: "pro-deep-dive",
        label: "Pro Deep Dive",
        access: "pro",
        preview: "Connect the standard to vendor diagnostics.",
      },
    ]);
    expect(lesson.seo).toEqual({
      title: "Example lesson | Packetsecrets",
      description: "Learn the example networking concept.",
    });
  });

  it("rejects duplicate section ids", () => {
    expect(() =>
      lessonSummarySchema.parse({
        ...validLesson(),
        sections: [
          { id: "repeated", label: "First", access: "public" },
          { id: "repeated", label: "Second", access: "account" },
        ],
      }),
    ).toThrow();
  });

  it("rejects whitespace-only previews for Pro sections", () => {
    expect(() =>
      lessonSummarySchema.parse({
        ...validLesson(),
        sections: [
          { id: "introduction", label: "Introduction", access: "public" },
          { id: "pro-deep-dive", label: "Pro Deep Dive", access: "pro", preview: " " },
        ],
      }),
    ).toThrow();
  });

  it("rejects section access that becomes less restrictive", () => {
    expect(() =>
      lessonSummarySchema.parse({
        ...validLesson(),
        sections: [
          { id: "introduction", label: "Introduction", access: "public" },
          { id: "practice", label: "Practice", access: "account" },
          { id: "summary", label: "Summary", access: "public" },
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
