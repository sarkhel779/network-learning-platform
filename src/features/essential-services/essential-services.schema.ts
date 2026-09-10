import { z } from "zod";

const serviceIdSchema = z.enum(["web", "remote-access", "email", "file-transfer", "time", "monitoring"]);
const portSchema = z.number().int().min(1).max(65_535);
const messageFieldSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  explanation: z.string().min(1),
});
const serviceMessageSchema = z.object({
  name: z.string().min(1),
  fields: z.array(messageFieldSchema).min(1),
});
const serviceStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sender: z.string().min(1),
  receiver: z.string().min(1),
  transport: z.enum(["TCP", "UDP"]),
  sourcePort: portSchema,
  destinationPort: portSchema,
  message: serviceMessageSchema,
  explanation: z.string().min(1),
  evidence: z.string().min(1),
  terminal: z.boolean(),
});

const serviceScenarioSchema = z.object({
  id: z.string().min(1),
  service: serviceIdSchema,
  title: z.string().min(1),
  steps: z.array(serviceStepSchema).min(1),
  conclusion: z.string().min(1),
}).superRefine((scenario, context) => {
  const stepIds = scenario.steps.map(({ id }) => id);
  if (new Set(stepIds).size !== stepIds.length) {
    context.addIssue({ code: "custom", path: ["steps"], message: "Service step ids must be unique." });
  }
  if (scenario.steps.filter(({ terminal }) => terminal).length !== 1) {
    context.addIssue({ code: "custom", path: ["steps"], message: "A service journey requires exactly one terminal step." });
  }
});

const exerciseIdentityShape = {
  id: z.string().min(1),
  service: serviceIdSchema,
};

function validateCorrectIndex(
  exercise: { options: readonly string[]; correctIndex: number },
  context: z.RefinementCtx,
) {
  if (exercise.correctIndex >= exercise.options.length) {
    context.addIssue({ code: "custom", path: ["correctIndex"], message: "Correct answer index must identify an option." });
  }
}

const troubleshootingCaseSchema = z.object({
  ...exerciseIdentityShape,
  prompt: z.string().min(1),
  evidence: z.string().min(1),
  choices: z.array(z.string().min(1)).min(2),
  correctIndex: z.number().int().nonnegative(),
  diagnosis: z.string().min(1),
  explanation: z.string().min(1),
  simplifiedExplanation: z.string().min(1),
  nextStep: z.string().min(1),
}).superRefine((caseStudy, context) => {
  if (caseStudy.correctIndex >= caseStudy.choices.length) {
    context.addIssue({ code: "custom", path: ["correctIndex"], message: "Correct answer index must identify a choice." });
  }
});

const captureRowSchema = z.object({
  number: z.number().int().positive(),
  relativeTime: z.string().min(1),
  source: z.string().min(1),
  destination: z.string().min(1),
  protocol: z.string().min(1),
  length: z.number().int().positive(),
  summary: z.string().min(1),
});

const captureExerciseSchema = z.object({
  ...exerciseIdentityShape,
  title: z.string().min(1),
  displayFilter: z.string().min(1),
  conversation: z.string().min(1),
  rows: z.array(captureRowSchema).min(1),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correctIndex: z.number().int().nonnegative(),
  evidence: z.string().min(1),
  explanation: z.string().min(1),
}).superRefine(validateCorrectIndex);

const rfcExerciseSchema = z.object({
  ...exerciseIdentityShape,
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correctIndex: z.number().int().nonnegative(),
  rule: z.string().min(1),
  evidence: z.string().min(1),
  consequence: z.string().min(1),
  referenceLabel: z.string().regex(/^RFC \d+$/),
  referenceUrl: z.string().url().startsWith("https://www.rfc-editor.org/"),
}).superRefine(validateCorrectIndex);

export type ServiceId = z.infer<typeof serviceIdSchema>;
export type ServiceMessage = z.infer<typeof serviceMessageSchema>;
export type ServiceStep = z.infer<typeof serviceStepSchema>;
export type ServiceScenario = z.infer<typeof serviceScenarioSchema>;
export type TroubleshootingCase = z.infer<typeof troubleshootingCaseSchema>;
export type CaptureExercise = z.infer<typeof captureExerciseSchema>;
export type RfcExercise = z.infer<typeof rfcExerciseSchema>;

export function parseServiceScenario(input: unknown): ServiceScenario {
  return serviceScenarioSchema.parse(input);
}

export function parseTroubleshootingCase(input: unknown): TroubleshootingCase {
  return troubleshootingCaseSchema.parse(input);
}

export function parseCaptureExercise(input: unknown): CaptureExercise {
  return captureExerciseSchema.parse(input);
}

export function parseRfcExercise(input: unknown): RfcExercise {
  return rfcExerciseSchema.parse(input);
}
