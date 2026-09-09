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
  progressItemId?: string;
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
  progressItemId,
}: {
  scenario: Parameters<typeof PacketFlowPlayer>[0]["scenario"];
  headingId?: string;
  suppressHeading?: boolean;
  selectedDeviceId?: string;
  onDeviceSelect?: (deviceId: string) => void;
  autoplay?: boolean;
  inspectionDepthControl?: boolean;
  progressItemId?: string;
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
      progressItemId={progressItemId}
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
  progressItemId,
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
        progressItemId={progressItemId}
      />
    </PacketFlowErrorBoundary>
  );
}

export function NetworkCommunicationPacketFlow({ progressItemId }: { progressItemId?: string }) {
  return (
    <PacketFlowExperience
      headingId="packet-journey"
      scenario={networkCommunicationScenario}
      suppressHeading
      progressItemId={progressItemId}
    />
  );
}
