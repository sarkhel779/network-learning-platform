import { describe, expect, it } from "vitest";

import type { Viewer } from "./learner-workspace.types";
import { getVisibleWorkspaceTools } from "./workspace-tools";

const viewer: Viewer = { id: "learner-1", displayName: "Learner", avatarUrl: null };

describe("getVisibleWorkspaceTools", () => {
  it("shows only Course contents to signed-out visitors", () => {
    expect(getVisibleWorkspaceTools(null).map(({ id }) => id)).toEqual(["course"]);
  });

  it("keeps every signed-in tool in the approved order", () => {
    expect(getVisibleWorkspaceTools(viewer).map(({ id }) => id)).toEqual([
      "course",
      "learning",
      "notes",
      "bookmarks",
      "practice",
      "glossary",
      "feedback",
      "account",
      "pro",
    ]);
  });
});
