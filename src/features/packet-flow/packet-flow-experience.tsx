"use client";

import { useSyncExternalStore } from "react";

import { networkCommunicationScenario } from "./network-communication.scenario";
import { PacketFlowErrorBoundary, PacketFlowFallback } from "./packet-flow-error-boundary";
import { PacketFlowPlayer } from "./packet-flow-player";
import { safeParsePacketFlowScenario } from "./packet-flow.schema";

type PacketFlowExperienceProps = Readonly<{ scenario: unknown }>;

function subscribeToClientRender() {
  return () => undefined;
}

function ClientOnlyPacketFlowPlayer({ scenario }: { scenario: Parameters<typeof PacketFlowPlayer>[0]["scenario"] }) {
  const canRenderInteractively = useSyncExternalStore(
    subscribeToClientRender,
    () => true,
    () => false,
  );

  return canRenderInteractively ? <PacketFlowPlayer scenario={scenario} /> : <PacketFlowFallback />;
}

export function PacketFlowExperience({ scenario }: PacketFlowExperienceProps) {
  const parsedScenario = safeParsePacketFlowScenario(scenario);

  if (!parsedScenario.success) return <PacketFlowFallback />;

  return (
    <PacketFlowErrorBoundary>
      <ClientOnlyPacketFlowPlayer scenario={parsedScenario.data} />
    </PacketFlowErrorBoundary>
  );
}

export function NetworkCommunicationPacketFlow() {
  return <PacketFlowExperience scenario={networkCommunicationScenario} />;
}
