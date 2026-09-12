"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff } from "@/features/admin/admin-access";
import { parseLearnerEdit } from "@/features/admin/admin-input.schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function saveLearnerEdit(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireStaff("users_write");
  const targetId = formData.get("targetId");
  const parsedId = z.uuid().safeParse(targetId);
  const displayName = formData.get("displayName");
  const learningLevel = formData.get("learningLevel");
  const note = formData.get("note");
  if (!parsedId.success || typeof displayName !== "string" || typeof learningLevel !== "string" || typeof note !== "string") {
    return { ok: false, message: "Invalid account details." };
  }
  let edit;
  try {
    edit = parseLearnerEdit({
      displayName: displayName || null,
      learningLevel: learningLevel || null,
      note,
    });
  } catch {
    return { ok: false, message: "Invalid account details." };
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.rpc("admin_update_learner", {
      p_target_id: parsedId.data,
      p_display_name: edit.displayName,
      p_learning_level: edit.learningLevel,
      p_note: edit.note || null,
    });
    if (error) return { ok: false, message: "Account changes could not be saved." };
    revalidatePath(`/admin/users/${parsedId.data}`);
    revalidatePath("/admin/users");
    return { ok: true, message: "Account changes saved and audited." };
  } catch {
    return { ok: false, message: "Account changes could not be saved." };
  }
}
