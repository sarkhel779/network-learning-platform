import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { LessonSummary } from "@/features/catalog/catalog.types";

import { loadLessonContent } from "./lesson-content.repository";
import { LessonShell } from "./lesson-shell";

afterEach(cleanup);

const lesson: LessonSummary = {
  id: "lesson_hosts",
  slug: "hosts",
  title: "Hosts",
  objective: "Identify hosts on a network.",
  access: "free",
  published: true,
  estimatedMinutes: 8,
};

const previousLesson: LessonSummary = {
  ...lesson,
  id: "lesson_networks",
  slug: "networks",
  title: "Networks",
};

const nextLesson: LessonSummary = {
  ...lesson,
  id: "lesson_switches",
  slug: "switches",
  title: "Switches",
  published: false,
};

describe("LessonShell", () => {
  it("renders the learning objective before lesson content", () => {
    render(
      <LessonShell
        lesson={lesson}
        pathwaySlug="networking-foundations"
        previous={previousLesson}
        next={nextLesson}
      >
        <p>Lesson body starts here.</p>
      </LessonShell>,
    );

    const objective = screen.getByRole("heading", { name: "Learning objective" });
    const content = screen.getByText("Lesson body starts here.");

    expect(
      objective.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Hosts", level: 1 })).toBeVisible();
    expect(screen.getByText("8 minutes · Free")).toBeVisible();
  });

  it("links a published previous lesson", () => {
    render(
      <LessonShell
        lesson={lesson}
        pathwaySlug="networking-foundations"
        previous={previousLesson}
      >
        <p>Lesson content</p>
      </LessonShell>,
    );

    expect(screen.getByRole("link", { name: "Previous: Networks" })).toHaveAttribute(
      "href",
      "/learn/networking-foundations/networks",
    );
  });

  it("renders an unpublished next lesson as non-link guidance", () => {
    render(
      <LessonShell
        lesson={lesson}
        pathwaySlug="networking-foundations"
        next={nextLesson}
      >
        <p>Lesson content</p>
      </LessonShell>,
    );

    const navigation = screen.getByRole("navigation", { name: "Lesson navigation" });
    expect(within(navigation).getByText("Next: Switches — Coming later")).toBeVisible();
    expect(within(navigation).queryByRole("link", { name: /next: switches/i })).not.toBeInTheDocument();
  });
});

describe("loadLessonContent", () => {
  it("rejects a lesson absent from the explicit import map", async () => {
    await expect(loadLessonContent("unknown-pathway", "unknown-lesson")).rejects.toThrow(
      "LESSON_CONTENT_NOT_FOUND",
    );
  });
});
