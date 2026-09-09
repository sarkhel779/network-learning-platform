"use client";

import { safeParseDeliveryCatalog } from "./delivery-scope.schema";
import { DeliveryScopeLab } from "./delivery-scope-lab";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";

export function DeliveryScopeExperience({ scenarios, progressItemId }: { scenarios: unknown; progressItemId?: string }) {
  const { markTerminalStateReached } = useProgressCompletionBoundary(progressItemId);
  const parsed = safeParseDeliveryCatalog(scenarios);
  if (!parsed) return <section aria-labelledby="delivery-lab-unavailable"><h3 id="delivery-lab-unavailable">Delivery-scope lab unavailable</h3><p>Use this static evidence checklist:</p><ul><li>Read the destination address and delivery type.</li><li>Check learned switch and group state.</li><li>Trace forwarded ports, receiving interfaces, accepting hosts, and the router boundary separately.</li></ul></section>;
  return <DeliveryScopeLab scenarios={parsed} showAdvancedShortcut onCompleted={markTerminalStateReached} />;
}
