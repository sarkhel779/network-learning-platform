import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

export const routeSelectionScenario: PacketFlowScenario = parsePacketFlowScenario({
  id: "routing-fundamentals-ad-then-metric",
  title: "Choosing a best route: administrative distance, then metric",
  description: "Watch a router compare an OSPF route and two EIGRP routes to the same network, and see why administrative distance is checked before metric.",
  defaultSpeed: 1,
  devices: [
    { id: "r-ospf", label: "R-OSPF", role: "OSPF neighbor", x: 140, y: 55 },
    { id: "r1", label: "R1", role: "deciding router", x: 420, y: 135 },
    { id: "r-eigrp-a", label: "R-EIGRP-A", role: "EIGRP neighbor", x: 140, y: 220 },
    { id: "r-eigrp-b", label: "R-EIGRP-B", role: "EIGRP neighbor", x: 690, y: 220 },
  ],
  links: [
    { id: "l-ospf", from: "r-ospf", to: "r1" },
    { id: "l-eigrp-a", from: "r-eigrp-a", to: "r1" },
    { id: "l-eigrp-b", from: "r-eigrp-b", to: "r1" },
  ],
  steps: [
    {
      id: "ospf-advertises-route",
      title: "R-OSPF advertises 10.0.0.0/24",
      explanation: "R-OSPF floods a link-state update reaching 10.0.0.0/24 with an OSPF cost of 20. R1 now has one candidate route to that network.",
      durationMs: 1800,
      activeDeviceIds: ["r-ospf", "r1"],
      activeLinkIds: ["l-ospf"],
      packet: { kind: "packet", label: "OSPF LSU: 10.0.0.0/24", from: "r-ospf", to: "r1" },
      summaryFields: [
        { label: "Protocol", value: "OSPF" },
        { label: "Prefix", value: "10.0.0.0/24" },
        { label: "OSPF cost", value: "20" },
      ],
      detailFields: [
        { label: "LSA type", value: "3 (Summary LSA)" },
        { label: "Area", value: "0.0.0.0" },
      ],
    },
    {
      id: "eigrp-a-advertises-route",
      title: "R-EIGRP-A advertises the same network",
      explanation: "R-EIGRP-A also reaches 10.0.0.0/24, over a path with two 100,000 kbps hops totaling 200 (tens of microseconds) of delay. Its composite metric is 256 × (100 + 200) = 76,800.",
      durationMs: 1800,
      activeDeviceIds: ["r-eigrp-a", "r1"],
      activeLinkIds: ["l-eigrp-a"],
      packet: { kind: "packet", label: "EIGRP Update: 10.0.0.0/24", from: "r-eigrp-a", to: "r1" },
      summaryFields: [
        { label: "Protocol", value: "EIGRP" },
        { label: "Prefix", value: "10.0.0.0/24" },
        { label: "Composite metric", value: "76,800" },
      ],
      detailFields: [
        { label: "Minimum bandwidth", value: "100,000 kbps → BW term 10,000,000 / 100,000 = 100" },
        { label: "Cumulative delay", value: "200 (two 100,000 kbps hops)" },
      ],
    },
    {
      id: "eigrp-b-advertises-route",
      title: "R-EIGRP-B advertises the same network too",
      explanation: "R-EIGRP-B reaches 10.0.0.0/24 over a single 100,000 kbps hop with only 100 (tens of microseconds) of delay. Its composite metric is 256 × (100 + 100) = 51,200 — lower, so better.",
      durationMs: 1800,
      activeDeviceIds: ["r-eigrp-b", "r1"],
      activeLinkIds: ["l-eigrp-b"],
      packet: { kind: "packet", label: "EIGRP Update: 10.0.0.0/24", from: "r-eigrp-b", to: "r1" },
      summaryFields: [
        { label: "Protocol", value: "EIGRP" },
        { label: "Prefix", value: "10.0.0.0/24" },
        { label: "Composite metric", value: "51,200" },
      ],
      detailFields: [
        { label: "Minimum bandwidth", value: "100,000 kbps → BW term 10,000,000 / 100,000 = 100" },
        { label: "Cumulative delay", value: "100 (one 100,000 kbps hop)" },
      ],
    },
    {
      id: "compare-administrative-distance",
      title: "R1 compares administrative distance first",
      explanation: "R1 now holds three candidate sources for 10.0.0.0/24: OSPF (administrative distance 110) and EIGRP internal (administrative distance 90) from two different neighbors. Administrative distance is checked before any metric, so both EIGRP candidates immediately outrank the OSPF candidate.",
      durationMs: 2600,
      activeDeviceIds: ["r1"],
      activeLinkIds: [],
      summaryFields: [
        { label: "OSPF admin. distance", value: "110" },
        { label: "EIGRP admin. distance", value: "90", changed: true },
      ],
      detailFields: [
        { label: "OSPF cost", value: "20 (ignored)" },
      ],
      stateNote: "Administrative distance compares different sources; it always wins before metric is even considered.",
    },
    {
      id: "compare-metric-within-eigrp",
      title: "R1 breaks the tie between the two EIGRP routes by metric",
      explanation: "With OSPF eliminated, R1 compares the two remaining EIGRP candidates by their composite metric. R-EIGRP-B's 51,200 beats R-EIGRP-A's 76,800, so R-EIGRP-B's path becomes the successor.",
      durationMs: 2600,
      activeDeviceIds: ["r1"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Via R-EIGRP-A", value: "76,800" },
        { label: "Via R-EIGRP-B", value: "51,200", changed: true },
      ],
      detailFields: [
        { label: "Formula", value: "Metric = 256 × (BW term + delay term)" },
      ],
      stateNote: "Metric only breaks ties between routes learned from the same protocol; it never overrides administrative distance.",
    },
    {
      id: "route-installed",
      title: "R1 installs the winning route",
      explanation: "R1's routing table now shows 10.0.0.0/24 reachable via R-EIGRP-B, with EIGRP's administrative distance of 90 and a composite metric of 51,200.",
      durationMs: 2600,
      activeDeviceIds: ["r1"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Installed route", value: "10.0.0.0/24 via R-EIGRP-B" },
        { label: "Source", value: "EIGRP (AD 90)" },
        { label: "Metric", value: "51,200" },
      ],
      detailFields: [],
      stateNote: "This is the only route installed in the forwarding table; the OSPF and R-EIGRP-A routes stay in the topology table as backups, not in the routing table.",
    },
  ],
} as const);
