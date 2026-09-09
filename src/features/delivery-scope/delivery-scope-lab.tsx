"use client";

import { useRef, useState } from "react";
import { evaluateDeliveryPrediction, type DeliveryPredictionResult } from "./evaluate-delivery";
import type { DeliveryScenario, RouterAction } from "./delivery-scope.schema";

const routerActions: RouterAction[] = ["not-in-path", "receive-local-only", "route-unicast", "multicast-disabled"];
const toggle = (items: string[], value: string) => items.includes(value) ? items.filter((item) => item !== value) : [...items, value];

export function DeliveryScopeLab({ scenarios, showAdvancedShortcut = false, onCompleted }: { scenarios: DeliveryScenario[]; showAdvancedShortcut?: boolean; onCompleted?: () => void }) {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [egress, setEgress] = useState<string[]>([]);
  const [receivers, setReceivers] = useState<string[]>([]);
  const [accepters, setAccepters] = useState<string[]>([]);
  const [routerAction, setRouterAction] = useState<RouterAction>("not-in-path");
  const [result, setResult] = useState<DeliveryPredictionResult>();
  const [checks, setChecks] = useState(0);
  const radios = useRef<Record<string, HTMLInputElement | null>>({});
  const scenario = scenarios.find(({ id }) => id === scenarioId) ?? scenarios[0];

  const resetFor = (id: string) => { setScenarioId(id); setEgress([]); setReceivers([]); setAccepters([]); setRouterAction("not-in-path"); setResult(undefined); setChecks(0); };
  const labelNodes = (ids: string[]) => ids.map((id) => scenario.nodes.find((node) => node.id === id)?.label ?? id).join(", ") || "None";
  const labelPorts = (ids: string[]) => ids.map((id) => scenario.ports.find((port) => port.id === id)?.label ?? id).join(", ") || "None";

  return <section aria-labelledby="delivery-lab-title" className="delivery-scope-lab">
    <h3 id="delivery-lab-title">Predict traffic delivery</h3>
    {showAdvancedShortcut && <button type="button" onClick={() => { const advanced = scenarios.find(({ difficulty }) => difficulty === "intermediate"); if (advanced) { resetFor(advanced.id); radios.current[advanced.id]?.focus(); } }}>I know this—proceed to advanced</button>}
    <fieldset className="delivery-scope-lab__scenarios"><legend>Practice scenario</legend>{scenarios.map((item) => <label key={item.id}><input checked={item.id === scenarioId} name="delivery-practice" onChange={() => resetFor(item.id)} ref={(node) => { radios.current[item.id] = node; }} type="radio" />{item.title}</label>)}</fieldset>
    <p><strong>Destination:</strong> {scenario.destinationLabel}</p>
    <div className="delivery-scope-lab__predictions">
      <fieldset><legend>Forwarding decision</legend>{scenario.ports.filter(({ id }) => id !== scenario.ingressPortId).map((port) => <label key={port.id}><input checked={egress.includes(port.id)} onChange={() => setEgress(toggle(egress, port.id))} type="checkbox" />Forward through {port.label}</label>)}</fieldset>
      <fieldset><legend>Interfaces that receive</legend>{scenario.nodes.filter(({ id }) => id !== "client").map((node) => <label key={node.id}><input checked={receivers.includes(node.id)} onChange={() => setReceivers(toggle(receivers, node.id))} type="checkbox" />Interface {node.label} receives</label>)}</fieldset>
      <fieldset><legend>Hosts that accept</legend>{scenario.nodes.filter(({ id }) => id !== "client").map((node) => <label key={node.id}><input checked={accepters.includes(node.id)} onChange={() => setAccepters(toggle(accepters, node.id))} type="checkbox" />Host {node.label} accepts</label>)}</fieldset>
      <label>Router action<select aria-label="Router action" onChange={(event) => setRouterAction(event.target.value as RouterAction)} value={routerAction}>{routerActions.map((action) => <option key={action} value={action}>{action.replaceAll("-", " ")}</option>)}</select></label>
    </div>
    <button type="button" onClick={() => { const evaluation = evaluateDeliveryPrediction(scenario, { egressPortIds: egress, receivingNodeIds: receivers, acceptingNodeIds: accepters, routerAction }); setChecks((count) => count + 1); setResult(evaluation); if (evaluation.correct) onCompleted?.(); }}>Check prediction</button>
    {result && <div className="delivery-scope-lab__result">
      <p aria-live="polite">Check {checks}: {result.correct ? "Correct" : "Review each distinction"}.</p>
      <section><h4>Forwarding decision</h4><p>{labelPorts(result.outcome.egressPortIds)}</p></section>
      <section><h4>Interfaces that receive</h4><p>{labelNodes(result.outcome.receivingNodeIds)}</p></section>
      <section><h4>Hosts that accept</h4><p>{labelNodes(result.outcome.acceptingNodeIds)}</p></section>
      <section><h4>Router boundary</h4><p>{result.outcome.routerAction.replaceAll("-", " ")}</p></section>
      <p>{result.outcome.explanation}</p>
      {!result.forwardedCorrect && <p><strong>Forwarding:</strong> {scenario.wrongAnswerExplanations.forwarded}</p>}
      {!result.receivedCorrect && <p><strong>Receipt:</strong> {scenario.wrongAnswerExplanations.received}</p>}
      {!result.acceptedCorrect && <p><strong>Acceptance:</strong> {scenario.wrongAnswerExplanations.accepted}</p>}
      {!result.routerCorrect && <p><strong>Router:</strong> {scenario.wrongAnswerExplanations.router}</p>}
    </div>}
  </section>;
}
