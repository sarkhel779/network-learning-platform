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
