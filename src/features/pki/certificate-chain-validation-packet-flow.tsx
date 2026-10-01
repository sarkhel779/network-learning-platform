"use client";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { certificateChainValidationScenario } from "./certificate-chain-validation.scenario";

export function CertificateChainValidationPacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="interactive-certificate-chain-validation"
      inspectionDepthControl
      scenario={certificateChainValidationScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
