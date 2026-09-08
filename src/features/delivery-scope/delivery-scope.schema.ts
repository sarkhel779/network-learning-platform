import { z } from "zod";

const id = z.string().trim().min(1);
const unique = (values: string[]) => new Set(values).size === values.length;
const sameSet = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value) => right.includes(value));

export const deliveryKindSchema = z.enum([
  "known-unicast", "unknown-unicast", "broadcast", "multicast",
]);
export const routerActionSchema = z.enum([
  "not-in-path", "receive-local-only", "route-unicast", "multicast-disabled",
]);

export const deliveryNodeSchema = z.object({
  id,
  label: z.string().trim().min(1),
  kind: z.enum(["host", "router"]),
  acceptsUnicast: z.boolean(),
  multicastGroups: z.array(id),
});

export const deliveryPortSchema = z.object({
  id,
  label: z.string().trim().min(1),
  connectedNodeId: id,
  eligible: z.boolean(),
});

const wrongAnswerExplanationsSchema = z.object({
  forwarded: z.string().trim().min(1),
  received: z.string().trim().min(1),
  accepted: z.string().trim().min(1),
  router: z.string().trim().min(1),
});

export const deliveryScenarioSchema = z.object({
  id,
  difficulty: z.enum(["foundational", "intermediate"]),
  title: z.string().trim().min(1),
  deliveryKind: deliveryKindSchema,
  destinationLabel: z.string().trim().min(1),
  destinationNodeId: id.optional(),
  multicastGroup: id.optional(),
  multicastGroupKnownToSwitch: z.boolean(),
  ingressPortId: id,
  nodes: z.array(deliveryNodeSchema).min(2),
  ports: z.array(deliveryPortSchema).min(2),
  learnedDestinationPortId: id.optional(),
  routerAction: routerActionSchema,
  expectedEgressPortIds: z.array(id),
  expectedReceivingNodeIds: z.array(id),
  expectedAcceptingNodeIds: z.array(id),
  explanation: z.string().trim().min(1),
  evidenceNotes: z.array(z.string().trim().min(1)).min(1),
  wrongAnswerExplanations: wrongAnswerExplanationsSchema,
}).superRefine((value, context) => {
  const nodeIds = value.nodes.map(({ id: nodeId }) => nodeId);
  const portIds = value.ports.map(({ id: portId }) => portId);
  const nodeById = new Map(value.nodes.map((node) => [node.id, node]));
  const portById = new Map(value.ports.map((port) => [port.id, port]));
  const issue = (message: string) => context.addIssue({ code: "custom", message });

  if (!unique(nodeIds)) issue("Node IDs must be unique");
  if (!unique(portIds)) issue("Port IDs must be unique");
  if (value.ports.some(({ connectedNodeId }) => !nodeById.has(connectedNodeId))) issue("Every port must connect to a known node");
  if (!portById.has(value.ingressPortId)) issue("Ingress port must exist");
  if (value.expectedEgressPortIds.includes(value.ingressPortId)) issue("Ingress cannot also be an egress port");
  if (value.expectedEgressPortIds.some((portId) => !portById.get(portId)?.eligible)) issue("Expected egress ports must exist and be eligible");

  const isUnicast = value.deliveryKind === "known-unicast" || value.deliveryKind === "unknown-unicast";
  if (isUnicast && !value.destinationNodeId) issue("Unicast requires a destination node");
  if (value.destinationNodeId && !nodeById.has(value.destinationNodeId)) issue("Destination node must exist");
  if (value.deliveryKind === "known-unicast" && !value.learnedDestinationPortId) issue("Known unicast requires a learned destination port");
  if (value.learnedDestinationPortId && !portById.has(value.learnedDestinationPortId)) issue("Learned destination port must exist");
  if (!isUnicast && value.learnedDestinationPortId) issue("Only unicast may specify a learned destination port");
  if (value.deliveryKind === "multicast" && !value.multicastGroup) issue("Multicast requires a receiver group");

  const derivedReceivers = value.expectedEgressPortIds
    .map((portId) => portById.get(portId)?.connectedNodeId)
    .filter((nodeId): nodeId is string => Boolean(nodeId));
  if (!sameSet(value.expectedReceivingNodeIds, derivedReceivers)) issue("Expected receivers must exactly match egress connections");
  if (value.expectedAcceptingNodeIds.some((nodeId) => !value.expectedReceivingNodeIds.includes(nodeId))) issue("Accepting nodes must first receive the transmission");
  if (value.expectedReceivingNodeIds.some((nodeId) => !nodeById.has(nodeId)) || value.expectedAcceptingNodeIds.some((nodeId) => !nodeById.has(nodeId))) issue("Expected nodes must exist");

  const receivingRouters = value.expectedReceivingNodeIds.filter((nodeId) => nodeById.get(nodeId)?.kind === "router");
  if (value.routerAction === "not-in-path" && receivingRouters.length) issue("A router marked not-in-path cannot receive the transmission");
  if (value.routerAction !== "not-in-path" && !receivingRouters.length) issue("The selected router action requires a receiving router");
  if (value.routerAction === "route-unicast" && !isUnicast) issue("Only unicast can use route-unicast");
  if (value.routerAction === "multicast-disabled" && value.deliveryKind !== "multicast") issue("multicast-disabled requires multicast traffic");
});

export const deliveryCatalogSchema = z.array(deliveryScenarioSchema).min(1).superRefine((scenarios, context) => {
  if (!unique(scenarios.map(({ id: scenarioId }) => scenarioId))) {
    context.addIssue({ code: "custom", message: "Scenario IDs must be unique" });
  }
});

export const deliveryOutcomeSchema = z.object({
  egressPortIds: z.array(id), receivingNodeIds: z.array(id), acceptingNodeIds: z.array(id),
  routerAction: routerActionSchema, explanation: z.string().trim().min(1),
});

export const learnerDeliveryPredictionSchema = z.object({
  egressPortIds: z.array(id), receivingNodeIds: z.array(id), acceptingNodeIds: z.array(id), routerAction: routerActionSchema,
});

export type DeliveryKind = z.infer<typeof deliveryKindSchema>;
export type RouterAction = z.infer<typeof routerActionSchema>;
export type DeliveryNode = z.infer<typeof deliveryNodeSchema>;
export type DeliveryPort = z.infer<typeof deliveryPortSchema>;
export type DeliveryScenario = z.infer<typeof deliveryScenarioSchema>;
export type DeliveryOutcome = z.infer<typeof deliveryOutcomeSchema>;
export type LearnerDeliveryPrediction = z.infer<typeof learnerDeliveryPredictionSchema>;

export function parseDeliveryCatalog(input: unknown): DeliveryScenario[] {
  return deliveryCatalogSchema.parse(input);
}

export function safeParseDeliveryCatalog(input: unknown): DeliveryScenario[] | undefined {
  const result = deliveryCatalogSchema.safeParse(input);
  return result.success ? result.data : undefined;
}
