import { natScenarioSchema, type NatScenario, type NatTuple } from "./nat-scenario.schema";

const clientRequest: NatTuple = {
  protocol: "tcp",
  sourceIp: "10.0.0.25",
  sourcePort: 51514,
  destinationIp: "198.51.100.20",
  destinationPort: 443,
};

const hairpinRequest: NatTuple = { ...clientRequest, destinationIp: "203.0.113.10" };
const patEntry = {
  id: "pat-https-1",
  protocol: "tcp" as const,
  insideLocal: "10.0.0.25:51514",
  insideGlobal: "203.0.113.10:62001",
  outsideGlobal: "198.51.100.20:443",
  state: "active" as const,
};

function scenario(input: NatScenario): NatScenario {
  return natScenarioSchema.parse(input);
}

export const patInternetJourney = scenario({
  id: "pat-internet-journey",
  title: "PAT: private client to the Internet and back",
  mode: "pat",
  outcome: "success",
  steps: [
    {
      id: "private-request",
      from: "client",
      to: "gateway",
      tuple: clientRequest,
      translations: [],
      tableMutations: [],
      explanation: "The private HTTPS tuple reaches the NAT boundary unchanged.",
    },
    {
      id: "translated",
      from: "gateway",
      to: "internet",
      tuple: { ...clientRequest, sourceIp: "203.0.113.10", sourcePort: 62001 },
      translations: [
        { kind: "pat", field: "sourceIp", before: "10.0.0.25", after: "203.0.113.10" },
        { kind: "pat", field: "sourcePort", before: 51514, after: 62001 },
      ],
      tableMutations: [{ action: "add", entry: patEntry }],
      tableEntries: [patEntry],
      activeEntryId: patEntry.id,
      explanation: "PAT replaces the source address and port and records the reversible mapping.",
    },
    {
      id: "server-response",
      from: "remote-server",
      to: "gateway",
      tuple: { protocol: "tcp", sourceIp: "198.51.100.20", sourcePort: 443, destinationIp: "203.0.113.10", destinationPort: 62001 },
      translations: [],
      tableMutations: [],
      tableEntries: [patEntry],
      activeEntryId: patEntry.id,
      explanation: "The reply targets the public tuple stored in the translation table.",
    },
    {
      id: "reverse-translation",
      from: "gateway",
      to: "client",
      tuple: { protocol: "tcp", sourceIp: "198.51.100.20", sourcePort: 443, destinationIp: "10.0.0.25", destinationPort: 51514 },
      translations: [
        { kind: "reverse", field: "destinationIp", before: "203.0.113.10", after: "10.0.0.25" },
        { kind: "reverse", field: "destinationPort", before: 62001, after: 51514 },
      ],
      tableMutations: [],
      tableEntries: [patEntry],
      activeEntryId: patEntry.id,
      explanation: "The gateway reverses the saved PAT mapping and delivers the reply to the client.",
    },
  ],
});

export const hairpinDnatOnlyJourney = scenario({
  id: "hairpin-dnat-only",
  title: "U-Turn NAT failure: DNAT only",
  mode: "hairpin-failure",
  outcome: "failure",
  steps: [
    {
      id: "public-request",
      from: "client",
      to: "gateway",
      tuple: hairpinRequest,
      translations: [],
      tableMutations: [],
      explanation: "The internal client uses the service public address over HTTPS.",
    },
    {
      id: "dnat-only",
      from: "gateway",
      to: "internal-server",
      tuple: { ...hairpinRequest, destinationIp: "10.0.0.50" },
      translations: [{ kind: "dnat", field: "destinationIp", before: "203.0.113.10", after: "10.0.0.50" }],
      tableMutations: [],
      explanation: "DNAT finds the internal server, but the original private source remains visible.",
    },
    {
      id: "direct-return-rejected",
      from: "internal-server",
      to: "client",
      tuple: { protocol: "tcp", sourceIp: "10.0.0.50", sourcePort: 443, destinationIp: "10.0.0.25", destinationPort: 51514 },
      translations: [],
      tableMutations: [],
      explanation: "The server replies directly from 10.0.0.50, so the client rejects a peer tuple that does not match 203.0.113.10.",
    },
  ],
});

export const hairpinBidirectionalJourney = scenario({
  id: "hairpin-bidirectional",
  title: "U-Turn NAT success: paired DNAT and SNAT",
  mode: "hairpin-success",
  outcome: "success",
  steps: [
    {
      id: "public-request",
      from: "client",
      to: "gateway",
      tuple: hairpinRequest,
      translations: [],
      tableMutations: [],
      explanation: "The internal client opens HTTPS to the service public address.",
    },
    {
      id: "paired-translation",
      from: "gateway",
      to: "internal-server",
      tuple: { ...hairpinRequest, sourceIp: "10.0.0.1", destinationIp: "10.0.0.50" },
      translations: [
        { kind: "dnat", field: "destinationIp", before: "203.0.113.10", after: "10.0.0.50" },
        { kind: "snat", field: "sourceIp", before: "10.0.0.25", after: "10.0.0.1" },
      ],
      tableMutations: [],
      explanation: "DNAT selects the server while SNAT forces the response back through the gateway.",
    },
    {
      id: "gateway-return",
      from: "internal-server",
      to: "gateway",
      tuple: { protocol: "tcp", sourceIp: "10.0.0.50", sourcePort: 443, destinationIp: "10.0.0.1", destinationPort: 51514 },
      translations: [],
      tableMutations: [],
      explanation: "The server now returns through the device that owns both translations.",
    },
    {
      id: "restored-public-peer",
      from: "gateway",
      to: "client",
      tuple: { protocol: "tcp", sourceIp: "203.0.113.10", sourcePort: 443, destinationIp: "10.0.0.25", destinationPort: 51514 },
      translations: [
        { kind: "reverse", field: "sourceIp", before: "10.0.0.50", after: "203.0.113.10" },
        { kind: "reverse", field: "destinationIp", before: "10.0.0.1", after: "10.0.0.25" },
      ],
      tableMutations: [],
      explanation: "The gateway reverses both changes, restoring the public peer tuple expected by the client.",
    },
  ],
});

export const natScenarios = [patInternetJourney, hairpinDnatOnlyJourney, hairpinBidirectionalJourney];
