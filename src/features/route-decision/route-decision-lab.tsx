"use client";
import { useRef, useState, type FormEvent } from "react";
import { evaluateRoutePrediction } from "./evaluate-route-decision";
import type { LearnerRoutePrediction, RouteDecisionOutcome, RouteDecisionScenario } from "./route-decision.schema";

const scopes = ["on-link", "remote-via-gateway", "no-route", "local-broadcast"] as const;
const actions = ["direct-delivery", "route-unicast", "stop-broadcast", "host-routing-failure", "router-no-route"] as const;
const pretty = (value: string) => value.replaceAll("-", " ");

export function RouteDecisionLab({ scenarios, showAdvancedShortcut = false }: { scenarios: readonly RouteDecisionScenario[]; showAdvancedShortcut?: boolean }) {
  const advancedInput = useRef<HTMLInputElement>(null);
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "");
  const [scope, setScope] = useState<RouteDecisionOutcome["scope"]>();
  const [interfaceId, setInterfaceId] = useState("");
  const [nextHopIp, setNextHopIp] = useState("");
  const [boundaryAction, setBoundaryAction] = useState<RouteDecisionOutcome["boundaryAction"]>();
  const [result, setResult] = useState<ReturnType<typeof evaluateRoutePrediction>>();
  const scenario = scenarios.find(({ id }) => id === scenarioId);
  const advanced = scenarios.find(({ difficulty }) => difficulty === "intermediate");

  function reset() { setScope(undefined); setInterfaceId(""); setNextHopIp(""); setBoundaryAction(undefined); setResult(undefined); }
  function select(id: string) { setScenarioId(id); reset(); }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!scenario || !scope || !boundaryAction) return;
    const prediction: LearnerRoutePrediction = { scope, interfaceId: interfaceId || undefined, nextHopIp: nextHopIp || undefined, boundaryAction };
    setResult(evaluateRoutePrediction(scenario, prediction));
  }
  if (!scenario) return <p>Route-decision practice is unavailable. Review the routing evidence checklist below.</p>;

  const nextHops = Array.from(new Set([scenario.destinationIp, ...scenario.routes.flatMap(({ nextHop }) => nextHop ? [nextHop] : [])]));
  return <section className="route-decision-lab" aria-labelledby="route-lab-title">
    <h3 id="route-lab-title">Predict the route before revealing it</h3>
    {showAdvancedShortcut && advanced ? <button type="button" onClick={() => { select(advanced.id); queueMicrotask(() => advancedInput.current?.focus()); }}>I know this—proceed to advanced</button> : null}
    <form onSubmit={submit}>
      <fieldset><legend>Choose a practice scenario</legend><div className="route-decision-lab__choices">
        {scenarios.map((item) => <label key={item.id}><input ref={item.id === advanced?.id ? advancedInput : undefined} type="radio" name="route-practice-scenario" checked={item.id === scenarioId} onChange={() => select(item.id)} />{item.title}</label>)}
      </div></fieldset>
      <div className="route-decision-lab__evidence"><p><strong>Source:</strong> {scenario.sourceIp}/{scenario.sourcePrefixLength}</p><p><strong>Destination:</strong> {scenario.destinationIp}</p></div>
      <div className="route-decision-lab__predictions">
        <label>Destination scope<select value={scope ?? ""} onChange={(e) => { setScope(e.target.value as RouteDecisionOutcome["scope"]); setResult(undefined); }}><option value="">Choose</option>{scopes.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</select></label>
        <label>Outgoing interface<select value={interfaceId || "none"} onChange={(e) => { setInterfaceId(e.target.value === "none" ? "" : e.target.value); setResult(undefined); }}><option value="none">None</option>{scenario.interfaces.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}</select></label>
        <label>Next hop<select value={nextHopIp || "none"} onChange={(e) => { setNextHopIp(e.target.value === "none" ? "" : e.target.value); setResult(undefined); }}><option value="none">None</option>{nextHops.map((ip) => <option key={ip} value={ip}>{ip}</option>)}</select></label>
        <label>Boundary action<select value={boundaryAction ?? ""} onChange={(e) => { setBoundaryAction(e.target.value as RouteDecisionOutcome["boundaryAction"]); setResult(undefined); }}><option value="">Choose</option>{actions.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</select></label>
      </div>
      <button type="submit" disabled={!scope || !boundaryAction}>Check my route decision</button>
    </form>
    <p className="sr-only" role="status" aria-live="polite">{result ? (result.allCorrect ? "Correct route decision" : "Review this route decision") : ""}</p>
    {result ? <section aria-label="Route decision result" className="route-decision-lab__result"><h4>{result.allCorrect ? "Correct prediction" : "Review this prediction"}</h4>
      {!result.scopeCorrect && <p>{result.feedback.scope}</p>}{!result.interfaceCorrect && <p>{result.feedback.interface}</p>}{!result.nextHopCorrect && <p>{result.feedback.nextHop}</p>}{!result.boundaryCorrect && <p>{result.feedback.boundary}</p>}
      <p>{result.outcome.technicalExplanation}</p></section> : null}
  </section>;
}
