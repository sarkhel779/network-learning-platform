import { describe, expect, it } from "vitest";

import * as lessonPage from "./page";

type StaticLessonPage = {
  dynamicParams?: boolean;
  generateStaticParams?: () => Array<{
    pathwaySlug: string;
    lessonSlug: string;
  }>;
};

const staticLessonPage = lessonPage as StaticLessonPage;

describe("lesson route generation", () => {
  it("emits only published lessons from the validated catalogue", () => {
    expect(staticLessonPage.generateStaticParams?.()).toEqual([
      {
        pathwaySlug: "networking-foundations",
        lessonSlug: "how-networks-communicate",
      },
    ]);
  });

  it("rejects lesson slugs outside the generated published catalogue", () => {
    expect(staticLessonPage.dynamicParams).toBe(false);
  });
});
