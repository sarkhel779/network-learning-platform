import { z } from "zod";

export type TransportProtocol = "TCP" | "UDP";
export type TcpFlag = "SYN" | "ACK" | "FIN" | "RST" | "PSH";
export type TcpEndpointState = "CLOSED" | "LISTEN" | "SYN-SENT" | "SYN-RECEIVED" | "ESTABLISHED" | "FIN-WAIT" | "CLOSE-WAIT" | "LAST-ACK" | "TIME-WAIT";

const portSchema = z.number().int().min(0).max(65_535);
const endpointSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  ip: z.string().min(1),
  port: portSchema,
});

const tcpStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  explanation: z.string().min(1),
  direction: z.enum(["client-to-server", "server-to-client", "none"]),
  flags: z.array(z.enum(["SYN", "ACK", "FIN", "RST", "PSH"])),
  sequenceNumber: z.number().int().nonnegative().nullable(),
  acknowledgementNumber: z.number().int().nonnegative().nullable(),
  payloadBytes: z.number().int().nonnegative(),
  receiveWindow: z.number().int().nonnegative().max(65_535).nullable(),
  clientState: z.enum(["CLOSED", "LISTEN", "SYN-SENT", "SYN-RECEIVED", "ESTABLISHED", "FIN-WAIT", "CLOSE-WAIT", "LAST-ACK", "TIME-WAIT"]),
  serverState: z.enum(["CLOSED", "LISTEN", "SYN-SENT", "SYN-RECEIVED", "ESTABLISHED", "FIN-WAIT", "CLOSE-WAIT", "LAST-ACK", "TIME-WAIT"]),
  outcome: z.string().min(1),
  terminal: z.boolean(),
}).superRefine((step, context) => {
  if (step.flags.includes("SYN") && step.flags.includes("FIN")) {
    context.addIssue({ code: "custom", message: "SYN and FIN cannot describe the same teaching step." });
  }
  if (step.flags.includes("ACK") && step.acknowledgementNumber === null) {
    context.addIssue({ code: "custom", message: "ACK requires an acknowledgement number." });
  }
  if (step.payloadBytes > 0 && step.sequenceNumber === null) {
    context.addIssue({ code: "custom", message: "Payload bytes require a sequence number." });
  }
});

const tcpScenarioSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  client: endpointSchema,
  server: endpointSchema,
  steps: z.array(tcpStepSchema).min(1),
  conclusion: z.string().min(1),
}).superRefine((scenario, context) => {
  const ids = scenario.steps.map(({ id }) => id);
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: "custom", message: "TCP step ids must be unique." });
  }
  if (scenario.client.id === scenario.server.id) {
    context.addIssue({ code: "custom", message: "TCP endpoint ids must be unique." });
  }
});

const listenerSchema = z.object({
  protocol: z.enum(["TCP", "UDP"]),
  port: portSchema,
  application: z.string().min(1),
});

const portDeliveryScenarioSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  protocol: z.enum(["TCP", "UDP"]),
  sourceIp: z.string().min(1),
  sourcePort: portSchema,
  destinationIp: z.string().min(1),
  destinationPort: portSchema,
  headerFields: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).min(1),
  listener: listenerSchema.nullable(),
  outcome: z.enum(["delivered", "reset", "unreachable-or-silent"]),
  conclusion: z.string().min(1),
}).superRefine((scenario, context) => {
  if (scenario.outcome === "delivered" && !scenario.listener) {
    context.addIssue({ code: "custom", message: "A delivered outcome requires a listener." });
  }
  if (scenario.outcome !== "delivered" && scenario.listener) {
    context.addIssue({ code: "custom", message: "A no-listener outcome cannot include a listener." });
  }
  if (scenario.listener && (scenario.listener.protocol !== scenario.protocol || scenario.listener.port !== scenario.destinationPort)) {
    context.addIssue({ code: "custom", message: "The listener must match the destination protocol and port." });
  }
  if (scenario.outcome === "reset" && scenario.protocol !== "TCP") {
    context.addIssue({ code: "custom", message: "Only the TCP scenario uses the reset outcome." });
  }
  if (scenario.outcome === "unreachable-or-silent" && scenario.protocol !== "UDP") {
    context.addIssue({ code: "custom", message: "Only the UDP scenario uses the unreachable-or-silent outcome." });
  }
});

export type TcpScenario = z.infer<typeof tcpScenarioSchema>;
export type TcpScenarioStep = TcpScenario["steps"][number];
export type PortDeliveryScenario = z.infer<typeof portDeliveryScenarioSchema>;

export function parseTcpScenario(input: unknown): TcpScenario {
  return tcpScenarioSchema.parse(input);
}

export function parsePortDeliveryScenario(input: unknown): PortDeliveryScenario {
  return portDeliveryScenarioSchema.parse(input);
}
