"use server";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/features/admin/admin-access";
import { parseBillingGrant, parseBillingRevoke } from "@/features/admin/admin-input.schema";
import { grantSubscription, revokeSubscription } from "@/features/admin/admin.repository";

export async function grantSubscriptionAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireStaff("billing");
  const email = formData.get("email");
  const planId = formData.get("planId");
  if (typeof email !== "string" || typeof planId !== "string") {
    return { ok: false, message: "Invalid grant request." };
  }

  let input;
  try {
    input = parseBillingGrant({ email, planId });
  } catch {
    return { ok: false, message: "Enter a valid email and plan." };
  }

  try {
    await grantSubscription(input.email, input.planId);
    revalidatePath("/admin/billing");
    return { ok: true, message: `${input.email} now has ${input.planId.replace("_", " ")} access.` };
  } catch (error) {
    if (error instanceof Error && error.message === "learner_account_not_found") {
      return { ok: false, message: "No account exists with that email yet. They need to sign up first." };
    }
    return { ok: false, message: "Subscription could not be granted." };
  }
}

export async function revokeSubscriptionAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireStaff("billing");
  const subscriptionId = formData.get("subscriptionId");

  let input;
  try {
    input = parseBillingRevoke({ subscriptionId });
  } catch {
    return { ok: false, message: "Invalid subscription." };
  }

  try {
    await revokeSubscription(input.subscriptionId);
    revalidatePath("/admin/billing");
    return { ok: true, message: "Pro access revoked." };
  } catch {
    return { ok: false, message: "Subscription could not be revoked." };
  }
}
