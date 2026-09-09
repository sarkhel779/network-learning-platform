"use client";

import { useState } from "react";
import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";
import { evaluateDelivery } from "./evaluate-delivery";
import { publicDeliveryDemonstrations } from "./delivery-scope.data";

function labels(ids: string[], kind: "port" | "node") {
  const scenario = publicDeliveryDemonstrations[0];
  const records = kind === "port" ? scenario.ports : scenario.nodes;
  return ids.map((id) => records.find((record) => record.id === id)?.label ?? id).join(", ");
}

export function DeliveryScopePlayer({ progressItemId }: { progressItemId?: string }) {
  const { markTerminalStateReached, state, retry } = useProgressCompletionBoundary(progressItemId);
  const [selectedId, setSelectedId] = useState(publicDeliveryDemonstrations[0].id);
  const scenario = publicDeliveryDemonstrations.find(({ id }) => id === selectedId)!;
  const outcome = evaluateDelivery(scenario);
  const { reducedMotion, isHydrated } = useReducedMotionState();

  return (
    <section aria-labelledby="delivery-player-title" className="delivery-scope-player" data-motion={reducedMotion || !isHydrated ? "reduced" : "travel"}>
      <h3 id="delivery-player-title">Trace who receives—and who accepts—the traffic</h3>
      <fieldset className="delivery-scope-player__choices">
        <legend>Choose a delivery scenario</legend>
        {publicDeliveryDemonstrations.map((item) => <label key={item.id}><input checked={item.id === selectedId} name="delivery-demonstration" onChange={() => setSelectedId(item.id)} type="radio" />{item.title}</label>)}
      </fieldset>
      <div aria-label="Sender through a switch to three hosts, a router, and a remote host" className="delivery-scope-topology" role="img">
        <span>Sender</span><span aria-hidden="true">→</span><span>Switch</span><span aria-hidden="true">→</span><span>Hosts B, C and D · Router · Remote host beyond router</span>
      </div>
      <p><strong>Destination scope:</strong> {scenario.destinationLabel}</p>
      <p><strong>Switch cue:</strong> {scenario.deliveryKind === "unknown-unicast" ? "Flooded, still unicast" : scenario.deliveryKind}</p>
      <div className="delivery-scope-results">
        <section aria-labelledby="forwarded-result"><h4 id="forwarded-result">Forwarded</h4><p>{labels(outcome.egressPortIds, "port") || "No egress port"}</p></section>
        <section aria-labelledby="received-result"><h4 id="received-result">Received</h4><p>{labels(outcome.receivingNodeIds, "node") || "No interface"}</p></section>
        <section aria-labelledby="accepted-result"><h4 id="accepted-result">Accepted</h4><p>{labels(outcome.acceptingNodeIds, "node") || "No host"}</p></section>
        <section aria-labelledby="router-result"><h4 id="router-result">Router boundary</h4><p>{outcome.routerAction.replaceAll("-", " ")}</p></section>
      </div>
      <p aria-live="polite">{outcome.explanation}</p>
      <button type="button" onClick={markTerminalStateReached} disabled={state === "saving" || state === "saved"}>
        {state === "saved" ? "Scenario complete" : state === "saving" ? "Saving…" : "Finish scenario"}
      </button>
      {state === "error" ? <button type="button" onClick={() => void retry()}>Retry saving</button> : null}
    </section>
  );
}
