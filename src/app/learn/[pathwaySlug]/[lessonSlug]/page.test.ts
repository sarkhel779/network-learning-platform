import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/lessons/lesson-content.repository", () => ({
  loadLessonContent: async () => ({ default: () => null }),
}));

import * as lessonPage from "./page";

type StaticLessonPage = {
  dynamicParams?: boolean;
  generateStaticParams?: () => Array<{
    pathwaySlug: string;
    lessonSlug: string;
  }>;
};

const staticLessonPage = lessonPage as StaticLessonPage;

afterEach(cleanup);

describe("lesson route generation", () => {
  it("emits only published lessons from the validated catalogue", () => {
    expect(staticLessonPage.generateStaticParams?.()).toEqual([
      {
        pathwaySlug: "networking-foundations",
        lessonSlug: "how-networks-communicate",
      },
      {
        pathwaySlug: "networking-foundations",
        lessonSlug: "hosts-and-network-devices",
      },
    ]);
  });

  it("rejects lesson slugs outside the generated published catalogue", () => {
    expect(staticLessonPage.dynamicParams).toBe(false);
  });

  it("renders the complete pathway in the lesson shell", async () => {
    render(
      await lessonPage.default({
        params: Promise.resolve({
          pathwaySlug: "networking-foundations",
          lessonSlug: "how-networks-communicate",
        }),
      }),
    );

    expect(screen.getByRole("complementary", { name: "Course contents" })).toBeVisible();
    expect(screen.getAllByText("Networking Essentials")[0]).toBeVisible();
    expect(screen.getByText("Course contents", { selector: "summary" })).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: /how networks communicate/i })[0],
    ).toHaveAttribute("aria-current", "page");
  });
});
