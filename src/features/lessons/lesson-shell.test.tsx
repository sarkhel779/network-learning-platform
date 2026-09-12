import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  seo: { title: "Hosts", description: "Identify hosts on a network." },
  sections: [{ id: "hosts", label: "Hosts", access: "public" }],
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
        viewer={null}
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
    expect(screen.getByText("8 minutes · Public introduction · Free account to continue")).toBeVisible();
  });

  it("links a published previous lesson", () => {
    render(
      <LessonShell
        viewer={null}
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
        viewer={null}
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

  it("offers course navigation from a collapsed floating drawer", () => {
    render(
      <LessonShell viewer={null} pathway={pathway} lesson={pathway.modules[0].lessons[0]}>
        <p>Lesson content</p>
      </LessonShell>,
    );

    expect(screen.queryByRole("complementary", { name: "Course contents" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Course contents" })).toBeVisible();
    expect(screen.queryByRole("dialog", { name: "Course contents" })).not.toBeInTheDocument();
  });

  it("exposes account tools only to an authenticated viewer", () => {
    const { rerender } = render(
      <LessonShell viewer={null} pathway={pathway} lesson={lesson}>
        <p>Lesson content</p>
      </LessonShell>,
    );

    expect(screen.queryByRole("button", { name: "Notes" })).not.toBeInTheDocument();

    rerender(
      <LessonShell
        viewer={{ id: "learner-1", displayName: "Pranita", avatarUrl: null }}
        pathway={pathway}
        lesson={lesson}
      >
        <p>Lesson content</p>
      </LessonShell>,
    );

    expect(screen.getByRole("button", { name: "Notes" })).toBeVisible();
    expect(screen.queryByText(/learner-1|private@example|access_token/i)).not.toBeInTheDocument();
  });

  it("renders section navigation separately from the course curriculum", async () => {
    const user = userEvent.setup();
    render(
      <LessonShell
        viewer={null}
        pathway={pathway}
        lesson={{
          ...lesson,
          sections: [{ id: "communication-decisions", label: "Communication decisions", access: "public" }],
        }}
      >
        <p>Lesson content</p>
      </LessonShell>,
    );

    const sectionNavigation = screen.getByRole("navigation", { name: "Page contents" });
    const pageContentsButton = within(sectionNavigation).getByRole("button", { name: "Page contents" });
    expect(pageContentsButton).toHaveAttribute("aria-expanded", "false");
    await user.click(pageContentsButton);
    expect(pageContentsButton).toHaveAttribute("aria-expanded", "true");
    expect(within(sectionNavigation).getByTestId("network-map-route")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Course contents" }));
    const curriculumNavigation = screen.getByRole("navigation", { name: "Course curriculum" });

    expect(
      within(sectionNavigation).getByRole("link", { name: "Communication decisions" }),
    ).toHaveAttribute("href", "#communication-decisions");
    expect(curriculumNavigation.contains(sectionNavigation)).toBe(false);
  });

  it("places registration after public content and before bottom lesson navigation", () => {
    render(
      <LessonShell viewer={null} pathway={pathway} lesson={lesson}>
        <p>Public explanation and player content.</p>
      </LessonShell>,
    );

    const content = screen.getByText("Public explanation and player content.");
    const boundary = screen.getByRole("region", { name: "Continue this lesson for free" });
    const navigation = screen.getByRole("navigation", { name: "Lesson navigation" });
    expect(content.compareDocumentPosition(boundary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(boundary.compareDocumentPosition(navigation) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("link", { name: "Continue with Google or email" })).toHaveAttribute(
      "href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fhosts",
    );
  });
});
