"use client";

import { useSyncExternalStore } from "react";

import { networkCommunicationScenario } from "./network-communication.scenario";
import { PacketFlowErrorBoundary, PacketFlowFallback } from "./packet-flow-error-boundary";
import { PacketFlowPlayer } from "./packet-flow-player";
import { safeParsePacketFlowScenario } from "./packet-flow.schema";

type PacketFlowExperienceProps = Readonly<{
  scenario: unknown;
  headingId?: string;
  suppressHeading?: boolean;
}>;

function subscribeToClientRender() {
  return () => undefined;
}

function ClientOnlyPacketFlowPlayer({
  scenario,
  headingId,
  suppressHeading,
}: {
  scenario: Parameters<typeof PacketFlowPlayer>[0]["scenario"];
  headingId?: string;
  suppressHeading?: boolean;
}) {
  const canRenderInteractively = useSyncExternalStore(
    subscribeToClientRender,
    () => true,
    () => false,
  );

  return canRenderInteractively ? (
    <PacketFlowPlayer headingId={headingId} scenario={scenario} suppressHeading={suppressHeading} />
  ) : (
    <PacketFlowFallback />
  );
}

export function PacketFlowExperience({ scenario, headingId, suppressHeading }: PacketFlowExperienceProps) {
  const parsedScenario = safeParsePacketFlowScenario(scenario);

  if (!parsedScenario.success) return <PacketFlowFallback />;

  return (
    <PacketFlowErrorBoundary>
      <ClientOnlyPacketFlowPlayer
        headingId={headingId}
        scenario={parsedScenario.data}
        suppressHeading={suppressHeading}
      />
    </PacketFlowErrorBoundary>
  );
}

export function NetworkCommunicationPacketFlow() {
  return (
    <PacketFlowExperience
      headingId="packet-journey"
      scenario={networkCommunicationScenario}
      suppressHeading
    />
  );
}
