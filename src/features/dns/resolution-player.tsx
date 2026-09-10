"use client";

import { DnsJourneyPlayer } from "./dns-journey-player";
import { buildResolutionJourney, resolutionScenarios } from "./resolution-journeys";

export function DnsResolutionPlayer({ progressItemId, scenarios = resolutionScenarios }: { progressItemId?: string; scenarios?: readonly unknown[] }) {
  return <DnsJourneyPlayer buildJourney={buildResolutionJourney} progressItemId={progressItemId} scenarios={scenarios} />;
}
