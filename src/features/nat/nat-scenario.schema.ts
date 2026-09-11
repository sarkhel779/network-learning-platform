import { z } from "zod";

const portSchema = z.number().int().min(0).max(65535);

export const natTupleSchema = z.object({
  protocol: z.enum(["tcp", "udp", "icmp"]),
  sourceIp: z.string().min(1),
  sourcePort: portSchema.optional(),
  destinationIp: z.string().min(1),
  destinationPort: portSchema.optional(),
}).strict();

export const natTranslationSchema = z.object({
  kind: z.enum(["snat", "dnat", "pat", "reverse"]),
  field: z.enum(["sourceIp", "sourcePort", "destinationIp", "destinationPort"]),
  before: z.union([z.string().min(1), portSchema]),
  after: z.union([z.string().min(1), portSchema]),
}).strict();

export const natTableEntrySchema = z.object({
  id: z.string().min(1),
  protocol: z.enum(["tcp", "udp", "icmp"]),
  insideLocal: z.string().min(1),
  insideGlobal: z.string().min(1),
  outsideGlobal: z.string().min(1),
  state: z.enum(["created", "active", "expired"]).default("active"),
}).strict();

const natTableMutationSchema = z.object({
  action: z.enum(["add", "update", "remove"]),
  entry: natTableEntrySchema,
}).strict();

export const natStepSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  tuple: natTupleSchema,
  translations: z.array(natTranslationSchema),
  tableMutations: z.array(natTableMutationSchema),
  tableEntries: z.array(natTableEntrySchema).default([]),
  activeEntryId: z.string().min(1).optional(),
  explanation: z.string().trim().min(1),
}).strict();

export const natScenarioSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  mode: z.enum(["static", "dynamic", "pat", "hairpin-failure", "hairpin-success"]),
  outcome: z.enum(["success", "failure"]).optional(),
  steps: z.array(natStepSchema).min(1),
}).strict().superRefine((scenario, context) => {
  const stepIds = scenario.steps.map((step) => step.id);
  if (new Set(stepIds).size !== stepIds.length) {
    context.addIssue({ code: "custom", path: ["steps"], message: "Scenario step IDs must be unique." });
  }

  if (scenario.mode === "hairpin-success" && scenario.outcome === "success") {
    const kinds = scenario.steps.flatMap((step) => step.translations.map((translation) => translation.kind));
    if (!kinds.includes("dnat") || !kinds.includes("snat")) {
      context.addIssue({ code: "custom", path: ["steps"], message: "Successful hairpin journeys require both DNAT and SNAT." });
    }
  }
});

export type NatTuple = z.infer<typeof natTupleSchema>;
export type NatTranslation = z.infer<typeof natTranslationSchema>;
export type NatTableEntry = z.infer<typeof natTableEntrySchema>;
export type NatStep = z.infer<typeof natStepSchema>;
export type NatScenario = z.infer<typeof natScenarioSchema>;
