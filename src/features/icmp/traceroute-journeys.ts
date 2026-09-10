import { z } from "zod";

const deviceSchema = z.object({ id: z.string().min(1), label: z.string().min(1), address: z.string().min(1) });
const responseSchema = z.object({
  kind: z.enum(["time-exceeded", "echo-reply", "destination-unreachable"]),
  type: z.number().int(), code: z.number().int(), reporterId: z.string().min(1), rttMs: z.number().positive(),
}).superRefine((value, context) => {
  const valid = value.kind === "time-exceeded" ? value.type === 11 && value.code === 0
    : value.kind === "echo-reply" ? value.type === 0 && value.code === 0
      : value.type === 3 && [0, 1, 13].includes(value.code);
  if (!valid) context.addIssue({ code: "custom", message: "Invalid traceroute ICMP response." });
});
const probeSchema = z.object({ id: z.string().min(1), ttl: z.number().int().positive().max(255), response: responseSchema.nullable() });
const schema = z.object({
  id: z.string().min(1), title: z.string().min(1), description: z.string().min(1),
  outcome: z.enum(["complete", "silent-hop", "changing-path", "unreachable", "incomplete"]),
  sourceId: z.string(), destinationId: z.string(), devices: z.array(deviceSchema).min(3), probes: z.array(probeSchema).min(1),
  conclusion: z.string().min(1), methodNote: z.string().min(1),
}).superRefine((value, context) => {
  const ids = new Set(value.devices.map(({ id }) => id));
  if (!ids.has(value.sourceId) || !ids.has(value.destinationId)) context.addIssue({ code: "custom", message: "Endpoints must exist." });
  if (new Set(value.probes.map(({ id }) => id)).size !== value.probes.length) context.addIssue({ code: "custom", message: "Probe ids must be unique." });
  for (const probe of value.probes) if (probe.response && !ids.has(probe.response.reporterId)) context.addIssue({ code: "custom", message: "Reporter must exist." });
  if (value.outcome === "complete" && !value.probes.some(({ response }) => response?.kind === "echo-reply" && response.reporterId === value.destinationId)) context.addIssue({ code: "custom", message: "Complete trace must reach the destination." });
});

export type TracerouteScenario = z.infer<typeof schema>;
export type TracerouteObservation = TracerouteScenario["probes"][number];
export type TracerouteJourneyStep = Readonly<{
  id: string; phase: "send" | "observe"; probeId: string; probeTtl: number;
  activeDeviceId: string; response: TracerouteObservation["response"];
  observedResponder: string | null; explanation: string;
  terminal: boolean; destinationReached: boolean;
}>;

export function parseTracerouteScenario(input: unknown): TracerouteScenario { return schema.parse(input); }

const devices = [
  { id: "source", label: "Source Host", address: "192.0.2.10" },
  { id: "router-1", label: "Router 1", address: "192.0.2.1" },
  { id: "router-2", label: "Router 2", address: "203.0.113.1" },
  { id: "alternate", label: "Alternate Router", address: "203.0.113.9" },
  { id: "destination", label: "Destination Host", address: "198.51.100.20" },
];
const response = (kind: "time-exceeded" | "echo-reply" | "destination-unreachable", reporterId: string, rttMs: number) => ({ kind, reporterId, rttMs, type: kind === "time-exceeded" ? 11 : kind === "echo-reply" ? 0 : 3, code: kind === "destination-unreachable" ? 1 : 0 });
const make = (id: string, title: string, outcome: TracerouteScenario["outcome"], probes: unknown[], conclusion: string) => parseTracerouteScenario({ id, title, outcome, description: conclusion, sourceId: "source", destinationId: "destination", devices, probes, conclusion, methodNote: "Conceptual Windows-style ICMP traceroute; implementations may use different probe transports." });

export const tracerouteScenarios = [
  make("stable", "Complete stable path", "complete", [
    { id: "p1", ttl: 1, response: response("time-exceeded", "router-1", 2.1) },
    { id: "p2", ttl: 2, response: response("time-exceeded", "router-2", 7.4) },
    { id: "p3", ttl: 3, response: response("echo-reply", "destination", 12.8) },
  ], "The selected probes received responses from two routers and then the destination."),
  make("silent", "Silent hop, then later replies", "silent-hop", [
    { id: "p1", ttl: 1, response: response("time-exceeded", "router-1", 2.3) }, { id: "p2", ttl: 2, response: null },
    { id: "p3", ttl: 3, response: response("echo-reply", "destination", 13.1) },
  ], "The silent hop did not reply, but the later destination reply proves forwarding continued beyond it."),
  make("changing", "Path changes between probes", "changing-path", [
    { id: "p1", ttl: 1, response: response("time-exceeded", "router-1", 2.2) },
    { id: "p2", ttl: 2, response: response("time-exceeded", "alternate", 8.8) },
    { id: "p3", ttl: 3, response: response("echo-reply", "destination", 13.4) },
  ], "These probes observed a changing path; they do not prove one permanent route."),
  make("unreachable", "Destination unreachable", "unreachable", [
    { id: "p1", ttl: 1, response: response("time-exceeded", "router-1", 2.5) },
    { id: "p2", ttl: 2, response: response("destination-unreachable", "router-2", 7.9) },
  ], "Router 2 reported the destination unreachable; the intended destination did not send that error."),
  make("incomplete", "Trace ends incomplete", "incomplete", [
    { id: "p1", ttl: 1, response: response("time-exceeded", "router-1", 2.4) }, { id: "p2", ttl: 2, response: null }, { id: "p3", ttl: 3, response: null },
  ], "The trace stopped without a destination response, so destination reachability is not established."),
] as const;

export function buildTracerouteJourney(scenario: TracerouteScenario): readonly TracerouteJourneyStep[] {
  const parsed = parseTracerouteScenario(scenario);
  const steps: TracerouteJourneyStep[] = [];
  parsed.probes.forEach((probe, index) => {
    steps.push({ id: `${probe.id}-send`, phase: "send", probeId: probe.id, probeTtl: probe.ttl, activeDeviceId: parsed.sourceId, response: null, observedResponder: null, explanation: `Send probe ${probe.id} with TTL ${probe.ttl}.`, terminal: false, destinationReached: false });
    const reporter = probe.response ? parsed.devices.find(({ id }) => id === probe.response!.reporterId)! : null;
    const reached = probe.response?.kind === "echo-reply" && probe.response.reporterId === parsed.destinationId;
    const isLast = index === parsed.probes.length - 1;
    const explanation = probe.response
      ? `${reporter!.label} responded with ${probe.response.kind.replaceAll("-", " ")}.`
      : "No response was observed for this probe within the waiting period; silence does not prove the router failed to forward.";
    steps.push({ id: `${probe.id}-observe`, phase: "observe", probeId: probe.id, probeTtl: probe.ttl, activeDeviceId: reporter?.id ?? parsed.sourceId, response: probe.response, observedResponder: reporter?.address ?? "*", explanation: isLast ? `${explanation} ${parsed.conclusion}` : explanation, terminal: isLast, destinationReached: isLast && reached });
  });
  return steps;
}
