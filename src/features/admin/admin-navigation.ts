import type { AdminIconName } from "./admin-icons";
import { canStaff } from "./admin-permissions";
import type { AdminPermission, StaffRole } from "./admin.types";

export type AdminNavItem = { label: string; href: string; permission: AdminPermission; group: "GENERAL" | "SYSTEM"; icon: AdminIconName };

const items: AdminNavItem[] = [
  { label: "Overview", href: "/admin", permission: "overview", group: "GENERAL", icon: "overview" },
  { label: "Users", href: "/admin/users", permission: "users_read", group: "GENERAL", icon: "users" },
  { label: "Pro waitlist", href: "/admin/waitlist", permission: "users_read", group: "GENERAL", icon: "waitlist" },
  { label: "Courses and labs", href: "/admin/courses", permission: "courses", group: "GENERAL", icon: "courses" },
  { label: "Billing", href: "/admin/billing", permission: "billing", group: "GENERAL", icon: "billing" },
  { label: "Support", href: "/admin/support", permission: "support", group: "GENERAL", icon: "support" },
  { label: "Roles", href: "/admin/roles", permission: "roles", group: "SYSTEM", icon: "roles" },
  { label: "Audit log", href: "/admin/audit", permission: "audit", group: "SYSTEM", icon: "audit" },
  { label: "Settings", href: "/admin/settings", permission: "settings", group: "SYSTEM", icon: "settings" },
];

export function navigationForRole(role: StaffRole): AdminNavItem[] {
  return items.filter((item) => canStaff(role, item.permission));
}
