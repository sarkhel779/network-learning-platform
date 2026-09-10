import { parsePingScenario, type PingScenario } from "./icmp.schema";

export type PingJourneyStep = Readonly<{
  id: string; title: string; explanation: string;
  activeDeviceIds: readonly string[]; activeLinkIds: readonly string[];
  packet: null | Readonly<{ direction: "request" | "response"; label: string; from: string; to: string }>;
  ttl: number | null;
  evidence: readonly Readonly<{ label: string; value: string; layer: "ethernet" | "ip" | "application" }>[];
  terminal: boolean;
}>;

const devices = [
  { id: "source", label: "Source Host", role: "sending workstation", x: 70, y: 120 },
  { id: "router", label: "Gateway Router", role: "IPv4 forwarding device", x: 360, y: 120 },
  { id: "destination", label: "Destination Host", role: "remote server", x: 650, y: 120 },
];
const links = [{ id: "source-router", from: "source", to: "router" }, { id: "router-destination", from: "router", to: "destination" }];
const quote = { sourceIp: "192.0.2.10", destinationIp: "198.51.100.20", protocol: "ICMP" as const };

function response(kind: string, type: number, code: number, reporterId: string) {
  return { kind, type, code, reporterId, ...(kind === "destination-unreachable" || kind === "time-exceeded" ? { quotedPacket: quote } : {}) };
}
function make(id: string, title: string, outcome: string, responseValue: unknown, conclusion: string) {
  return parsePingScenario({ id, title, description: conclusion, outcome, sourceId: "source", destinationId: "destination", requestTtl: 64, devices, links, response: responseValue, conclusion });
}

export const pingScenarios = [
  make("success", "Successful echo exchange", "success", response("echo-reply", 0, 0, "destination"), "The echo exchange completed; this does not prove that every application is healthy."),
  make("timeout", "Timeout with no response", "timeout", null, "No reply was observed before the deadline; the cause is not identified by silence alone."),
  make("network-unreachable", "Destination Network Unreachable", "network-unreachable", response("destination-unreachable", 3, 0, "router"), "The gateway reported that it had no usable route to the destination network."),
  make("host-unreachable", "Destination Host Unreachable", "host-unreachable", response("destination-unreachable", 3, 1, "router"), "The gateway reported that it could not reach the destination host."),
  make("prohibited", "Communication Administratively Prohibited", "administratively-prohibited", response("destination-unreachable", 3, 13, "router"), "A reporting device rejected the traffic because of policy."),
  make("ttl-exceeded", "TTL Exceeded before destination", "ttl-exceeded", response("time-exceeded", 11, 0, "router"), "The gateway discarded the request when its TTL expired before the destination."),
] as const;

export function buildPingJourney(scenario: PingScenario): readonly PingJourneyStep[] {
  const parsed = parsePingScenario(scenario);
  const source = parsed.devices.find(({ id }) => id === parsed.sourceId)!;
  const destination = parsed.devices.find(({ id }) => id === parsed.destinationId)!;
  const request: PingJourneyStep = { id: "send-request", title: "Send Echo Request", explanation: `${source.label} sends an ICMP Echo Request toward ${destination.label}.`, activeDeviceIds: [source.id], activeLinkIds: [parsed.links[0].id], packet: { direction: "request", label: "Echo Request (type 8, code 0)", from: source.id, to: parsed.links[0].to }, ttl: parsed.requestTtl, evidence: [{ label: "IPv4 destination", value: "198.51.100.20", layer: "ip" }, { label: "ICMP", value: "Echo Request — type 8, code 0", layer: "application" }], terminal: false };
  if (!parsed.response) return [request, { id: "observe-timeout", title: "Observe the deadline", explanation: "No reply was observed before the deadline. A timeout does not identify filtering, loss, routing, or host state by itself.", activeDeviceIds: [source.id], activeLinkIds: [], packet: null, ttl: null, evidence: [{ label: "Observed result", value: "No response observed", layer: "application" }], terminal: true }];
  const reporter = parsed.devices.find(({ id }) => id === parsed.response!.reporterId)!;
  const responseStep: PingJourneyStep = { id: "receive-response", title: "Read the ICMP response", explanation: `${reporter.label} reports ${parsed.response.kind.replaceAll("-", " ")}.`, activeDeviceIds: [reporter.id, source.id], activeLinkIds: parsed.links.map(({ id }) => id), packet: { direction: "response", label: `${parsed.response.kind.replaceAll("-", " ")} (type ${parsed.response.type}, code ${parsed.response.code})`, from: reporter.id, to: source.id }, ttl: null, evidence: [{ label: "Reporting device", value: reporter.label, layer: "ip" }, { label: "ICMP type/code", value: `${parsed.response.type}/${parsed.response.code}`, layer: "application" }, ...(parsed.response.quotedPacket ? [{ label: "Quoted packet", value: `${parsed.response.quotedPacket.sourceIp} → ${parsed.response.quotedPacket.destinationIp} (${parsed.response.quotedPacket.protocol})`, layer: "application" as const }] : [])], terminal: false };
  return [request, responseStep, { ...responseStep, id: "conclusion", title: "State only what the evidence proves", explanation: parsed.conclusion, packet: null, activeLinkIds: [], terminal: true }];
}
