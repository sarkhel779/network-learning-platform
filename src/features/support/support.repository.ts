import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { SupportTicketDetail, SupportTicketSummary } from "./support.types";

export async function createSupportTicket(subject: string, body: string): Promise<{ id: number }> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("create_support_ticket", { p_subject: subject, p_body: body });
  if (error || !data) throw new Error("Support ticket could not be created");
  return data as { id: number };
}

export async function listMySupportTickets(): Promise<SupportTicketSummary[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("list_my_support_tickets");
  if (error || !Array.isArray(data)) throw new Error("Support tickets unavailable");
  return data as SupportTicketSummary[];
}

export async function getMySupportTicket(ticketId: number): Promise<SupportTicketDetail | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_my_support_ticket", { p_ticket_id: ticketId });
  if (error) {
    if (error.message === "ticket_not_found") return null;
    throw new Error("Support ticket unavailable");
  }
  return data as SupportTicketDetail;
}

export async function addSupportTicketMessage(ticketId: number, body: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("add_support_ticket_message", { p_ticket_id: ticketId, p_body: body });
  if (error) throw new Error(error.message === "ticket_not_found" ? "ticket_not_found" : "Reply could not be sent");
}
