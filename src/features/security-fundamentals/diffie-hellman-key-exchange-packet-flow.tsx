"use client";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { diffieHellmanKeyExchangeScenario } from "./diffie-hellman-key-exchange.scenario";

export function DiffieHellmanKeyExchangePacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="interactive-diffie-hellman-key-exchange"
      inspectionDepthControl
      scenario={diffieHellmanKeyExchangeScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
