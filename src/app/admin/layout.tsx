import type { ReactNode } from "react";

import { requireStaff } from "@/features/admin/admin-access";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireStaff("overview");
  return <div className="admin-shell">{children}</div>;
}
