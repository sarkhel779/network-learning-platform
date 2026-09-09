export type Viewer = Readonly<{
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}>;

export type WorkspaceToolId =
  | "course"
  | "learning"
  | "notes"
  | "bookmarks"
  | "practice"
  | "glossary"
  | "feedback"
  | "account"
  | "pro";

export type WorkspaceTool = Readonly<{
  id: WorkspaceToolId;
  label: string;
  requiresAccount: boolean;
  group: "learning" | "account";
}>;
