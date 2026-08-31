import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { LessonSection } from "@/features/catalog/catalog.types";

import { LessonSectionNavigation } from "./lesson-section-navigation";

afterEach(cleanup);

const sections = [
  { id: "communication-decisions", label: "Communication decisions" },
  { id: "packet-journey", label: "Interactive packet journey" },
];

const missingSectionCases: Array<LessonSection[] | undefined> = [undefined, []];

describe("LessonSectionNavigation", () => {
  it("links each supplied lesson section", () => {
    render(<LessonSectionNavigation sections={sections} />);

    const navigation = screen.getByRole("navigation", { name: "On this page" });
    expect(
      within(navigation).getByRole("link", { name: "Communication decisions" }),
    ).toHaveAttribute("href", "#communication-decisions");
    expect(
      within(navigation).getByRole("link", { name: "Interactive packet journey" }),
    ).toHaveAttribute("href", "#packet-journey");
  });

  it.each(missingSectionCases)("omits navigation when lesson sections are %j", (missingSections) => {
    render(<LessonSectionNavigation sections={missingSections} />);

    expect(screen.queryByRole("navigation", { name: "On this page" })).toBeNull();
  });
});
