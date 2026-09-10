"use client";

import { DhcpJourneyPlayer } from "./dhcp-journey-player";
import type { DhcpScenario } from "./dhcp.schema";
import { buildRelayJourney, relayScenarios } from "./relay-journeys";

export function DhcpRelayPlayer({ progressItemId, scenarios = relayScenarios }: { progressItemId?: string; scenarios?: readonly DhcpScenario[] }) {
  return <DhcpJourneyPlayer buildJourney={buildRelayJourney} legend="Choose a DHCP relay journey" mode="relay" progressItemId={progressItemId} scenarios={scenarios} title="Interactive DHCP relay and helper-address journey" />;
}
