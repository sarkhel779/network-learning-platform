import { z } from "zod";

export const supportTicketCreateSchema = z.object({
  subject: z.string().trim().min(1).max(150),
  body: z.string().trim().min(1).max(4000),
}).strict();

export type SupportTicketCreateInput = z.infer<typeof supportTicketCreateSchema>;

export function parseSupportTicketCreate(value: unknown): SupportTicketCreateInput {
  return supportTicketCreateSchema.parse(value);
}

export const supportTicketMessageSchema = z.object({
  body: z.string().trim().min(1).max(4000),
}).strict();

export type SupportTicketMessageInput = z.infer<typeof supportTicketMessageSchema>;

export function parseSupportTicketMessage(value: unknown): SupportTicketMessageInput {
  return supportTicketMessageSchema.parse(value);
}
