import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import type { Pathway } from "@/features/catalog/catalog.types";

import { CurriculumNavigation } from "./curriculum-navigation";

afterEach(cleanup);

const pathwayFixture: Pathway = {
  id: "path_networking_foundations",
  slug: "networking-foundations",
  title: "Networking Foundations",
  description: "Build a practical mental model for how modern networks move data.",
  audience: "Complete beginners who want to understand how computer networks work.",
  modules: [
    {
      id: "module_one",
      slug: "networking-essentials",
      title: "Module one",
      description: "Learn the core concepts behind network communication.",
      lessons: [
        {
          id: "lesson_current",
          slug: "current-lesson",
          title: "Intro to packets",
          objective: "Explain how packets move between hosts.",
          seo: {
            title: "Intro to Packets",
            description: "Learn how packets move between hosts.",
          },
          published: true,
          estimatedMinutes: 12,
          sections: [
            { id: "intro", label: "Introduction", access: "public" },
          ],
        },
        {
          id: "lesson_future_free",
          slug: "future-free",
          title: "Switching basics",
          objective: "Describe how switches handle frames.",
          seo: {
            title: "Switching Basics",
            description: "Learn how switches handle frames.",
          },
          published: false,
          estimatedMinutes: 10,
        },
      ],
    },
    {
      id: "module_two",
      slug: "packet-analysis-and-troubleshooting",
      title: "Module two",
      description: "Apply evidence to diagnose network faults.",
      lessons: [
        {
          id: "lesson_future_premium",
          slug: "future-premium",
          title: "Premium troubleshooting",
          objective: "Explain premium troubleshooting workflows.",
          seo: {
            title: "Troubleshooting Workflows",
            description: "Learn practical network troubleshooting workflows.",
          },
          published: false,
          estimatedMinutes: 14,
        },
      ],
    },
  ],
};

describe("CurriculumNavigation", () => {
  it("renders published Free links, upcoming non-links, and no legacy access labels", () => {
    render(
      <CurriculumNavigation
        pathway={pathwayFixture}
        currentLessonSlug="current-lesson"
      />,
    );

    const navigation = screen.getByRole("navigation", { name: "Course curriculum" });

    expect(within(navigation).getByRole("heading", { name: "Module one" })).toBeVisible();
    expect(within(navigation).getByRole("heading", { name: "Module two" })).toBeVisible();

    const currentLesson = within(navigation).getByRole("link", { name: /intro to packets/i });
    expect(currentLesson).toHaveAttribute("href", "/learn/networking-foundations/current-lesson");
    expect(currentLesson).toHaveAttribute("aria-current", "page");

    expect(within(navigation).getByText("Current lesson")).toBeVisible();
    expect(within(navigation).getAllByText("Coming later")).toHaveLength(2);
    expect(within(navigation).getAllByText("Free")).toHaveLength(1);

    const switchingBasics = within(navigation).getByText("Switching basics").closest("li");
    expect(switchingBasics).not.toBeNull();
    expect(within(switchingBasics as HTMLElement).getByText("Coming later")).toBeVisible();
    expect(within(switchingBasics as HTMLElement).queryByText("Free")).toBeNull();

    // Module two doesn't contain the current lesson, so it starts collapsed;
    // its content is present but not visible until expanded.
    const premiumTroubleshooting = within(navigation).getByText("Premium troubleshooting").closest("li");
    expect(premiumTroubleshooting).not.toBeNull();
    expect(within(premiumTroubleshooting as HTMLElement).getByText("Coming later")).not.toBeVisible();

    expect(within(navigation).queryByText("Premium")).toBeNull();
    expect(within(navigation).queryByText("Palo Alto Basics")).toBeNull();
    expect(within(navigation).queryByRole("link", { name: /switching basics/i })).toBeNull();
    expect(within(navigation).queryByRole("link", { name: /premium troubleshooting/i })).toBeNull();
  });

  it("preserves module order and lesson order from the catalog", () => {
    render(
      <CurriculumNavigation
        pathway={pathwayFixture}
        currentLessonSlug="current-lesson"
      />,
    );

    const navigation = screen.getByRole("navigation", { name: "Course curriculum" });
    const moduleHeadings = within(navigation).getAllByRole("heading", { level: 2 });

    expect(moduleHeadings.map(({ textContent }) => textContent)).toEqual([
      "Module one",
      "Module two",
    ]);

    const moduleOne = moduleHeadings[0].closest("li");
    expect(moduleOne).not.toBeNull();

    const lessonItems = within(moduleOne as HTMLElement).getAllByRole("listitem");
    expect(lessonItems.map(({ textContent }) => textContent)).toEqual([
      "Intro to packetsFreeCurrent lesson",
      "Switching basicsComing later",
    ]);
  });

  it("numbers modules and shows each one's lesson count", () => {
    render(
      <CurriculumNavigation pathway={pathwayFixture} currentLessonSlug="current-lesson" />,
    );

    const navigation = screen.getByRole("navigation", { name: "Course curriculum" });
    const moduleOne = within(navigation).getByRole("heading", { name: "Module one" }).closest("li") as HTMLElement;
    const moduleTwo = within(navigation).getByRole("heading", { name: "Module two" }).closest("li") as HTMLElement;

    expect(within(moduleOne).getByText("1")).toBeVisible();
    expect(within(moduleOne).getByText("2 lessons")).toBeVisible();
    expect(within(moduleTwo).getByText("2")).toBeVisible();
    expect(within(moduleTwo).getByText("1 lesson")).toBeVisible();
  });

  it("auto-expands the module with the current lesson, collapses the rest, and toggles on click", async () => {
    const user = userEvent.setup();
    render(
      <CurriculumNavigation pathway={pathwayFixture} currentLessonSlug="current-lesson" />,
    );

    const navigation = screen.getByRole("navigation", { name: "Course curriculum" });
    const moduleOneDetails = within(navigation).getByRole("heading", { name: "Module one" }).closest("details") as HTMLDetailsElement;
    const moduleTwoDetails = within(navigation).getByRole("heading", { name: "Module two" }).closest("details") as HTMLDetailsElement;

    expect(moduleOneDetails.open).toBe(true);
    expect(moduleTwoDetails.open).toBe(false);

    const moduleTwoSummary = within(navigation).getByRole("heading", { name: "Module two" }).closest("summary") as HTMLElement;
    await user.click(moduleTwoSummary);

    expect(moduleTwoDetails.open).toBe(true);
    expect(within(moduleTwoDetails).getByText("Premium troubleshooting")).toBeVisible();
  });

  it("shows completion status from progress data instead of the default Free tag", () => {
    render(
      <CurriculumNavigation
        pathway={pathwayFixture}
        currentLessonSlug="current-lesson"
        progressByLessonId={{ lesson_current: "in_progress" }}
      />,
    );

    const navigation = screen.getByRole("navigation", { name: "Course curriculum" });
    const moduleOne = within(navigation).getByRole("heading", { name: "Module one" }).closest("li") as HTMLElement;

    expect(within(moduleOne).getByText("0/1")).toBeVisible();
    expect(within(moduleOne).getByText("In progress")).toBeVisible();
    expect(within(moduleOne).queryByText("Free")).toBeNull();
  });
});
