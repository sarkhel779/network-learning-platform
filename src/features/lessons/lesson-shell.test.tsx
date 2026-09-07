import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { getPathway } from "@/features/catalog/catalog.repository";
import type { LessonSummary } from "@/features/catalog/catalog.types";

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

const pathway = getPathway("networking-foundations");

describe("LessonShell", () => {
  it("renders the learning objective before lesson content", () => {
    render(
      <LessonShell
        pathway={pathway}
        lesson={lesson}
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
        pathway={pathway}
        lesson={lesson}
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
        pathway={pathway}
        lesson={lesson}
        next={nextLesson}
      >
        <p>Lesson content</p>
      </LessonShell>,
    );

    const navigation = screen.getByRole("navigation", { name: "Lesson navigation" });
    expect(within(navigation).getByText("Next: Switches — Coming later")).toBeVisible();
    expect(within(navigation).queryByRole("link", { name: /next: switches/i })).not.toBeInTheDocument();
  });

  it("renders the pathway in desktop and mobile course navigation", () => {
    render(
      <LessonShell pathway={pathway} lesson={pathway.modules[0].lessons[0]}>
        <p>Lesson content</p>
      </LessonShell>,
    );

    expect(screen.getByRole("complementary", { name: "Course contents" })).toBeVisible();
    expect(screen.getAllByText("Networking Essentials")[0]).toBeVisible();
    expect(screen.getByText("Course contents", { selector: "summary" })).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: /how networks communicate/i })[0],
    ).toHaveAttribute("aria-current", "page");
  });

  it("renders section navigation separately from the course curriculum", () => {
    render(
      <LessonShell
        pathway={pathway}
        lesson={{
          ...lesson,
          sections: [{ id: "communication-decisions", label: "Communication decisions" }],
        }}
      >
        <p>Lesson content</p>
      </LessonShell>,
    );

    const sectionNavigation = screen.getByRole("navigation", { name: "On this page" });
    const curriculumNavigation = screen.getAllByRole("navigation", { name: "Course curriculum" })[0];

    expect(
      within(sectionNavigation).getByRole("link", { name: "Communication decisions" }),
    ).toHaveAttribute("href", "#communication-decisions");
    expect(curriculumNavigation.contains(sectionNavigation)).toBe(false);
  });
});
