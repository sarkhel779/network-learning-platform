import { z } from "zod";

export const switchingDeviceIdSchema = z.enum(["hub", "bridge", "switch"]);
export const comparisonDimensionIdSchema = z.enum([
  "signal-handling",
  "collision-scope",
  "bandwidth-sharing",
  "address-awareness",
  "delivery-scope",
]);
export const switchingBehaviorSchema = z.enum([
  "repeat",
  "segment",
  "filter",
  "learn",
  "forward",
  "flood",
]);
export const switchDecisionSchema = z.enum([
  "known-unicast",
  "filter",
  "unknown-unicast-flood",
  "broadcast-flood",
]);
export const macAddressSchema = z.string().regex(/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/);

const comparisonDetailSchema = z.object({
  label: z.string().min(1),
  behavior: switchingBehaviorSchema,
  explanation: z.string().min(1),
});

const comparisonDimensionsSchema = z.object({
  "signal-handling": comparisonDetailSchema,
  "collision-scope": comparisonDetailSchema,
  "bandwidth-sharing": comparisonDetailSchema,
  "address-awareness": comparisonDetailSchema,
  "delivery-scope": comparisonDetailSchema,
});

export const switchingComparisonDeviceSchema = z.object({
  id: switchingDeviceIdSchema,
  name: z.string().min(1),
  summary: z.string().min(1),
  dimensions: comparisonDimensionsSchema,
});

export const switchPortSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  eligible: z.boolean(),
});

export const forwardingEntrySchema = z.object({
  mac: macAddressSchema,
  portId: z.string().min(1),
});

const scenarioShape = z.object({
  id: z.string().min(1),
  difficulty: z.enum(["foundational", "intermediate"]),
  title: z.string().min(1),
  ports: z.array(switchPortSchema).min(2),
  initialTable: z.array(forwardingEntrySchema),
  ingressPortId: z.string().min(1),
  sourceMac: macAddressSchema,
  destinationMac: macAddressSchema,
  destinationType: z.enum(["unicast", "broadcast"]),
  eligibleEgressPortIds: z.array(z.string().min(1)),
  expectedDecision: switchDecisionSchema,
  expectedEgressPortIds: z.array(z.string().min(1)),
  expectedLearnedEntry: forwardingEntrySchema,
  explanation: z.string().min(1),
  wrongAnswerExplanations: z.object({
    "known-unicast": z.string().min(1),
    filter: z.string().min(1),
    "unknown-unicast-flood": z.string().min(1),
    "broadcast-flood": z.string().min(1),
  }),
  evidenceNotes: z.array(z.string().min(1)).min(1),
});

function sameMembers(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && new Set(left).size === left.length
    && left.every((value) => right.includes(value));
}

