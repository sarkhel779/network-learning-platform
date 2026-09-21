"use client";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { routeSelectionScenario } from "./route-selection.scenario";

export function RouteSelectionPacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="interactive-route-selection"
      inspectionDepthControl
      scenario={routeSelectionScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
