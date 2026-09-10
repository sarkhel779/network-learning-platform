import { z } from "zod";

export type IcmpMessageKind = "echo-request" | "echo-reply" | "destination-unreachable" | "time-exceeded";
export type PingOutcome = "success" | "timeout" | "network-unreachable" | "host-unreachable" | "administratively-prohibited" | "ttl-exceeded";

const deviceSchema = z.object({ id: z.string().min(1), label: z.string().min(1), role: z.string().min(1), x: z.number(), y: z.number() });
const linkSchema = z.object({ id: z.string().min(1), from: z.string().min(1), to: z.string().min(1) });
const quoteSchema = z.object({ sourceIp: z.string().min(1), destinationIp: z.string().min(1), protocol: z.literal("ICMP") });
const responseSchema = z.object({
  kind: z.enum(["echo-request", "echo-reply", "destination-unreachable", "time-exceeded"]),
  type: z.number().int().min(0).max(255), code: z.number().int().min(0).max(255),
  reporterId: z.string().min(1), quotedPacket: quoteSchema.optional(),
}).superRefine((response, context) => {
  const validPair = (response.kind === "echo-request" && response.type === 8 && response.code === 0)
    || (response.kind === "echo-reply" && response.type === 0 && response.code === 0)
    || (response.kind === "destination-unreachable" && response.type === 3 && [0, 1, 13].includes(response.code))
    || (response.kind === "time-exceeded" && response.type === 11 && response.code === 0);
  if (!validPair) context.addIssue({ code: "custom", message: "Invalid ICMP type/code pairing." });
  if (["destination-unreachable", "time-exceeded"].includes(response.kind) && !response.quotedPacket) context.addIssue({ code: "custom", message: "ICMP errors require quoted packet evidence." });
});

const pingScenarioSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), description: z.string().min(1),
  outcome: z.enum(["success", "timeout", "network-unreachable", "host-unreachable", "administratively-prohibited", "ttl-exceeded"]),
  sourceId: z.string().min(1), destinationId: z.string().min(1), requestTtl: z.number().int().positive().max(255),
  devices: z.array(deviceSchema).min(2), links: z.array(linkSchema).min(1), response: responseSchema.nullable(),
  conclusion: z.string().min(1),
}).superRefine((scenario, context) => {
  const ids = new Set(scenario.devices.map(({ id }) => id));
  if (ids.size !== scenario.devices.length) context.addIssue({ code: "custom", message: "Device ids must be unique." });
  if (!ids.has(scenario.sourceId) || !ids.has(scenario.destinationId)) context.addIssue({ code: "custom", message: "Endpoints must exist." });
  for (const link of scenario.links) if (!ids.has(link.from) || !ids.has(link.to)) context.addIssue({ code: "custom", message: "Links must reference known devices." });
  const response = scenario.response;
  if (scenario.outcome === "timeout" && response) context.addIssue({ code: "custom", message: "Timeout cannot contain a response." });
  if (scenario.outcome !== "timeout" && !response) context.addIssue({ code: "custom", message: "This outcome requires a response." });
  if (!response) return;
  if (!ids.has(response.reporterId)) context.addIssue({ code: "custom", message: "Reporter must be a known device." });
  const expected = scenario.outcome === "success" ? "echo-reply"
    : scenario.outcome === "ttl-exceeded" ? "time-exceeded" : "destination-unreachable";
  if (response.kind !== expected) context.addIssue({ code: "custom", message: "Response does not match the scenario outcome." });
  const unreachableCodes: Partial<Record<PingOutcome, number>> = {
    "network-unreachable": 0, "host-unreachable": 1, "administratively-prohibited": 13,
  };
  const expectedCode = unreachableCodes[scenario.outcome];
  if (expectedCode !== undefined && response.code !== expectedCode) context.addIssue({ code: "custom", message: "Unreachable code does not match the outcome." });
});

export type PingScenario = z.infer<typeof pingScenarioSchema>;
export type IcmpEvidence = NonNullable<PingScenario["response"]>;

export function parseIcmpEvidence(input: unknown): IcmpEvidence {
  return responseSchema.parse(input);
}

export function parsePingScenario(input: unknown): PingScenario {
  return pingScenarioSchema.parse(input);
}
