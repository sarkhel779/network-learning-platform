"use server";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/features/admin/admin-access";
import { parseSupportTicketReply, parseSupportTicketStatusChange } from "@/features/admin/admin-input.schema";
import { replySupportTicket, setSupportTicketStatus } from "@/features/admin/admin.repository";

export async function replySupportTicketAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireStaff("support");
  const ticketId = formData.get("ticketId");
  const body = formData.get("body");
  if (typeof body !== "string") {
    return { ok: false, message: "Invalid reply." };
  }

  let input;
  try {
    input = parseSupportTicketReply({ ticketId, body });
  } catch {
    return { ok: false, message: "Enter a reply." };
  }

  try {
    await replySupportTicket(input.ticketId, input.body);
    revalidatePath(`/admin/support/${input.ticketId}`);
    revalidatePath("/admin/support");
    return { ok: true, message: "Reply sent." };
  } catch {
    return { ok: false, message: "Reply could not be sent." };
  }
}

export async function setSupportTicketStatusAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireStaff("support");
  const ticketId = formData.get("ticketId");
  const status = formData.get("status");
  if (typeof status !== "string") {
    return { ok: false, message: "Invalid status." };
  }

  let input;
  try {
    input = parseSupportTicketStatusChange({ ticketId, status });
  } catch {
    return { ok: false, message: "Enter a valid ticket status." };
  }

  try {
    await setSupportTicketStatus(input.ticketId, input.status);
    revalidatePath(`/admin/support/${input.ticketId}`);
    revalidatePath("/admin/support");
    return { ok: true, message: "Status updated." };
  } catch {
    return { ok: false, message: "Status could not be updated." };
  }
}
