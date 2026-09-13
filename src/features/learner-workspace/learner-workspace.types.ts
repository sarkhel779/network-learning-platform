export type Viewer = Readonly<{
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}>;

export type WorkspaceToolId =
  | "course"
  | "learning";

export type WorkspaceTool = Readonly<{
  id: WorkspaceToolId;
  label: string;
  requiresAccount: boolean;
  group: "learning" | "account";
}>;
