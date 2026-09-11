import { z } from "zod";

const id = z.string().trim().min(1);
const positiveMinutes = z.number().int().positive();

const topologyNodeSchema = z.object({
  id,
  label: z.string().trim().min(1),
  kind: z.enum(["client", "switch", "router", "firewall", "resolver", "server"]),
}).strict();

const topologyLinkSchema = z.object({
  id,
  from: id,
  to: id,
  fromInterface: z.string().trim().min(1),
  toInterface: z.string().trim().min(1),
}).strict();

const faultSchema = z.object({
  id,
  title: z.string().trim().min(1),
  explanation: z.string().trim().min(1),
  unlocksFaultId: id.optional(),
}).strict();

const hypothesisSchema = z.object({
  id,
  label: z.string().trim().min(1),
  faultId: id,
  valid: z.boolean(),
  predictions: z.array(z.object({
    id,
    label: z.string().trim().min(1),
    supportingTestIds: z.array(id),
  }).strict()).min(1),
}).strict();

const evidenceSchema = z.object({
  kind: z.enum(["cli", "table", "log", "capture", "observation"]),
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
}).strict();

const troubleshootingTestSchema = z.object({
  id,
  label: z.string().trim().min(1),
  command: z.string().trim().min(1).optional(),
  risk: z.enum(["read-only", "reversible"]),
  timeCost: positiveMinutes,
  expectedFaultId: id.optional(),
  phase: z.enum(["diagnostic", "restoration"]).default("diagnostic"),
  evidence: evidenceSchema,
  restoredEvidence: evidenceSchema.optional(),
}).strict();

const remediationSchema = z.object({
  id,
  label: z.string().trim().min(1),
  faultId: id,
  requiresTestIds: z.array(id).min(1),
  timeCost: positiveMinutes,
}).strict();

const restorationCheckSchema = z.object({
  id,
  label: z.string().trim().min(1),
  testId: id,
}).strict();

function duplicates(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

export const troubleshootingScenarioSchema = z.object({
  id,
  title: z.string().trim().min(1),
  topology: z.object({ nodes: z.array(topologyNodeSchema).min(2), links: z.array(topologyLinkSchema).min(1) }).strict(),
  faults: z.array(faultSchema).min(1),
  hypotheses: z.array(hypothesisSchema).min(1),
  tests: z.array(troubleshootingTestSchema).min(1),
  remediations: z.array(remediationSchema).min(1),
  restorationChecks: z.array(restorationCheckSchema).min(1),
}).strict().superRefine((scenario, context) => {
  const collections = [scenario.topology.nodes, scenario.topology.links, scenario.faults, scenario.hypotheses, scenario.tests, scenario.remediations, scenario.restorationChecks];
  if (collections.some((items) => duplicates(items.map(({ id: itemId }) => itemId)))) {
    context.addIssue({ code: "custom", message: "Duplicate IDs are not allowed." });
  }

  const nodeIds = new Set(scenario.topology.nodes.map((node) => node.id));
  if (scenario.topology.links.some((link) => !nodeIds.has(link.from) || !nodeIds.has(link.to))) {
    context.addIssue({ code: "custom", message: "Unknown node reference in topology link." });
  }

  const faultIds = new Set(scenario.faults.map((fault) => fault.id));
  const testIds = new Set(scenario.tests.map((test) => test.id));
  if (scenario.faults.some((fault) => fault.unlocksFaultId && !faultIds.has(fault.unlocksFaultId)) || scenario.hypotheses.some((hypothesis) => !faultIds.has(hypothesis.faultId)) || scenario.tests.some((test) => test.expectedFaultId && !faultIds.has(test.expectedFaultId)) || scenario.remediations.some((remediation) => !faultIds.has(remediation.faultId))) {
    context.addIssue({ code: "custom", message: "Unknown fault reference." });
  }
  if (scenario.remediations.some((remediation) => remediation.requiresTestIds.some((testId) => !testIds.has(testId))) || scenario.restorationChecks.some((check) => !testIds.has(check.testId))) {
    context.addIssue({ code: "custom", message: "Unknown test reference." });
  }
  if (scenario.hypotheses.some((hypothesis) => hypothesis.predictions.some((prediction) => prediction.supportingTestIds.some((testId) => !testIds.has(testId))))) {
    context.addIssue({ code: "custom", message: "Unknown prediction test reference." });
  }

  const nextByFault = new Map(scenario.faults.map((fault) => [fault.id, fault.unlocksFaultId]));
  for (const fault of scenario.faults) {
    const visited = new Set<string>();
    let current: string | undefined = fault.id;
    while (current) {
      if (visited.has(current)) {
        context.addIssue({ code: "custom", message: "Fault unlock cycle detected." });
        break;
      }
      visited.add(current);
      current = nextByFault.get(current);
    }
  }
});

export type TroubleshootingScenarioInput = z.input<typeof troubleshootingScenarioSchema>;
export type TroubleshootingScenario = z.infer<typeof troubleshootingScenarioSchema>;
export type TroubleshootingFault = TroubleshootingScenario["faults"][number];
export type TroubleshootingTest = TroubleshootingScenario["tests"][number];
export type RestorationCheck = TroubleshootingScenario["restorationChecks"][number];
