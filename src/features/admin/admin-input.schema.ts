import { z } from "zod";

export const learnerEditSchema = z.object({
  displayName: z.string().trim().max(80).nullable(),
  learningLevel: z.enum(["beginner", "graduate", "it_experienced", "networking_professional", "career_switcher"]).nullable(),
  note: z.string().trim().max(1000).optional(),
}).strict();

export type LearnerEdit = z.infer<typeof learnerEditSchema>;

export function parseLearnerEdit(value: unknown): LearnerEdit {
  return learnerEditSchema.parse(value);
}

export const staffAssignmentSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  role: z.enum(["super_admin", "content_editor", "support_agent", "finance"]),
}).strict();

export type StaffAssignment = z.infer<typeof staffAssignmentSchema>;

export function parseStaffAssignment(value: unknown): StaffAssignment {
  return staffAssignmentSchema.parse(value);
}

const lessonIdSchema = z.string().trim().regex(/^lesson_[a-z0-9_]+$/);
const moduleIdSchema = z.string().trim().regex(/^module_[a-z0-9_]+$/);

export const lessonPublicationSchema = z.object({
  lessonId: lessonIdSchema,
  published: z.enum(["true", "false"]).transform((value) => value === "true"),
}).strict();

export type LessonPublicationInput = z.infer<typeof lessonPublicationSchema>;

export function parseLessonPublication(value: unknown): LessonPublicationInput {
  return lessonPublicationSchema.parse(value);
}

export const lessonMoveSchema = z.object({
  moduleId: moduleIdSchema,
  lessonId: lessonIdSchema,
  direction: z.enum(["up", "down"]),
}).strict();

export type LessonMoveInput = z.infer<typeof lessonMoveSchema>;

export function parseLessonMove(value: unknown): LessonMoveInput {
  return lessonMoveSchema.parse(value);
}

const ticketIdSchema = z.coerce.number().int().positive();

export const supportTicketReplySchema = z.object({
  ticketId: ticketIdSchema,
  body: z.string().trim().min(1).max(4000),
}).strict();

export type SupportTicketReplyInput = z.infer<typeof supportTicketReplySchema>;

export function parseSupportTicketReply(value: unknown): SupportTicketReplyInput {
  return supportTicketReplySchema.parse(value);
}

export const supportTicketStatusSchema = z.object({
  ticketId: ticketIdSchema,
  status: z.enum(["open", "in_progress", "resolved"]),
}).strict();

export type SupportTicketStatusInput = z.infer<typeof supportTicketStatusSchema>;

export function parseSupportTicketStatusChange(value: unknown): SupportTicketStatusInput {
  return supportTicketStatusSchema.parse(value);
}

const planIdSchema = z.string().trim().regex(/^[a-z0-9_]+$/);

export const billingGrantSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  planId: planIdSchema,
}).strict();

export type BillingGrantInput = z.infer<typeof billingGrantSchema>;

export function parseBillingGrant(value: unknown): BillingGrantInput {
  return billingGrantSchema.parse(value);
}

export const billingRevokeSchema = z.object({
  subscriptionId: z.coerce.number().int().positive(),
}).strict();

export type BillingRevokeInput = z.infer<typeof billingRevokeSchema>;

export function parseBillingRevoke(value: unknown): BillingRevokeInput {
  return billingRevokeSchema.parse(value);
}

const featureFlagKeySchema = z.string().trim().toLowerCase().regex(/^[a-z][a-z0-9_]{1,49}$/);

export const featureFlagUpsertSchema = z.object({
  key: featureFlagKeySchema,
  enabled: z.enum(["true", "false"]).transform((value) => value === "true"),
  description: z.string().trim().max(200),
}).strict();

export type FeatureFlagUpsertInput = z.infer<typeof featureFlagUpsertSchema>;

export function parseFeatureFlagUpsert(value: unknown): FeatureFlagUpsertInput {
  return featureFlagUpsertSchema.parse(value);
}

export const featureFlagDeleteSchema = z.object({
  key: featureFlagKeySchema,
}).strict();

export type FeatureFlagDeleteInput = z.infer<typeof featureFlagDeleteSchema>;

export function parseFeatureFlagDelete(value: unknown): FeatureFlagDeleteInput {
  return featureFlagDeleteSchema.parse(value);
}
