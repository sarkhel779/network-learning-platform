import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

export const eigrpDualScenario: PacketFlowScenario = parsePacketFlowScenario({
  id: "eigrp-dual-feasible-successor-and-active-query",
  title: "EIGRP: DUAL's two outcomes — an instant reroute, and an Active Query",
  description: "Watch R1 track two networks through the same two neighbors: one has a feasible successor and reroutes instantly when its link fails, the other doesn't and has to go Active and Query for a new path — showing exactly why a feasible successor matters.",
  defaultSpeed: 1,
  devices: [
    { id: "r2", label: "R2", role: "EIGRP neighbor", x: 140, y: 60 },
    { id: "r1", label: "R1", role: "EIGRP router", x: 420, y: 150 },
    { id: "r3", label: "R3", role: "EIGRP neighbor", x: 140, y: 240 },
  ],
  links: [
    { id: "r1-r2", from: "r1", to: "r2" },
    { id: "r1-r3", from: "r1", to: "r3" },
  ],
  steps: [
    {
      id: "r1-discovers-neighbors",
      title: "R1 discovers both neighbors with Hello",
      explanation: "R1 says hello to both of its neighbors and gets a reply from each, forming two neighbor relationships. Technically, this is an EIGRP Hello (IP protocol 88) sent unreliably to the multicast address 224.0.0.10.",
      durationMs: 2200,
      activeDeviceIds: ["r1", "r2", "r3"],
      activeLinkIds: ["r1-r2", "r1-r3"],
      summaryFields: [
        { label: "Neighbors discovered", value: "R2 and R3" },
      ],
      detailFields: [
        { label: "Protocol", value: "EIGRP Hello" },
        { label: "Destination", value: "224.0.0.10" },
      ],
    },
    {
      id: "r1-learns-network-x",
      title: "R1 learns network X from both neighbors",
      explanation: "Both neighbors advertise network X. R2's path is better, so R2 becomes the successor — but R3's reported distance is still low enough to qualify as a backup R1 can trust without question.",
      durationMs: 2600,
      activeDeviceIds: ["r2", "r3", "r1"],
      activeLinkIds: ["r1-r2", "r1-r3"],
      packet: { kind: "packet", label: "EIGRP Update: network X", from: "r2", to: "r1" },
      summaryFields: [
        { label: "Successor (network X)", value: "R2, Feasible Distance 76,800", changed: true },
        { label: "Feasible successor (network X)", value: "R3 (reported 51,200 < 76,800)", changed: true },
      ],
      detailFields: [
        { label: "R2 reported distance", value: "51,200" },
        { label: "R3 reported distance", value: "51,200" },
        { label: "R1's total metric via R3", value: "102,400 (worse than via R2, but still a valid backup)" },
        { label: "Feasibility condition", value: "A neighbor qualifies as a feasible successor if its reported distance < R1's Feasible Distance" },
      ],
    },
    {
      id: "r1-learns-network-z",
      title: "R1 also learns network Z — but R3 doesn't qualify this time",
      explanation: "Both neighbors advertise a second network, Z. R2 is still the best path and becomes successor. But R3's reported distance for Z is too high to pass the feasibility test — R1 can't trust it as a guaranteed loop-free backup, so R3 is not a feasible successor for Z.",
      durationMs: 2600,
      activeDeviceIds: ["r2", "r3", "r1"],
      activeLinkIds: ["r1-r2", "r1-r3"],
      packet: { kind: "packet", label: "EIGRP Update: network Z", from: "r2", to: "r1" },
      summaryFields: [
        { label: "Successor (network Z)", value: "R2, Feasible Distance 76,800", changed: true },
        { label: "Feasible successor (network Z)", value: "None — R3 fails the feasibility test", changed: true },
      ],
      detailFields: [
        { label: "R3 reported distance for Z", value: "102,400" },
        { label: "Feasibility check", value: "102,400 is not less than 76,800, so R3 fails the condition" },
        { label: "R1's total metric via R3", value: "128,000 (R3's own path may loop back through R1 — unverified)" },
      ],
    },
    {
      id: "r1-r2-link-fails",
      title: "R1's link to R2 fails",
      explanation: "The successor link goes down for both networks at once. What happens next depends entirely on whether each network already had a feasible successor lined up.",
      durationMs: 2200,
      activeDeviceIds: ["r1"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Link R1–R2", value: "Down", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "network-x-reroutes-instantly",
      title: "Network X: instant reroute, no Query needed",
      explanation: "Because R3 already satisfied the feasibility condition for X, R1 doesn't need to ask anyone anything — it immediately installs the route via R3 using only information it already had.",
      durationMs: 2600,
      activeDeviceIds: ["r1", "r3"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Network X successor", value: "R3, metric 102,400", changed: true },
        { label: "Query sent?", value: "No" },
      ],
      detailFields: [],
      stateNote: "This is DUAL's key advantage over plain distance-vector: a pre-qualified feasible successor allows an instant, loop-free local reroute.",
    },
    {
      id: "network-z-goes-active-and-queries",
      title: "Network Z: no feasible successor, so R1 goes Active",
      explanation: "R1 has no pre-qualified backup for Z, so it can't just pick one — doing so could create a loop. Instead it marks Z Active, pauses using the route, and sends a Query to its only remaining neighbor, R3, asking for its current best path.",
      durationMs: 2600,
      activeDeviceIds: ["r1", "r3"],
      activeLinkIds: ["r1-r3"],
      packet: { kind: "packet", label: "EIGRP Query: network Z?", from: "r1", to: "r3" },
      summaryFields: [
        { label: "Network Z state", value: "Active", changed: true },
        { label: "Query sent to", value: "R3" },
      ],
      detailFields: [
        { label: "Why not just use R3 anyway?", value: "Its reported distance failed the feasibility check — using it unverified risks a routing loop" },
      ],
    },
    {
      id: "r3-replies-and-r1-installs-route",
      title: "R3 replies, and R1 finally installs a route for Z",
      explanation: "R3 already has its own independent path to Z, so it can answer immediately with a Reply. Once R1 has heard back from every neighbor it queried (just R3 here), it exits Active and installs the route.",
      durationMs: 2600,
      activeDeviceIds: ["r3", "r1"],
      activeLinkIds: ["r1-r3"],
      packet: { kind: "packet", label: "EIGRP Reply: network Z, 102,400", from: "r3", to: "r1" },
      summaryFields: [
        { label: "Network Z successor", value: "R3, metric 128,000", changed: true },
        { label: "Network Z state", value: "Passive (Active cleared)", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "stuck-in-active-risk",
      title: "What if R3 had never replied?",
      explanation: "If a queried neighbor doesn't send a Reply before EIGRP's Active timer runs out (3 minutes by default), the route becomes Stuck-In-Active (SIA) — and DUAL's response is drastic: it resets the neighbor relationship with whichever router stayed silent, forcing a full resync. Network X never had any of this risk, precisely because its feasible successor let R1 skip the Query/Reply process entirely.",
      durationMs: 2800,
      activeDeviceIds: ["r1", "r3"],
      activeLinkIds: [],
      summaryFields: [
        { label: "If the Reply never arrives", value: "Stuck-In-Active (SIA)" },
        { label: "DUAL's response to SIA", value: "Reset the unresponsive neighbor relationship" },
      ],
      detailFields: [
        { label: "Default Active timer", value: "3 minutes" },
      ],
      stateNote: "A feasible successor doesn't just save time — it avoids the Query/Reply process, and the SIA risk, altogether.",
    },
  ],
} as const);
