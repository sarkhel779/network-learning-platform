import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { getPathway } from "@/features/catalog/catalog.repository";

import type { Viewer } from "./learner-workspace.types";
import { LearnerWorkspace } from "./learner-workspace";

afterEach(cleanup);

const pathway = getPathway("networking-foundations");
const viewer: Viewer = { id: "learner-1", displayName: "Pranita", avatarUrl: null };

describe("LearnerWorkspace", () => {
  it("renders only Course contents for a signed-out visitor", () => {
    render(
      <LearnerWorkspace pathway={pathway} currentLessonSlug="how-networks-communicate" viewer={null} />,
    );

    expect(screen.getByRole("button", { name: "Course contents" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Learning tools" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Notes" })).not.toBeInTheDocument();
  });

  it("renders the approved tool order for an authenticated learner", () => {
    render(
      <LearnerWorkspace pathway={pathway} currentLessonSlug="how-networks-communicate" viewer={viewer} />,
    );

    expect(
      screen.getByRole("toolbar", { name: "Learner workspace" })
        .querySelectorAll("button"),
    ).toHaveLength(9);
    expect(
      Array.from(
        screen.getByRole("toolbar", { name: "Learner workspace" })
          .querySelectorAll("button"),
      ).map((button) => button.textContent),
    ).toEqual([
      "Course contents",
      "My learning",
      "Notes",
      "Bookmarks",
      "Practice",
      "Glossary",
      "Feedback",
      "Account",
      "Pro",
    ]);
  });

  it("opens one drawer, switches tools, and reselects to close", async () => {
    const user = userEvent.setup();
    render(
      <LearnerWorkspace pathway={pathway} currentLessonSlug="how-networks-communicate" viewer={viewer} />,
    );

    await user.click(screen.getByRole("button", { name: "Notes" }));
    expect(screen.getByRole("dialog", { name: "Notes" })).toBeVisible();

    const drawerTools = screen.getByRole("navigation", { name: "Workspace tools" });
    await user.click(within(drawerTools).getByRole("button", { name: "Bookmarks" }));
    expect(screen.queryByRole("dialog", { name: "Notes" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Bookmarks" })).toBeVisible();

    await user.click(within(screen.getByRole("navigation", { name: "Workspace tools" })).getByRole("button", { name: "Bookmarks" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the real curriculum inside Course contents", async () => {
    const user = userEvent.setup();
    render(
      <LearnerWorkspace pathway={pathway} currentLessonSlug="how-networks-communicate" viewer={null} />,
    );

    await user.click(screen.getByRole("button", { name: "Course contents" }));
    expect(screen.getByRole("dialog", { name: "Course contents" })).toHaveTextContent(
      "Network and Device Essentials",
    );
  });

  it("makes every authenticated tool reachable from the mobile menu", async () => {
    const user = userEvent.setup();
    render(
      <LearnerWorkspace pathway={pathway} currentLessonSlug="how-networks-communicate" viewer={viewer} />,
    );

    await user.click(screen.getByRole("button", { name: "Learning tools" }));
    const dialog = screen.getByRole("dialog", { name: "Learning tools" });
    expect(dialog.querySelectorAll(".learner-workspace-mobile-menu button")).toHaveLength(9);

    await user.click(screen.getAllByRole("button", { name: "Notes" }).at(-1)!);
    expect(screen.getByRole("dialog", { name: "Notes" })).toBeVisible();
  });
});
