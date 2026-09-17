"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { parseSupportTicketCreate, parseSupportTicketMessage } from "@/features/support/support-input.schema";
import { addSupportTicketMessage, createSupportTicket } from "@/features/support/support.repository";
import { getViewer } from "@/lib/supabase/session";

export async function createSupportTicketAction(formData: FormData): Promise<{ ok: boolean; message: string; ticketId?: number }> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, message: "Sign in to contact support." };

  const subject = formData.get("subject");
  const body = formData.get("body");
  if (typeof subject !== "string" || typeof body !== "string") {
    return { ok: false, message: "Enter a subject and a message." };
  }

  let input;
  try {
    input = parseSupportTicketCreate({ subject, body });
  } catch {
    return { ok: false, message: "Enter a subject and a message." };
  }

  try {
    const ticket = await createSupportTicket(input.subject, input.body);
    revalidatePath("/support");
    return { ok: true, message: "Your ticket has been submitted.", ticketId: ticket.id };
  } catch {
    return { ok: false, message: "Your ticket could not be submitted. Please try again." };
  }
}

export async function addSupportTicketMessageAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, message: "Sign in to reply." };

  const ticketId = formData.get("ticketId");
  const body = formData.get("body");
  const parsedId = z.coerce.number().int().positive().safeParse(ticketId);
  if (!parsedId.success || typeof body !== "string") {
    return { ok: false, message: "Invalid reply." };
  }

  let input;
  try {
    input = parseSupportTicketMessage({ body });
  } catch {
    return { ok: false, message: "Enter a message." };
  }

  try {
    await addSupportTicketMessage(parsedId.data, input.body);
    revalidatePath(`/support/${parsedId.data}`);
    return { ok: true, message: "Reply sent." };
  } catch {
    return { ok: false, message: "Your reply could not be sent." };
  }
}
