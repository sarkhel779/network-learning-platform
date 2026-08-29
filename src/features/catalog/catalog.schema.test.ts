import { describe, expect, it } from "vitest";

import { lessonSummarySchema } from "./catalog.schema";

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
});
