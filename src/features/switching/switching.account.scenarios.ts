import "server-only";

import type { SwitchDecision, SwitchingCatalogInput } from "./switching.schema";

const ports = [
  { id: "p1", label: "Port 1 — Host A", eligible: true },
  { id: "p2", label: "Port 2 — Host B", eligible: true },
  { id: "p3", label: "Port 3 — Host C", eligible: true },
  { id: "p4", label: "Port 4 — Host D", eligible: true },
];

function wrongAnswers(correct: SwitchDecision): Record<SwitchDecision, string> {
  return {
    "known-unicast": correct === "known-unicast"
      ? "The destination is known; verify the exact learned egress port."
      : "Known unicast requires a current destination entry on another port.",
    filter: correct === "filter"
      ? "Filtering is correct only when the destination is learned behind ingress."
      : "Filtering requires the learned destination to be on the ingress segment.",
    "unknown-unicast-flood": correct === "unknown-unicast-flood"
      ? "Unknown unicast must use every eligible port except ingress."
      : "Unknown-unicast flooding applies only when no destination entry exists.",
    "broadcast-flood": correct === "broadcast-flood"
      ? "Broadcast flooding must use every eligible port except ingress."
      : "Broadcast flooding requires the Ethernet broadcast destination address.",
  };
}

export const accountSwitchingScenarioInput: SwitchingCatalogInput["scenarios"] = [
  {
    id: "first-frame-unknown-destination",
    difficulty: "foundational",
    title: "First frame to an unknown destination",
    ports,
    initialTable: [],
    ingressPortId: "p1",
    sourceMac: "02:00:00:00:00:01",
    destinationMac: "02:00:00:00:00:02",
    destinationType: "unicast",
    eligibleEgressPortIds: ["p2", "p3", "p4"],
    expectedDecision: "unknown-unicast-flood",
    expectedEgressPortIds: ["p2", "p3", "p4"],
    expectedLearnedEntry: { mac: "02:00:00:00:00:01", portId: "p1" },
    explanation: "The switch learns source 01 on port 1. Destination 02 is unknown, so it floods every eligible port except ingress.",
    wrongAnswerExplanations: wrongAnswers("unknown-unicast-flood"),
    evidenceNotes: ["The forwarding table begins empty.", "Ingress port 1 is excluded from flooding."],
  },
  {
    id: "reply-after-learning",
    difficulty: "foundational",
    title: "Reply frame after learning",
    ports,
    initialTable: [{ mac: "02:00:00:00:00:01", portId: "p1" }],
    ingressPortId: "p2",
    sourceMac: "02:00:00:00:00:02",
    destinationMac: "02:00:00:00:00:01",
    destinationType: "unicast",
    eligibleEgressPortIds: ["p1", "p3", "p4"],
    expectedDecision: "known-unicast",
    expectedEgressPortIds: ["p1"],
    expectedLearnedEntry: { mac: "02:00:00:00:00:02", portId: "p2" },
    explanation: "The reply lets the switch learn source 02 on port 2. Destination 01 is already known on port 1, so only port 1 is used.",
    wrongAnswerExplanations: wrongAnswers("known-unicast"),
    evidenceNotes: ["The earlier frame taught the switch that host A is on port 1."],
  },
  {
    id: "known-unicast",
    difficulty: "foundational",
    title: "Known unicast forwarding",
    ports,
    initialTable: [{ mac: "02:00:00:00:00:03", portId: "p3" }],
    ingressPortId: "p1",
    sourceMac: "02:00:00:00:00:01",
    destinationMac: "02:00:00:00:00:03",
    destinationType: "unicast",
    eligibleEgressPortIds: ["p2", "p3", "p4"],
    expectedDecision: "known-unicast",
    expectedEgressPortIds: ["p3"],
    expectedLearnedEntry: { mac: "02:00:00:00:00:01", portId: "p1" },
    explanation: "The switch learns source 01 on port 1 and finds destination 03 on port 3, so the known unicast leaves only port 3.",
    wrongAnswerExplanations: wrongAnswers("known-unicast"),
    evidenceNotes: ["The destination entry explicitly maps host C to port 3."],
  },
  {
    id: "same-segment-filtering",
    difficulty: "intermediate",
    title: "Same-segment filtering",
    ports,
    initialTable: [{ mac: "02:00:00:00:00:02", portId: "p1" }],
    ingressPortId: "p1",
    sourceMac: "02:00:00:00:00:01",
    destinationMac: "02:00:00:00:00:02",
    destinationType: "unicast",
    eligibleEgressPortIds: ["p2", "p3", "p4"],
    expectedDecision: "filter",
    expectedEgressPortIds: [],
    expectedLearnedEntry: { mac: "02:00:00:00:00:01", portId: "p1" },
    explanation: "The bridge learns source 01 on port 1 and sees destination 02 behind the same port, so it filters instead of forwarding elsewhere.",
    wrongAnswerExplanations: wrongAnswers("filter"),
    evidenceNotes: ["Both hosts can sit behind one classic bridge segment.", "No egress port is required."],
  },
  {
    id: "broadcast-frame",
    difficulty: "intermediate",
    title: "Ethernet broadcast frame",
    ports,
    initialTable: [{ mac: "02:00:00:00:00:03", portId: "p3" }],
    ingressPortId: "p2",
    sourceMac: "02:00:00:00:00:02",
    destinationMac: "FF:FF:FF:FF:FF:FF",
    destinationType: "broadcast",
    eligibleEgressPortIds: ["p1", "p3", "p4"],
    expectedDecision: "broadcast-flood",
    expectedEgressPortIds: ["p1", "p3", "p4"],
    expectedLearnedEntry: { mac: "02:00:00:00:00:02", portId: "p2" },
    explanation: "The switch learns source 02 on port 2, recognizes the broadcast destination, and floods eligible ports 1, 3, and 4—not ingress.",
    wrongAnswerExplanations: wrongAnswers("broadcast-flood"),
    evidenceNotes: ["A learned unicast entry does not narrow an Ethernet broadcast."],
  },
  {
    id: "aged-out-destination",
    difficulty: "intermediate",
    title: "Destination entry has aged out",
    ports,
    initialTable: [{ mac: "02:00:00:00:00:02", portId: "p2" }],
    ingressPortId: "p3",
    sourceMac: "02:00:00:00:00:03",
    destinationMac: "02:00:00:00:00:04",
    destinationType: "unicast",
    eligibleEgressPortIds: ["p1", "p2", "p4"],
    expectedDecision: "unknown-unicast-flood",
    expectedEgressPortIds: ["p1", "p2", "p4"],
    expectedLearnedEntry: { mac: "02:00:00:00:00:03", portId: "p3" },
    explanation: "The switch learns source 03 on port 3. The expired destination 04 entry is absent, so the frame is now unknown unicast and floods eligible ports.",
    wrongAnswerExplanations: wrongAnswers("unknown-unicast-flood"),
    evidenceNotes: ["Aging is represented by the missing destination entry.", "The expiration interval depends on implementation."],
  },
];
