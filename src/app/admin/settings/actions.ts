"use server";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/features/admin/admin-access";
import { parseFeatureFlagDelete, parseFeatureFlagUpsert } from "@/features/admin/admin-input.schema";
import { deleteFeatureFlag, upsertFeatureFlag } from "@/features/admin/admin.repository";

export async function upsertFeatureFlagAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireStaff("settings");
  const key = formData.get("key");
  const enabled = formData.get("enabled");
  const description = formData.get("description");
  if (typeof key !== "string" || typeof enabled !== "string" || typeof description !== "string") {
    return { ok: false, message: "Invalid feature flag request." };
  }

  let input;
  try {
    input = parseFeatureFlagUpsert({ key, enabled, description });
  } catch {
    return { ok: false, message: "Enter a valid flag key (lowercase letters, numbers, underscores)." };
  }

  try {
    await upsertFeatureFlag(input.key, input.enabled, input.description || null);
    revalidatePath("/admin/settings");
    return { ok: true, message: `Feature flag "${input.key}" saved.` };
  } catch {
    return { ok: false, message: "Feature flag could not be saved." };
  }
}

export async function deleteFeatureFlagAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireStaff("settings");
  const key = formData.get("key");

  let input;
  try {
    input = parseFeatureFlagDelete({ key });
  } catch {
    return { ok: false, message: "Invalid feature flag." };
  }

  try {
    await deleteFeatureFlag(input.key);
    revalidatePath("/admin/settings");
    return { ok: true, message: `Feature flag "${input.key}" deleted.` };
  } catch {
    return { ok: false, message: "Feature flag could not be deleted." };
  }
}
