"use client";

import { DhcpJourneyPlayer } from "./dhcp-journey-player";
import { buildDoraJourney, doraScenarios } from "./dora-journeys";
import type { DhcpScenario } from "./dhcp.schema";

export function DoraPlayer({ progressItemId, scenarios = doraScenarios }: { progressItemId?: string; scenarios?: readonly DhcpScenario[] }) {
  return <DhcpJourneyPlayer buildJourney={buildDoraJourney} legend="Choose a direct DHCP journey" mode="direct" progressItemId={progressItemId} scenarios={scenarios} title="Interactive DHCP DORA journey" />;
}
