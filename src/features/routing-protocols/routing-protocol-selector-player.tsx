"use client";

import { useState } from "react";

import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";

import { protocolLabels, publicRoutingProtocolScenarios } from "./routing-protocol-scenarios.data";

export function RoutingProtocolSelectorPlayer({ progressItemId }: { progressItemId?: string }) {
  const { markTerminalStateReached, state, retry } = useProgressCompletionBoundary(progressItemId);
  const [selectedId, setSelectedId] = useState(publicRoutingProtocolScenarios[0].id);
  const scenario = publicRoutingProtocolScenarios.find(({ id }) => id === selectedId)!;

  return (
    <section aria-labelledby="routing-protocol-selector-title" className="routing-protocol-selector-player">
      <h3 id="routing-protocol-selector-title">Pick the right routing protocol for the scenario</h3>
      <p>Change the scenario and see which protocol fits, and why the others fall short here.</p>

      <fieldset className="routing-protocol-selector-player__choices">
        <legend>Choose a network scenario</legend>
        {publicRoutingProtocolScenarios.map((item) => (
          <label key={item.id}>
            <input checked={item.id === selectedId} name="routing-protocol-scenario" onChange={() => setSelectedId(item.id)} type="radio" />
            {item.title}
          </label>
        ))}
      </fieldset>

      <div className="routing-protocol-selector-results" aria-live="polite">
        <section aria-labelledby="protocol-result-recommended"><h4 id="protocol-result-recommended">Recommended protocol</h4><p>{protocolLabels[scenario.recommended]}</p></section>
        <section aria-labelledby="protocol-result-reasoning"><h4 id="protocol-result-reasoning">Why</h4><p>{scenario.reasoning}</p></section>
      </div>

      {scenario.ruledOut.length > 0 ? (
        <div className="routing-protocol-selector-ruled-out" aria-labelledby="protocol-ruled-out-title">
          <h4 id="protocol-ruled-out-title">Why not the others</h4>
          <ul>
            {scenario.ruledOut.map(({ protocol, reason }) => (
              <li key={protocol}><strong>{protocolLabels[protocol]}:</strong> {reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <button type="button" onClick={markTerminalStateReached} disabled={state === "saving" || state === "saved"}>
        {state === "saved" ? "Scenario complete" : state === "saving" ? "Saving…" : "Finish scenario"}
      </button>
      {state === "error" ? <button type="button" onClick={() => void retry()}>Retry saving</button> : null}
    </section>
  );
}
