"use client";

import { PacketFlowExperience } from "@/features/packet-flow/packet-flow-experience";

import { sshKeyAuthenticationScenario } from "./ssh-key-authentication.scenario";

export function SshKeyAuthenticationPacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="interactive-ssh-key-authentication"
      inspectionDepthControl
      scenario={sshKeyAuthenticationScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
