import { canStaff } from "./admin-permissions";
import type { AdminPermission, StaffRole } from "./admin.types";

export type AdminNavItem = { label: string; href: string; permission: AdminPermission; group: "GENERAL" | "SYSTEM" };

const items: AdminNavItem[] = [
  { label: "Overview", href: "/admin", permission: "overview", group: "GENERAL" },
  { label: "Users", href: "/admin/users", permission: "users_read", group: "GENERAL" },
  { label: "Courses and labs", href: "/admin/courses", permission: "courses", group: "GENERAL" },
  { label: "Billing", href: "/admin/billing", permission: "billing", group: "GENERAL" },
  { label: "Support", href: "/admin/support", permission: "support", group: "GENERAL" },
  { label: "Roles", href: "/admin/roles", permission: "roles", group: "SYSTEM" },
  { label: "Audit log", href: "/admin/audit", permission: "audit", group: "SYSTEM" },
  { label: "Settings", href: "/admin/settings", permission: "settings", group: "SYSTEM" },
];

export function navigationForRole(role: StaffRole): AdminNavItem[] {
  return items.filter((item) => canStaff(role, item.permission));
}