export const switchingScenarioSchema = scenarioShape.superRefine((scenario, context) => {
  const portIds = scenario.ports.map(({ id }) => id);
  const tableMacs = scenario.initialTable.map(({ mac }) => mac);
  const destinationEntry = scenario.initialTable.find(({ mac }) => mac === scenario.destinationMac);

  if (new Set(portIds).size !== portIds.length) {
    context.addIssue({ code: "custom", path: ["ports"], message: "Port identifiers must be unique" });
  }
  if (new Set(tableMacs).size !== tableMacs.length) {
    context.addIssue({ code: "custom", path: ["initialTable"], message: "Forwarding-table MAC addresses must be unique" });
  }
  if (!portIds.includes(scenario.ingressPortId)) {
    context.addIssue({ code: "custom", path: ["ingressPortId"], message: "Ingress port must exist" });
  }
  if (scenario.expectedLearnedEntry.mac !== scenario.sourceMac
    || scenario.expectedLearnedEntry.portId !== scenario.ingressPortId) {
    context.addIssue({ code: "custom", path: ["expectedLearnedEntry"], message: "Learned entry must map the source to ingress" });
  }

  for (const [field, references] of [
    ["eligibleEgressPortIds", scenario.eligibleEgressPortIds],
    ["expectedEgressPortIds", scenario.expectedEgressPortIds],
  ] as const) {
    if (new Set(references).size !== references.length || references.some((id) => !portIds.includes(id))) {
      context.addIssue({ code: "custom", path: [field], message: `${field} must contain unique existing ports` });
    }
  }
  if (scenario.initialTable.some(({ portId }) => !portIds.includes(portId))) {
    context.addIssue({ code: "custom", path: ["initialTable"], message: "Forwarding entries must reference existing ports" });
  }
  if (scenario.eligibleEgressPortIds.includes(scenario.ingressPortId)) {
    context.addIssue({ code: "custom", path: ["eligibleEgressPortIds"], message: "Ingress cannot be an eligible egress" });
  }
  if (scenario.expectedEgressPortIds.some((id) => !scenario.eligibleEgressPortIds.includes(id))) {
    context.addIssue({ code: "custom", path: ["expectedEgressPortIds"], message: "Expected egress must be eligible" });
  }

  if (scenario.destinationType === "broadcast") {
    if (scenario.destinationMac !== "FF:FF:FF:FF:FF:FF") {
      context.addIssue({ code: "custom", path: ["destinationMac"], message: "Broadcast frames require the Ethernet broadcast address" });
    }
    if (scenario.expectedDecision !== "broadcast-flood" || !sameMembers(scenario.expectedEgressPortIds, scenario.eligibleEgressPortIds)) {
      context.addIssue({ code: "custom", path: ["expectedDecision"], message: "Broadcast must flood every eligible port" });
    }
    return;
  }

  if (scenario.expectedDecision === "known-unicast") {
    if (!destinationEntry || destinationEntry.portId === scenario.ingressPortId
      || !sameMembers(scenario.expectedEgressPortIds, [destinationEntry.portId])) {
      context.addIssue({ code: "custom", path: ["expectedDecision"], message: "Known unicast must use a learned destination on another port" });
    }
  } else if (scenario.expectedDecision === "filter") {
    if (!destinationEntry || destinationEntry.portId !== scenario.ingressPortId || scenario.expectedEgressPortIds.length !== 0) {
      context.addIssue({ code: "custom", path: ["expectedDecision"], message: "Filtering requires the destination on ingress and no egress" });
    }
  } else if (scenario.expectedDecision === "unknown-unicast-flood") {
    if (destinationEntry || !sameMembers(scenario.expectedEgressPortIds, scenario.eligibleEgressPortIds)) {
      context.addIssue({ code: "custom", path: ["expectedDecision"], message: "Unknown unicast must flood every eligible port" });
    }
  } else {
    context.addIssue({ code: "custom", path: ["expectedDecision"], message: "Unicast cannot use the broadcast decision" });
  }
});

export const switchingCatalogSchema = z.object({
  comparison: z.array(switchingComparisonDeviceSchema).min(1),
  scenarios: z.array(switchingScenarioSchema).min(1),
}).superRefine((catalog, context) => {
  const deviceIds = catalog.comparison.map(({ id }) => id);
  const scenarioIds = catalog.scenarios.map(({ id }) => id);
  if (new Set(deviceIds).size !== deviceIds.length) {
    context.addIssue({ code: "custom", path: ["comparison"], message: "Comparison device identifiers must be unique" });
  }
  if (new Set(scenarioIds).size !== scenarioIds.length) {
    context.addIssue({ code: "custom", path: ["scenarios"], message: "Scenario identifiers must be unique" });
  }
});

export type SwitchingDeviceId = z.infer<typeof switchingDeviceIdSchema>;
export type ComparisonDimensionId = z.infer<typeof comparisonDimensionIdSchema>;
export type SwitchingBehavior = z.infer<typeof switchingBehaviorSchema>;
export type SwitchDecision = z.infer<typeof switchDecisionSchema>;
export type MacAddress = z.infer<typeof macAddressSchema>;
export type SwitchPort = z.infer<typeof switchPortSchema>;
export type ForwardingEntry = z.infer<typeof forwardingEntrySchema>;
export type SwitchingScenario = z.infer<typeof switchingScenarioSchema>;
export type SwitchingComparisonDevice = z.infer<typeof switchingComparisonDeviceSchema>;
export type SwitchingCatalog = z.infer<typeof switchingCatalogSchema>;
export type SwitchingCatalogInput = z.input<typeof switchingCatalogSchema>;
export type LearnerPrediction = Readonly<{
  decision: SwitchDecision;
  egressPortIds: readonly string[];
}>;

export function parseSwitchingCatalog(input: unknown): SwitchingCatalog {
  return switchingCatalogSchema.parse(input);
}

export function safeParseSwitchingCatalog(input: unknown) {
  return switchingCatalogSchema.safeParse(input);
}
