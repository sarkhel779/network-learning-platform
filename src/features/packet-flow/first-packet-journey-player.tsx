"use client";

import { networkCommunicationScenario } from "./network-communication.scenario";
import { PacketFlowExperience } from "./packet-flow-experience";

export function FirstPacketJourneyPlayer({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      autoplay
      headingId="complete-packet-journey"
      inspectionDepthControl
      scenario={networkCommunicationScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
