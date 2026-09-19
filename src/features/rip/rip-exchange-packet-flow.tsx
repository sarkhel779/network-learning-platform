"use client";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { ripExchangeScenario } from "./rip-exchange.scenario";

export function RipExchangePacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="interactive-rip-exchange"
      inspectionDepthControl
      scenario={ripExchangeScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
