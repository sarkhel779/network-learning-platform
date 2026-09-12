import "server-only";

import { notFound, redirect } from "next/navigation";

import type { Viewer } from "@/features/learner-workspace/learner-workspace.types";
import { getViewer } from "@/lib/supabase/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { AdminPermission, StaffRole } from "./admin.types";

const permissions: Record<StaffRole, readonly AdminPermission[]> = {
  super_admin: ["overview", "users_read", "users_write", "courses", "billing", "support", "roles", "audit", "settings"],
  content_editor: ["overview", "courses"],
  support_agent: ["overview", "users_read", "users_write", "support", "audit"],
  finance: ["overview", "billing"],
};

function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === "string" && Object.hasOwn(permissions, value);
}

export function canStaff(role: StaffRole, permission: AdminPermission): boolean {
  return permissions[role].includes(permission);
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
