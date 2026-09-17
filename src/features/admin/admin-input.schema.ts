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
