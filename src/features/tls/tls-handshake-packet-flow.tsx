"use client";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { tlsHandshakeScenario } from "./tls-handshake.scenario";

export function TlsHandshakePacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="interactive-tls-handshake"
      inspectionDepthControl
      scenario={tlsHandshakeScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
