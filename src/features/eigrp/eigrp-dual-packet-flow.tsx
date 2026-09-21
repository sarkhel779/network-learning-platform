"use client";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { eigrpDualScenario } from "./eigrp-dual.scenario";

export function EigrpDualPacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="interactive-eigrp-dual"
      inspectionDepthControl
      scenario={eigrpDualScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
