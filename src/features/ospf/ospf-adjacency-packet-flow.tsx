"use client";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { ospfAdjacencyScenario } from "./ospf-adjacency.scenario";

export function OspfAdjacencyPacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="interactive-ospf-adjacency"
      inspectionDepthControl
      scenario={ospfAdjacencyScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
