import type { Viewer, WorkspaceTool } from "./learner-workspace.types";

const workspaceTools = [
  { id: "course", label: "Course contents", requiresAccount: false, group: "learning" },
  { id: "learning", label: "My learning", requiresAccount: true, group: "learning" },
] as const satisfies readonly WorkspaceTool[];

export function getVisibleWorkspaceTools(viewer: Viewer | null) {
  return workspaceTools.filter((tool) => !tool.requiresAccount || viewer !== null);
}
