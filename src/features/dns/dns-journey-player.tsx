"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";
import { TransportPlayerControls } from "@/features/transport/transport-player-controls";

import { DnsMessageInspector } from "./dns-message-inspector";
import { parseDnsScenario, type DnsScenario, type DnsStep } from "./dns.schema";
import { DnsTopology } from "./dns-topology";

export function DnsJourneyPlayer({ progressItemId, scenarios, buildJourney }: {
  progressItemId?: string;
  scenarios: readonly unknown[];
  buildJourney(scenario: DnsScenario): readonly DnsStep[];
}) {
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const preferenceResolved = useRef(false);
  const { markTerminalStateReached, state, retry } = useProgressCompletionBoundary(progressItemId);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [speed, setSpeed] = useState(1);
  const authored = scenarios[scenarioIndex];
  const scenario = useMemo(() => { try { return parseDnsScenario(authored); } catch { return null; } }, [authored]);
  const journey = useMemo(() => { try { return scenario ? buildJourney(scenario) : null; } catch { return null; } }, [buildJourney, scenario]);
  const finalIndex = (journey?.length ?? 1) - 1;
  const current = journey?.[Math.min(stepIndex, finalIndex)];

  useEffect(() => {
    if (!isHydrated) return;
    if (!preferenceResolved.current) { preferenceResolved.current = true; setPlaying(!reducedMotion); return; }
    if (reducedMotion) setPlaying(false);
  }, [isHydrated, reducedMotion]);
  useEffect(() => {
    if (!journey || !playing || stepIndex >= finalIndex) return;
    const timer = window.setTimeout(() => setStepIndex((value) => value + 1), 1900 / speed);
    return () => window.clearTimeout(timer);
  }, [finalIndex, journey, playing, speed, stepIndex]);
  useEffect(() => { if (current?.terminal) markTerminalStateReached(); }, [current, markTerminalStateReached]);

  if (!scenario || !journey || !current) return <section className="dns-player"><h3>Interactive complete DNS resolution</h3><p role="alert">This DNS scenario cannot be animated safely. Use the static lesson explanation.</p></section>;

  const choose = (index: number) => { setScenarioIndex(index); setStepIndex(0); setPlaying(!reducedMotion); };
  return <section className="dns-player">
    <h3>Interactive complete DNS resolution</h3>
    <fieldset><legend>Choose a DNS resolution journey</legend>{scenarios.map((item, index) => {
      const candidate = (() => { try { return parseDnsScenario(item); } catch { return null; } })();
      return candidate ? <label key={candidate.id}><input checked={scenarioIndex === index} name="dns-resolution-scenario" onChange={() => choose(index)} type="radio" />{candidate.title}</label> : null;
    })}</fieldset>
    <DnsTopology step={current} />
    <TransportPlayerControls finalIndex={finalIndex} onNext={() => { setPlaying(false); setStepIndex((value) => value + 1); }} onPrevious={() => { setPlaying(false); setStepIndex((value) => value - 1); }} onRestart={() => { setStepIndex(0); setPlaying(!reducedMotion); }} onSpeedChange={setSpeed} onTogglePlay={() => setPlaying((value) => !value)} playing={playing} speed={speed} stepIndex={stepIndex} />
    <p aria-live="polite" role="status">Step {stepIndex + 1} of {journey.length}: {current.title}</p>
    <p>{current.explanation}</p><p><strong>Evidence:</strong> {current.evidence}</p>
    <section className="dns-cache-state" aria-label="Resolver cache state"><strong>Cache: {current.cache.result}</strong><p>{current.cache.explanation}</p>{current.cache.entries.map((entry) => <p key={`${entry.name}-${entry.type}`}>{entry.name} {entry.type}: {entry.remainingTtl}s of {entry.originalTtl}s remaining</p>)}</section>
    <DnsMessageInspector message={current.message} />
    {current.terminal ? <div className="transport-outcome"><strong>Conclusion</strong><p>{scenario.conclusion}</p></div> : null}
    {state === "error" ? <button onClick={retry}>Retry saving progress</button> : null}
  </section>;
}
