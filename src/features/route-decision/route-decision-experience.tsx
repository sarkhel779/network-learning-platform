import { safeParseRouteDecisionCatalog } from "./route-decision.schema";
import { RouteDecisionLab } from "./route-decision-lab";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";

export function RouteDecisionExperience({ scenarios, progressItemId }: { scenarios: unknown; progressItemId?: string }) {
  const { markTerminalStateReached } = useProgressCompletionBoundary(progressItemId);
  const parsed = safeParseRouteDecisionCatalog(scenarios);
  if (!parsed.success) return <section aria-label="Routing evidence checklist"><h3>Routing evidence checklist</h3><ol><li>Confirm the host address and configured prefix.</li><li>Identify matching routes and the most specific prefix.</li><li>Verify the outgoing interface and that the next hop is on-link.</li><li>Separate host failure from router-side no-route evidence.</li></ol></section>;
  return <RouteDecisionLab scenarios={parsed.data} showAdvancedShortcut onCompleted={markTerminalStateReached} />;
}
"use client";
