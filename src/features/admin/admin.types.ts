export type StaffRole = "super_admin" | "content_editor" | "support_agent" | "finance";

export type AdminPermission =
  | "overview"
  | "users_read"
  | "users_write"
  | "courses"
  | "billing"
  | "support"
  | "roles"
  | "audit"
  | "settings";
