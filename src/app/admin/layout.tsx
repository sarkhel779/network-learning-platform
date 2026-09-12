import type { ReactNode } from "react";

import { requireStaff } from "@/features/admin/admin-access";
import { navigationForRole } from "@/features/admin/admin-navigation";
import { AdminShell } from "@/features/admin/admin-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { role } = await requireStaff("overview");
  return <AdminShell items={navigationForRole(role)}>{children}</AdminShell>;
}
