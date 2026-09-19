import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

export const bgpSessionEstablishmentScenario: PacketFlowScenario = parsePacketFlowScenario({
  id: "bgp-session-establishment",
  title: "BGP: establishing a session and advertising a prefix",
  description: "Watch two eBGP peers move through the BGP finite state machine from Idle to Established, then advertise a prefix with its path attributes.",
  defaultSpeed: 1,
  devices: [
    { id: "r1", label: "R1 (AS 65001)", role: "eBGP router", x: 260, y: 135 },
    { id: "r2", label: "R2 (AS 65002)", role: "eBGP router", x: 580, y: 135 },
  ],
  links: [
    { id: "r1-r2", from: "r1", to: "r2" },
  ],
  steps: [
    {
      id: "idle-state",
      title: "Both peers start in the Idle state",
      explanation: "Idle is the BGP finite state machine's starting point: no TCP connection exists yet, and both routers are simply configured to peer with each other.",
      durationMs: 2200,
      activeDeviceIds: ["r1", "r2"],
      activeLinkIds: [],
      summaryFields: [
        { label: "R1 state", value: "Idle" },
        { label: "R2 state", value: "Idle" },
      ],
      detailFields: [],
    },
    {
      id: "tcp-connection-established",
      title: "A TCP connection forms on port 179",
      explanation: "R1 initiates a TCP three-way handshake (SYN, SYN-ACK, ACK) to R2 on TCP port 179. Once the connection is up, both routers move from Connect to OpenSent.",
      durationMs: 1800,
      activeDeviceIds: ["r1", "r2"],
      activeLinkIds: ["r1-r2"],
      packet: { kind: "packet", label: "TCP handshake (port 179)", from: "r1", to: "r2" },
      summaryFields: [
        { label: "Transport", value: "TCP port 179" },
        { label: "R1 state", value: "OpenSent", changed: true },
        { label: "R2 state", value: "OpenSent", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "r1-sends-open",
      title: "R1 sends an OPEN message",
      explanation: "R1 sends a BGP OPEN message announcing its own AS number, BGP version, hold time, and BGP Identifier (Router ID).",
      durationMs: 1800,
      activeDeviceIds: ["r1", "r2"],
      activeLinkIds: ["r1-r2"],
      packet: { kind: "packet", label: "BGP OPEN", from: "r1", to: "r2" },
      summaryFields: [
        { label: "Message type", value: "OPEN" },
        { label: "My AS", value: "65001" },
        { label: "BGP Identifier", value: "1.1.1.1" },
      ],
      detailFields: [
        { label: "BGP version", value: "4" },
        { label: "Hold time", value: "180 seconds" },
      ],
    },
    {
      id: "r2-sends-open",
      title: "R2 replies with its own OPEN message",
      explanation: "R2 sends its OPEN message back. Both routers now have each other's AS number and Router ID and move to OpenConfirm.",
      durationMs: 1800,
      activeDeviceIds: ["r2", "r1"],
      activeLinkIds: ["r1-r2"],
      packet: { kind: "packet", label: "BGP OPEN", from: "r2", to: "r1" },
      summaryFields: [
        { label: "Message type", value: "OPEN" },
        { label: "My AS", value: "65002" },
        { label: "BGP Identifier", value: "2.2.2.2" },
      ],
      detailFields: [
        { label: "R1 state", value: "OpenConfirm", changed: true },
        { label: "R2 state", value: "OpenConfirm", changed: true },
      ],
    },
    {
      id: "keepalives-exchanged-established",
      title: "KEEPALIVEs confirm the session: Established",
      explanation: "Both routers exchange KEEPALIVE messages to confirm the OPEN parameters were accepted. The session reaches Established — the only state in which routes can be exchanged.",
      durationMs: 2200,
      activeDeviceIds: ["r1", "r2"],
      activeLinkIds: ["r1-r2"],
      packet: { kind: "packet", label: "BGP KEEPALIVE", from: "r1", to: "r2" },
      summaryFields: [
        { label: "Message type", value: "KEEPALIVE" },
        { label: "R1 state", value: "Established", changed: true },
        { label: "R2 state", value: "Established", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "r1-sends-update",
      title: "R1 advertises a prefix with UPDATE",
      explanation: "R1 sends a BGP UPDATE advertising 203.0.113.0/24, carrying the path attributes R2 will use in its decision process: AS_PATH, NEXT_HOP, and ORIGIN.",
      durationMs: 2200,
      activeDeviceIds: ["r1", "r2"],
      activeLinkIds: ["r1-r2"],
      packet: { kind: "packet", label: "BGP UPDATE: 203.0.113.0/24", from: "r1", to: "r2" },
      summaryFields: [
        { label: "Message type", value: "UPDATE" },
        { label: "Prefix", value: "203.0.113.0/24" },
        { label: "AS_PATH", value: "65001" },
      ],
      detailFields: [
        { label: "NEXT_HOP", value: "192.0.2.1" },
        { label: "ORIGIN", value: "IGP" },
      ],
    },
  ],
} as const);
