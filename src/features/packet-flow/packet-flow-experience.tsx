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
  autoplay?: boolean;
  inspectionDepthControl?: boolean;
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
  autoplay,
  inspectionDepthControl,
}: {
  scenario: Parameters<typeof PacketFlowPlayer>[0]["scenario"];
  headingId?: string;
  suppressHeading?: boolean;
  selectedDeviceId?: string;
  onDeviceSelect?: (deviceId: string) => void;
  autoplay?: boolean;
  inspectionDepthControl?: boolean;
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
      autoplay={autoplay}
      inspectionDepthControl={inspectionDepthControl}
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
  autoplay,
  inspectionDepthControl,
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
        autoplay={autoplay}
        inspectionDepthControl={inspectionDepthControl}
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
