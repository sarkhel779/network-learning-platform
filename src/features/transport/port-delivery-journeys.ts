import { parsePortDeliveryScenario, type PortDeliveryScenario } from "./transport.schema";

export type PortDeliveryStep = Readonly<{
  id: string;
  title: string;
  explanation: string;
  tuple: string;
  headerFields: PortDeliveryScenario["headerFields"];
  listener: PortDeliveryScenario["listener"];
  application: string | null;
  relatedTuples: readonly string[];
  conclusion: string | null;
  terminal: boolean;
}>;

function make(input: PortDeliveryScenario): PortDeliveryScenario {
  return parsePortDeliveryScenario(input);
}

const base = { sourceIp: "192.0.2.10", sourcePort: 49152, destinationIp: "198.51.100.20" };

export const portDeliveryScenarios = [
  make({ ...base, id: "tcp-listener", title: "TCP application is listening", description: "Deliver an HTTPS connection request.", protocol: "TCP", destinationPort: 443, headerFields: [{ label: "Flags", value: "SYN" }, { label: "Sequence", value: "1000" }], listener: { protocol: "TCP", port: 443, application: "HTTPS service" }, outcome: "delivered", conclusion: "The TCP tuple matched the HTTPS listening socket." }),
  make({ ...base, id: "udp-listener", title: "UDP application is listening", description: "Deliver a DNS query.", protocol: "UDP", destinationPort: 53, headerFields: [{ label: "Length", value: "40 bytes" }, { label: "Checksum", value: "valid" }], listener: { protocol: "UDP", port: 53, application: "DNS service" }, outcome: "delivered", conclusion: "The UDP destination matched the DNS receiving socket." }),
  make({ ...base, id: "ephemeral-clients", title: "Two ephemeral client ports", description: "Keep simultaneous conversations distinct.", protocol: "TCP", destinationPort: 443, headerFields: [{ label: "Flags", value: "ACK" }, { label: "Conversations", value: "2" }], listener: { protocol: "TCP", port: 443, application: "HTTPS service" }, outcome: "delivered", conclusion: "Different ephemeral source ports keep the two TCP conversations distinct." }),
  make({ ...base, id: "tcp-no-listener", title: "TCP port has no listener", description: "Observe explicit rejection evidence.", protocol: "TCP", destinationPort: 8443, headerFields: [{ label: "Flags", value: "SYN" }], listener: null, outcome: "reset", conclusion: "A reachable host with no TCP listener commonly returns RST, explicitly refusing the connection." }),
  make({ ...base, id: "udp-no-listener", title: "UDP port has no listener", description: "Keep the outcome conditional.", protocol: "UDP", destinationPort: 9999, headerFields: [{ label: "Length", value: "32 bytes" }], listener: null, outcome: "unreachable-or-silent", conclusion: "A host may return ICMP Port Unreachable, while filtering or policy can leave the sender observing silence." }),
] as const;

function tupleOf(scenario: PortDeliveryScenario, sourcePort = scenario.sourcePort) {
  return `${scenario.protocol} ${scenario.sourceIp}:${sourcePort} → ${scenario.destinationIp}:${scenario.destinationPort}`;
}

export function buildPortDeliveryJourney(input: PortDeliveryScenario): readonly PortDeliveryStep[] {
  const scenario = parsePortDeliveryScenario(input);
  const tuple = tupleOf(scenario);
  const relatedTuples = scenario.id === "ephemeral-clients"
    ? [tupleOf(scenario, 49152), tupleOf(scenario, 49153)]
    : [tuple];
  const common = { tuple, headerFields: scenario.headerFields, listener: scenario.listener, relatedTuples };
  return [
    { ...common, id: "arrive", title: "Transport unit arrives", explanation: `${scenario.protocol} carries source and destination ports inside the IP packet.`, application: null, conclusion: null, terminal: false },
    { ...common, id: "inspect", title: "Read the transport tuple", explanation: "The host combines protocol, addresses, and ports to identify the conversation.", application: null, conclusion: null, terminal: false },
    { ...common, id: "select", title: scenario.listener ? "Match the receiving socket" : "Find no matching listener", explanation: scenario.listener ? `The destination matches ${scenario.listener.application}.` : "No local socket matches this protocol and destination port.", application: scenario.listener?.application ?? null, conclusion: null, terminal: false },
    { ...common, id: "outcome", title: "State the delivery outcome", explanation: scenario.conclusion, application: scenario.listener?.application ?? null, conclusion: scenario.conclusion, terminal: true },
  ];
}
