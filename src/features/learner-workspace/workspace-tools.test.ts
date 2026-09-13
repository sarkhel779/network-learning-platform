import { describe, expect, it } from "vitest";

import type { Viewer } from "./learner-workspace.types";
import { getVisibleWorkspaceTools } from "./workspace-tools";

const viewer: Viewer = { id: "learner-1", displayName: "Learner", avatarUrl: null };

describe("getVisibleWorkspaceTools", () => {
  it("shows only Course contents to signed-out visitors", () => {
    expect(getVisibleWorkspaceTools(null).map(({ id }) => id)).toEqual(["course"]);
  });

  it("shows only working tools to signed-in learners", () => {
    expect(getVisibleWorkspaceTools(viewer).map(({ id }) => id)).toEqual([
      "course",
      "learning",
    ]);
  });
});
