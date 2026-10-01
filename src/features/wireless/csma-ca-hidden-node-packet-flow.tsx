"use client";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { csmaCaHiddenNodeScenario } from "./csma-ca-hidden-node.scenario";

export function CsmaCaHiddenNodePacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="interactive-csma-ca-and-the-hidden-node-problem"
      inspectionDepthControl
      scenario={csmaCaHiddenNodeScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
