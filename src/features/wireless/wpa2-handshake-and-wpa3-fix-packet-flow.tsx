"use client";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { wpa2HandshakeAndWpa3FixScenario } from "./wpa2-handshake-and-wpa3-fix.scenario";

export function Wpa2HandshakeAndWpa3FixPacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="interactive-wpa2-handshake-and-the-wpa3-fix"
      inspectionDepthControl
      scenario={wpa2HandshakeAndWpa3FixScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
