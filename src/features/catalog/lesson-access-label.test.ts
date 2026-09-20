import { describe, expect, it } from "vitest";

import type { LessonSummary } from "./catalog.types";
import { getLessonAccessLabel } from "./lesson-access-label";

const lesson: LessonSummary = {
  id: "lesson_example",
  slug: "example",
  title: "Example",
  objective: "Learn an example.",
  seo: { title: "Example", description: "Learn an example." },
  estimatedMinutes: 5,
  published: true,
  sections: [{ id: "intro", label: "Introduction", access: "public" }],
};

describe("getLessonAccessLabel", () => {
  it("distinguishes public lessons from account assessments", () => {
    expect(getLessonAccessLabel(lesson)).toBe("Free");
    expect(getLessonAccessLabel({ ...lesson, format: "assessment" })).toBe("Free account");
  });
});
