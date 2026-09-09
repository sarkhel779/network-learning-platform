import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MyLearning, type MyLearningModel } from "./my-learning";

const model: MyLearningModel = {
  pathwayTitle: "Networking Foundations",
  pathwayId: "path_networking_foundations",
  completionPercent: 25,
  continueLesson: { lessonId: "lesson_two", title: "A very long lesson title that remains readable", href: "/learn/networking-foundations/two#next", status: "in_progress", completionPercent: 50, nextLabel: "Next concept", incorrectCheckCount: 1, contentVersion: 1 },
  groups: {
    in_progress: [{ lessonId: "lesson_two", title: "A very long lesson title that remains readable", href: "/learn/networking-foundations/two#next", status: "in_progress", completionPercent: 50, nextLabel: "Next concept", incorrectCheckCount: 1, contentVersion: 1 }],
    not_started: [{ lessonId: "lesson_one", title: "First lesson", href: "/learn/networking-foundations/one", status: "not_started", completionPercent: 0, nextLabel: "Introduction", incorrectCheckCount: 0, contentVersion: 1 }],
    completed: [{ lessonId: "lesson_three", title: "Finished lesson", href: "/learn/networking-foundations/three", status: "completed", completionPercent: 100, nextLabel: null, incorrectCheckCount: 0, contentVersion: 1 }],
  },
};

describe("MyLearning", () => {
  it("renders pathway progress, resume destination, status groups, and review signal", () => {
    render(<MyLearning model={model} />);
    expect(screen.getByText("25% complete")).toBeVisible();
    expect(screen.getByRole("link", { name: /Continue learning/ })).toHaveAttribute("href", "/learn/networking-foundations/two#next");
    expect(screen.getByText("Next: Next concept")).toBeVisible();
    expect(screen.getByText("1 answer to review")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Not started" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "In progress" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Completed" })).toBeVisible();
  });

  it("renders a useful empty state", () => {
    render(<MyLearning model={{ ...model, completionPercent: 0, continueLesson: null, groups: { not_started: [], in_progress: [], completed: [] } }} />);
    expect(screen.getByText("No published lessons are available yet.")).toBeVisible();
  });
});
