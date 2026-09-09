import { z } from "zod";

const stableId = z.string().trim().min(1).regex(/^[a-z0-9_]+$/);
const anchor = z.string().trim().min(1).regex(/^[a-z0-9-]+$/);
const metadata = z.record(z.string(), z.unknown()).default({}).superRefine((value, context) => {
  const serialized = JSON.stringify(value);
  if (serialized.length > 4096) context.addIssue({ code: "custom", message: "Metadata is too large." });
  const containsExternalUrl = (candidate: unknown): boolean => {
    if (typeof candidate === "string") return /^https?:\/\//i.test(candidate);
    if (Array.isArray(candidate)) return candidate.some(containsExternalUrl);
    return candidate !== null && typeof candidate === "object"
      && Object.values(candidate).some(containsExternalUrl);
  };
  if (containsExternalUrl(value)) context.addIssue({ code: "custom", message: "External URLs are not allowed." });
});

const base = z.object({
  pathwayId: stableId,
  lessonId: stableId,
  contentVersion: z.number().int().positive(),
  idempotencyKey: z.string().uuid(),
  itemId: stableId,
  anchor,
  metadata,
}).strict();

const progressMutationInputSchema = z.discriminatedUnion("eventType", [
  base.extend({ eventType: z.literal("section_completed"), itemKind: z.literal("section"), answerCorrect: z.never().optional() }),
  base.extend({ eventType: z.literal("interactive_completed"), itemKind: z.literal("interactive"), answerCorrect: z.never().optional() }),
  base.extend({ eventType: z.literal("knowledge_check_attempted"), itemKind: z.literal("knowledge_check"), answerCorrect: z.boolean() }),
]);

export const restartProgressInputSchema = z.object({
  pathwayId: stableId,
  lessonId: stableId,
  contentVersion: z.number().int().positive(),
  idempotencyKey: z.string().uuid(),
}).strict();

export type ProgressMutationInput = z.infer<typeof progressMutationInputSchema>;
export type RestartProgressInput = z.infer<typeof restartProgressInputSchema>;

export function parseProgressMutationInput(input: unknown): ProgressMutationInput {
  return progressMutationInputSchema.parse(input);
}

export function parseRestartProgressInput(input: unknown): RestartProgressInput {
  return restartProgressInputSchema.parse(input);
}
