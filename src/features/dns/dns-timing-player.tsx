"use client";

import { useState } from "react";
import { TransportPlayerControls } from "@/features/transport/transport-player-controls";
import { dnsTimingScenarios } from "./dns-pro.data";

export function DnsTimingPlayer() {
  const [scenarioId, setScenarioId] = useState(dnsTimingScenarios[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const scenario = dnsTimingScenarios.find(({ id }) => id === scenarioId) ?? dnsTimingScenarios[0];
  const event = scenario.events[stepIndex];
  const choose = (id: string) => { setScenarioId(id); setStepIndex(0); };
  return <section className="dns-timing-player"><h3>DNS timing diagram</h3>
    <label>Timing scenario <select aria-label="Timing scenario" value={scenario.id} onChange={(change) => choose(change.target.value)}>{dnsTimingScenarios.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
    <p aria-live="polite" role="status">{event.milliseconds} ms — {event.title}</p><p>{event.explanation}</p><p><strong>Cache:</strong> {event.cacheState}</p>
    <TransportPlayerControls finalIndex={scenario.events.length - 1} onNext={() => setStepIndex((value) => value + 1)} onPrevious={() => setStepIndex((value) => value - 1)} onRestart={() => setStepIndex(0)} onSpeedChange={() => undefined} onTogglePlay={() => undefined} playing={false} speed={1} stepIndex={stepIndex} />
  </section>;
}
