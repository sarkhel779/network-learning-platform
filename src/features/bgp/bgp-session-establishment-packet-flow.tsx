"use client";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { bgpSessionEstablishmentScenario } from "./bgp-session-establishment.scenario";

export function BgpSessionEstablishmentPacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="interactive-bgp-session-establishment"
      inspectionDepthControl
      scenario={bgpSessionEstablishmentScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
