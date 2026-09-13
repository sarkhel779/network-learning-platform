"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";
import { TransportPlayerControls } from "@/features/transport/transport-player-controls";

import { DhcpPacketInspector } from "./dhcp-packet-inspector";
import { parseDhcpScenario, type DhcpScenario, type DhcpStep } from "./dhcp.schema";
import { DhcpTopology } from "./dhcp-topology";

export function DhcpJourneyPlayer({ title, legend, mode, progressItemId, scenarios, buildJourney }: {
  title: string;
  legend: string;
  mode: "direct" | "relay";
  progressItemId?: string;
  scenarios: readonly DhcpScenario[];
  buildJourney(scenario: DhcpScenario): readonly DhcpStep[];
}) {
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const preferenceResolved = useRef(false);
  const { markTerminalStateReached, state, retry } = useProgressCompletionBoundary(progressItemId);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [speed, setSpeed] = useState(1);
  const authored = scenarios[scenarioIndex];
  const scenario = useMemo(() => { try { return parseDhcpScenario(authored); } catch { return null; } }, [authored]);
  const journey = useMemo(() => { try { return scenario ? buildJourney(scenario) : null; } catch { return null; } }, [buildJourney, scenario]);
  const finalIndex = (journey?.length ?? 1) - 1;
  const step = journey?.[Math.min(stepIndex, finalIndex)];

  useEffect(() => {
    if (!isHydrated) return;
    if (!preferenceResolved.current) { preferenceResolved.current = true; setPlaying(!reducedMotion); return; }
    if (reducedMotion) setPlaying(false);
  }, [isHydrated, reducedMotion]);
  useEffect(() => {
    if (!journey || !playing || stepIndex >= finalIndex) return;
    const timer = window.setTimeout(() => setStepIndex((current) => current + 1), 1900 / speed);
    return () => window.clearTimeout(timer);
  }, [finalIndex, journey, playing, speed, stepIndex]);
  useEffect(() => { if (step?.terminal) markTerminalStateReached(); }, [markTerminalStateReached, step]);

  if (!authored || !scenario || !journey || !step) return <section className="dhcp-player"><h3>{title}</h3><p role="alert">This DHCP scenario cannot be animated safely. Use the static lesson explanation.</p></section>;

  const choose = (index: number) => { setScenarioIndex(index); setStepIndex(0); setPlaying(!reducedMotion); };
  return <section className="dhcp-player">
    <h3>{title}</h3>
    <fieldset><legend>{legend}</legend>{scenarios.map((item, index) => <label key={item.id}><input checked={index === scenarioIndex} name={`${mode}-dhcp-scenario`} onChange={() => choose(index)} type="radio" />{item.title}</label>)}</fieldset>
    <DhcpTopology mode={mode} step={step} />
    <TransportPlayerControls finalIndex={finalIndex} onNext={() => { setPlaying(false); setStepIndex((current) => current + 1); }} onPrevious={() => { setPlaying(false); setStepIndex((current) => current - 1); }} onRestart={() => { setStepIndex(0); setPlaying(!reducedMotion); }} onSpeedChange={setSpeed} onTogglePlay={() => setPlaying((current) => !current)} playing={playing} speed={speed} stepIndex={stepIndex} />
    <p aria-live="polite" role="status">Step {stepIndex + 1} of {journey.length}: {step.title}</p>
    <p><strong>UDP {step.packet.udp.sourcePort} → {step.packet.udp.destinationPort}</strong> · {step.packet.deliveryMode}</p>
    <p><strong>Client:</strong> {step.clientState} · <strong>Server:</strong> {step.serverState}</p>
    <p>{step.explanation}</p><p><strong>Evidence:</strong> {step.evidence}</p>
    <DhcpPacketInspector packet={step.packet} />
    {step.terminal ? <div className="transport-outcome"><strong>Conclusion</strong><p>{scenario.conclusion}</p></div> : null}
    {state === "error" ? <button onClick={retry}>Retry saving progress</button> : null}
  </section>;
}
