"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff } from "@/features/admin/admin-access";
import { assignStaffRole, revokeStaffRole } from "@/features/admin/admin.repository";
import { parseStaffAssignment } from "@/features/admin/admin-input.schema";

export async function assignStaffRoleAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireStaff("roles");
  const email = formData.get("email");
  const role = formData.get("role");
  if (typeof email !== "string" || typeof role !== "string") {
    return { ok: false, message: "Invalid role assignment." };
  }
  let assignment;
  try {
    assignment = parseStaffAssignment({ email, role });
  } catch {
    return { ok: false, message: "Enter a valid email and role." };
  }
  try {
    await assignStaffRole(assignment.email, assignment.role);
    revalidatePath("/admin/roles");
    return { ok: true, message: `${assignment.email} now has the ${assignment.role.replace("_", " ")} role.` };
  } catch (error) {
    if (error instanceof Error && error.message === "staff_account_not_found") {
      return { ok: false, message: "No account exists with that email yet. They need to sign up first." };
    }
    return { ok: false, message: "Staff role could not be assigned." };
  }
}

export async function revokeStaffRoleAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireStaff("roles");
  const userId = formData.get("userId");
  const parsedId = z.uuid().safeParse(userId);
  if (!parsedId.success) {
    return { ok: false, message: "Invalid staff account." };
  }
  try {
    await revokeStaffRole(parsedId.data);
    revalidatePath("/admin/roles");
    return { ok: true, message: "Staff access revoked." };
  } catch (error) {
    if (error instanceof Error && error.message === "cannot_revoke_self") {
      return { ok: false, message: "You cannot revoke your own access." };
    }
    return { ok: false, message: "Staff role could not be revoked." };
  }
}
