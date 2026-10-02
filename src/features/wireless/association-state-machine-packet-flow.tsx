"use client";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { associationStateMachineScenario } from "./association-state-machine.scenario";

export function AssociationStateMachinePacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="interactive-the-association-state-machine"
      inspectionDepthControl
      scenario={associationStateMachineScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
