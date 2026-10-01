import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

export const ospfAdjacencyScenario: PacketFlowScenario = parsePacketFlowScenario({
  id: "ospf-multi-access-dr-bdr-election",
  title: "OSPF: DR/BDR election on a multi-access segment",
  description: "Watch four OSPF routers on a shared multi-access segment exchange Hellos, elect a Designated Router and Backup Designated Router by priority, and see why two non-DR/BDR routers never form a full adjacency with each other.",
  defaultSpeed: 1,
  devices: [
    { id: "r1", label: "R1", role: "Priority 1 (becomes DROTHER)", x: 160, y: 90 },
    { id: "r2", label: "R2", role: "Priority 1 (becomes DROTHER)", x: 620, y: 90 },
    { id: "r3", label: "R3", role: "Priority 100 (becomes BDR)", x: 620, y: 320 },
    { id: "r4", label: "R4", role: "Priority 255 (becomes DR)", x: 160, y: 320 },
  ],
  links: [
    { id: "r1-r2", from: "r1", to: "r2" },
    { id: "r1-r3", from: "r1", to: "r3" },
    { id: "r1-r4", from: "r1", to: "r4" },
    { id: "r2-r3", from: "r2", to: "r3" },
    { id: "r2-r4", from: "r2", to: "r4" },
    { id: "r3-r4", from: "r3", to: "r4" },
  ],
  steps: [
    {
      id: "down-state",
      title: "All four routers start in the Down state",
      explanation: "None of the four routers on this shared segment has heard a Hello from any other yet. Down is the default starting state for every OSPF neighbor relationship.",
      durationMs: 2000,
      activeDeviceIds: ["r1", "r2", "r3", "r4"],
      activeLinkIds: [],
      summaryFields: [
        { label: "All four routers", value: "Down" },
      ],
      detailFields: [],
    },
    {
      id: "hellos-exchanged-on-segment",
      title: "Every router sends a Hello to everyone else",
      explanation: "On a multi-access segment, Hellos go to the multicast address 224.0.0.5 (\"All SPF Routers\"), so one Hello reaches every other router on the segment at once — not just one neighbor at a time. R1's Hello is shown here; all four routers do the same thing.",
      durationMs: 2400,
      activeDeviceIds: ["r1", "r2", "r3", "r4"],
      activeLinkIds: ["r1-r2", "r1-r3", "r1-r4"],
      packet: { kind: "packet", label: "OSPF Hello (224.0.0.5)", from: "r1", to: "r2", fanOut: true },
      summaryFields: [
        { label: "Destination", value: "224.0.0.5, all routers on the segment" },
        { label: "Once everyone has done this", value: "Every pair reaches 2-Way" },
      ],
      detailFields: [
        { label: "R1 priority / Router ID", value: "1 / 1.1.1.1" },
        { label: "R2 priority / Router ID", value: "1 / 2.2.2.2" },
        { label: "R3 priority / Router ID", value: "100 / 3.3.3.3" },
        { label: "R4 priority / Router ID", value: "255 / 4.4.4.4" },
      ],
    },
    {
      id: "dr-and-bdr-elected",
      title: "R4 becomes DR, R3 becomes BDR",
      explanation: "The router with the highest Hello priority becomes the Designated Router — that's R4. Among what's left, the next-highest priority becomes the Backup Designated Router — that's R3. R1 and R2 have the lowest priority, so they become DROTHER and take no special role.",
      durationMs: 2600,
      activeDeviceIds: ["r4", "r3"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Designated Router (DR)", value: "R4 (priority 255)", changed: true },
        { label: "Backup Designated Router (BDR)", value: "R3 (priority 100)", changed: true },
      ],
      detailFields: [
        { label: "Tiebreak rule", value: "Equal priority is broken by the higher Router ID, not used here since R4 and R3 have distinct priorities" },
        { label: "Priority 0", value: "A router with priority 0 is never eligible to become DR or BDR" },
      ],
    },
    {
      id: "dr-forms-full-with-every-router",
      title: "R4 (DR) builds a full adjacency with every other router",
      explanation: "The DR exchanges Database Description, Link State Request, and Link State Update packets with every other router on the segment — shown here with R1. The same pairwise exchange happens separately and directly with R2 and R3 too.",
      durationMs: 2600,
      activeDeviceIds: ["r4", "r1"],
      activeLinkIds: ["r1-r4"],
      packet: { kind: "packet", label: "OSPF DBD / LSR / LSU (R4 ↔ R1)", from: "r4", to: "r1" },
      summaryFields: [
        { label: "R4 (DR) ↔ R1", value: "Full", changed: true },
      ],
      detailFields: [
        { label: "Also happens separately with", value: "R2 and R3" },
      ],
    },
    {
      id: "bdr-also-forms-full-with-every-router",
      title: "R3 (BDR) also builds a full adjacency with every other router",
      explanation: "The BDR does the exact same thing as the DR — full exchanges with every other router — so it already holds a complete, synchronized database and can take over instantly if the DR fails. Shown here with R1; the same happens with R2 and with R4 (the DR).",
      durationMs: 2600,
      activeDeviceIds: ["r3", "r1"],
      activeLinkIds: ["r1-r3"],
      packet: { kind: "packet", label: "OSPF DBD / LSR / LSU (R3 ↔ R1)", from: "r3", to: "r1" },
      summaryFields: [
        { label: "R3 (BDR) ↔ R1", value: "Full", changed: true },
      ],
      detailFields: [
        { label: "Also happens separately with", value: "R2 and R4" },
      ],
    },
    {
      id: "drother-drother-stays-at-2-way",
      title: "R1 and R2 never go past 2-Way with each other",
      explanation: "R1 and R2 are both DROTHER — neither is the DR or the BDR. They've already exchanged Hellos and can see each other, but they deliberately stop at 2-Way: there's no DBD, LSR, or LSU exchange directly between them. Any link-state information between them flows through the DR instead.",
      durationMs: 2600,
      activeDeviceIds: ["r1", "r2"],
      activeLinkIds: ["r1-r2"],
      summaryFields: [
        { label: "R1 (DROTHER) ↔ R2 (DROTHER)", value: "2-Way only — stays here", changed: true },
      ],
      detailFields: [
        { label: "No DBD/LSR/LSU exchanged directly", value: "Link-state information reaches them via the DR instead" },
      ],
      stateNote: "This is the entire point of electing a DR and BDR: without it, every router on the segment would need a full adjacency with every other router.",
    },
    {
      id: "final-adjacency-state",
      title: "Final state: 5 full adjacencies instead of 6",
      explanation: "A segment of four routers has six possible pairs. With a DR and BDR, five of those pairs reach Full and only one — the two DROTHERs — stays at 2-Way. Without a DR/BDR, every one of those six pairs would need its own full exchange.",
      durationMs: 2800,
      activeDeviceIds: ["r1", "r2", "r3", "r4"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Full adjacencies", value: "5 (DR↔R1, DR↔R2, DR↔BDR, BDR↔R1, BDR↔R2)" },
        { label: "2-Way only", value: "1 (R1↔R2)" },
      ],
      detailFields: [
        { label: "Without DR/BDR election", value: "All 6 pairs would need a full exchange" },
      ],
    },
  ],
} as const);
