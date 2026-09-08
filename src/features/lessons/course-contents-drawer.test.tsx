import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { getPathway } from "@/features/catalog/catalog.repository";

import { CourseContentsDrawer } from "./course-contents-drawer";

afterEach(cleanup);

const pathway = getPathway("networking-foundations");
const currentLessonSlug = "how-networks-communicate";

describe("CourseContentsDrawer", () => {
  it("opens from a collapsed state and returns focus after Escape", async () => {
    const user = userEvent.setup();
    render(<CourseContentsDrawer pathway={pathway} currentLessonSlug={currentLessonSlug} />);

    const trigger = screen.getByRole("button", { name: "Course contents" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Course contents" });
    expect(dialog).toBeVisible();
    expect(within(dialog).getByRole("button", { name: "Close course contents" })).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes from the backdrop and a published lesson selection", async () => {
    const user = userEvent.setup();
    render(<CourseContentsDrawer pathway={pathway} currentLessonSlug={currentLessonSlug} />);

    const trigger = screen.getByRole("button", { name: "Course contents" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Dismiss course contents" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Course contents" });
    const lessonLink = within(dialog).getByRole("link", { name: /hosts, clients, servers/i });
    lessonLink.addEventListener("click", (event) => event.preventDefault());
    await user.click(lessonLink);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps Tab focus inside the open drawer", async () => {
    const user = userEvent.setup();
    render(<CourseContentsDrawer pathway={pathway} currentLessonSlug={currentLessonSlug} />);

    await user.click(screen.getByRole("button", { name: "Course contents" }));
    const dialog = screen.getByRole("dialog", { name: "Course contents" });
    const controls = Array.from(dialog.querySelectorAll<HTMLElement>("button, a[href]"));
    const first = controls[0];
    const last = controls.at(-1)!;

    last.focus();
    await user.keyboard("{Tab}");
    expect(first).toHaveFocus();

    first.focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(last).toHaveFocus();
  });
});
