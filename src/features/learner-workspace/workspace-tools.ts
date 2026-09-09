import type { Viewer, WorkspaceTool } from "./learner-workspace.types";

const workspaceTools = [
  { id: "course", label: "Course contents", requiresAccount: false, group: "learning" },
  { id: "learning", label: "My learning", requiresAccount: true, group: "learning" },
  { id: "notes", label: "Notes", requiresAccount: true, group: "learning" },
  { id: "bookmarks", label: "Bookmarks", requiresAccount: true, group: "learning" },
  { id: "practice", label: "Practice", requiresAccount: true, group: "learning" },
  { id: "glossary", label: "Glossary", requiresAccount: true, group: "learning" },
  { id: "feedback", label: "Feedback", requiresAccount: true, group: "account" },
  { id: "account", label: "Account", requiresAccount: true, group: "account" },
  { id: "pro", label: "Pro", requiresAccount: true, group: "account" },
] as const satisfies readonly WorkspaceTool[];

export function getVisibleWorkspaceTools(viewer: Viewer | null) {
  return workspaceTools.filter((tool) => !tool.requiresAccount || viewer !== null);
}
