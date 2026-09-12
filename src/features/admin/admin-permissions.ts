import type { AdminPermission, StaffRole } from "./admin.types";

const permissions: Record<StaffRole, readonly AdminPermission[]> = {
  super_admin: ["overview", "users_read", "users_write", "courses", "billing", "support", "roles", "audit", "settings"],
  content_editor: ["overview", "courses"],
  support_agent: ["overview", "users_read", "users_write", "support", "audit"],
  finance: ["overview", "billing"],
};

export function canStaff(role: StaffRole, permission: AdminPermission): boolean {
  return permissions[role].includes(permission);
}
