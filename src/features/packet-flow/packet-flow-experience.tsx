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
  selectedDeviceId?: string;
  onDeviceSelect?: (deviceId: string) => void;
}>;

function subscribeToClientRender() {
  return () => undefined;
}

function ClientOnlyPacketFlowPlayer({
  scenario,
  headingId,
  suppressHeading,
  selectedDeviceId,
  onDeviceSelect,
}: {
  scenario: Parameters<typeof PacketFlowPlayer>[0]["scenario"];
  headingId?: string;
  suppressHeading?: boolean;
  selectedDeviceId?: string;
  onDeviceSelect?: (deviceId: string) => void;
}) {
  const canRenderInteractively = useSyncExternalStore(
    subscribeToClientRender,
    () => true,
    () => false,
  );

  return canRenderInteractively ? (
    <PacketFlowPlayer
      headingId={headingId}
      scenario={scenario}
      suppressHeading={suppressHeading}
      selectedDeviceId={selectedDeviceId}
      onDeviceSelect={onDeviceSelect}
    />
  ) : (
    <PacketFlowFallback />
  );
}

export function PacketFlowExperience({
  scenario,
  headingId,
  suppressHeading,
  selectedDeviceId,
  onDeviceSelect,
}: PacketFlowExperienceProps) {
  const parsedScenario = safeParsePacketFlowScenario(scenario);

  if (!parsedScenario.success) return <PacketFlowFallback />;

  return (
    <PacketFlowErrorBoundary>
      <ClientOnlyPacketFlowPlayer
        headingId={headingId}
        scenario={parsedScenario.data}
        suppressHeading={suppressHeading}
        selectedDeviceId={selectedDeviceId}
        onDeviceSelect={onDeviceSelect}
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
