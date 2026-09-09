import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LessonProgressControls } from "./lesson-progress-controls";

const { restartLesson } = vi.hoisted(() => ({ restartLesson: vi.fn() }));
const progress = {
  manifest: { items: [{ itemId: "one", label: "Introduction", anchor: "intro" }, { itemId: "two", label: "Second topic", anchor: "second" }] },
  authoritativeProgress: { completionPercent: 50, lastAnchor: "intro", nextItemId: "two", status: "in_progress" },
  optimisticCompletionPercent: 50,
  restartLesson,
};
vi.mock("./lesson-progress-context", () => ({ useLessonProgress: () => progress }));

beforeEach(() => restartLesson.mockReset().mockResolvedValue(undefined));
afterEach(cleanup);

describe("LessonProgressControls", () => {
  it("shows text progress and moves only after explicit navigation", async () => {
    render(<><h2 id="intro" tabIndex={-1}>Introduction</h2><h2 id="second" tabIndex={-1}>Second topic</h2><LessonProgressControls /></>);
    expect(screen.getByText("50% complete")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Second topic" })).not.toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Go to next incomplete item" }));
    expect(screen.getByRole("heading", { name: "Second topic" })).toHaveFocus();
  });

  it("requires confirmation before restarting and explains history", async () => {
    render(<LessonProgressControls />);
    await userEvent.click(screen.getByRole("button", { name: "Restart lesson" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Your previous attempts and answers remain in your history.");
    expect(restartLesson).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Confirm restart" }));
    expect(restartLesson).toHaveBeenCalledOnce();
  });

  it("reports a missing resume target instead of moving focus", async () => {
    render(<LessonProgressControls />);
    await userEvent.click(screen.getByRole("button", { name: "Resume where you left off" }));
    expect(screen.getByRole("status")).toHaveTextContent("That lesson position is no longer available.");
  });
});
