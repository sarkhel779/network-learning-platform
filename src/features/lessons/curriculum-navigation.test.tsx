import { cleanup, render, screen, within } from "@testing-library/react";
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
          access: "free",
          published: true,
          estimatedMinutes: 12,
        },
        {
          id: "lesson_future_free",
          slug: "future-free",
          title: "Switching basics",
          objective: "Describe how switches handle frames.",
          access: "free",
          published: false,
          estimatedMinutes: 10,
        },
      ],
    },
    {
      id: "module_two",
      slug: "advanced-networking",
      title: "Module two",
      description: "Explore deeper routing and security topics.",
      lessons: [
        {
          id: "lesson_future_premium",
          slug: "future-premium",
          title: "Premium troubleshooting",
          objective: "Explain premium troubleshooting workflows.",
          access: "premium",
          published: false,
          estimatedMinutes: 14,
        },
      ],
    },
  ],
};

describe("CurriculumNavigation", () => {
  it("renders a curriculum tree with current published links and upcoming non-links", () => {
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
    expect(within(navigation).getAllByText("Free")).toHaveLength(2);
    expect(within(navigation).getByText("Premium")).toBeVisible();
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
      "Switching basicsFreeComing later",
    ]);
  });
});
