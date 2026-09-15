import "server-only";

import { notFound, redirect } from "next/navigation";

import type { Viewer } from "@/features/learner-workspace/learner-workspace.types";
import { getViewer } from "@/lib/supabase/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { AdminPermission, StaffRole } from "./admin.types";
import { canStaff } from "./admin-permissions";

export { canStaff } from "./admin-permissions";

const staffRoles = ["super_admin", "content_editor", "support_agent", "finance"] as const;

function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === "string" && staffRoles.some((role) => role === value);
}

export async function getStaffRole(): Promise<StaffRole | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("admin_staff_role");
    if (error || !isStaffRole(data)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function requireStaff(permission: AdminPermission): Promise<{ viewer: Viewer; role: StaffRole }> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?returnTo=%2Fadmin");
  const role = await getStaffRole();
  if (!role || !canStaff(role, permission)) notFound();
  return { viewer, role };
}
