"use client";

import { useEffect, useMemo, useState } from "react";
import { PLAYBACK_SPEEDS } from "@/features/packet-flow/packet-flow.schema";
import { useReducedMotion } from "@/features/packet-flow/use-reduced-motion";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";
import { routeDecisionScenarios } from "./route-decision.scenarios";
import { selectRoute, type RouteCriterion } from "./select-route";

const labels: Record<RouteCriterion, string> = {
  "address-family": "Address family", "prefix-match": "Matching prefix",
  "longest-prefix": "Longest prefix", "administrative-distance": "Administrative distance",
  metric: "Comparable metric",
};
const STEP_COUNT = 6;

export function RoutingTableDecisionPlayer({ progressItemId }: { progressItemId?: string }) {
  const reducedMotion = useReducedMotion();
  const { markTerminalStateReached } = useProgressCompletionBoundary(progressItemId);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [speed, setSpeed] = useState(1);
  const scenario = routeDecisionScenarios[scenarioIndex];
  const trace = useMemo(() => selectRoute(scenario), [scenario]);
  const stage = trace.stages[Math.min(step, trace.stages.length - 1)];

  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);
  useEffect(() => {
    if (!playing || step === STEP_COUNT - 1) return;
    const timer = window.setTimeout(() => setStep((current) => current + 1), 1800 / speed);
    return () => window.clearTimeout(timer);
  }, [playing, speed, step]);
  useEffect(() => { if (step === STEP_COUNT - 1) markTerminalStateReached(); }, [markTerminalStateReached, step]);

  const chooseScenario = (index: number) => { setScenarioIndex(index); setStep(0); setPlaying(!reducedMotion); };
  const outcomeText = trace.outcome.kind === "no-route" ? "No usable route: discard the packet." : `${trace.outcome.kind === "equal-cost" ? "Equal-cost routes" : "Selected route"}: ${trace.outcome.routeIds.join(", ")}.`;

  return <section aria-labelledby="routing-decision-title" className="routing-decision-player">
    <h3 id="routing-decision-title">Choose the route in the correct order</h3>
    <fieldset><legend>Choose a routing-table scenario</legend>{routeDecisionScenarios.map((item, index) => <label key={item.id}><input checked={index === scenarioIndex} name="routing-decision-scenario" onChange={() => chooseScenario(index)} type="radio" />{item.title}</label>)}</fieldset>
    <p><strong>Destination:</strong> {scenario.destination} ({scenario.family.toUpperCase()})</p>
    <p aria-live="polite">Step {step + 1} of {STEP_COUNT}: {step < 5 ? labels[stage.criterion] : "Forwarding result"}</p>
    <div aria-label="Scrollable routing table" className="routing-table-scroll" role="region" tabIndex={0}>
      <table aria-label={`Routes considered for ${scenario.title}`}>
        <caption>Routes considered for {scenario.title}</caption>
        <thead><tr><th>Source</th><th>Prefix</th><th>Next hop</th><th>Outgoing interface</th><th>Administrative distance</th><th>Metric</th><th>Decision</th></tr></thead>
        <tbody>{scenario.routes.map((route) => { const result = stage.candidates.find(({ routeId }) => routeId === route.id)!; return <tr data-status={result.status} key={route.id}><td>{route.source}</td><td><code>{route.prefix}</code></td><td><code>{route.nextHop ?? "Directly connected"}</code></td><td>{route.outgoingInterface}</td><td>{route.administrativeDistance}</td><td>{route.metric}</td><td>{result.status === "retained" ? "Retained" : "Rejected"}: {result.reason}</td></tr>; })}</tbody>
      </table>
    </div>
    {step === STEP_COUNT - 1 ? <div className="routing-outcome" role="status"><strong>{outcomeText}</strong><p>{scenario.plainLanguageConclusion}</p></div> : null}
    <div className="player-controls">
      <button disabled={step === 0} onClick={() => { setPlaying(false); setStep((current) => current - 1); }}>Previous</button>
      <button disabled={step === STEP_COUNT - 1} onClick={() => setPlaying((current) => !current)}>{playing ? "Pause" : "Play"}</button>
      <button disabled={step === STEP_COUNT - 1} onClick={() => { setPlaying(false); setStep((current) => current + 1); }}>Next</button>
      <button onClick={() => { setStep(0); setPlaying(!reducedMotion); }}>Restart</button>
      <label>Playback speed <select aria-label="Playback speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>{PLAYBACK_SPEEDS.map((value) => <option key={value} value={value}>{value}×</option>)}</select></label>
    </div>
  </section>;
}
