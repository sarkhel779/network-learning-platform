"use client";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { ipsecTunnelEstablishmentScenario } from "./ipsec-tunnel-establishment.scenario";

export function IpsecTunnelEstablishmentPacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="interactive-ipsec-tunnel-establishment"
      inspectionDepthControl
      scenario={ipsecTunnelEstablishmentScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
