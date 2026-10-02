"use client";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { stickyClientRoamingScenario } from "./sticky-client-roaming.scenario";

export function StickyClientRoamingPacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="interactive-the-sticky-client-and-the-roaming-trigger"
      inspectionDepthControl
      scenario={stickyClientRoamingScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
