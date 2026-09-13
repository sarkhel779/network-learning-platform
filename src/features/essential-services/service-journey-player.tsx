"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";
import { TransportPlayerControls } from "@/features/transport/transport-player-controls";

import { PortTransportPanel } from "./port-transport-panel";
import { ProtocolMessageInspector } from "./protocol-message-inspector";
import { serviceScenarios } from "./service-scenarios";
import { parseServiceScenario, type ServiceId } from "./essential-services.schema";
import { serviceLabel, ServiceTopology } from "./service-topology";

type Props = { service: ServiceId; progressItemId?: string; scenario?: unknown };

export function ServiceJourneyPlayer({ service, progressItemId, scenario: suppliedScenario }: Props) {
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const preferenceResolved = useRef(false);
  const { markTerminalStateReached, retry, state } = useProgressCompletionBoundary(progressItemId);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [speed, setSpeed] = useState(1);
  const authored = suppliedScenario ?? serviceScenarios[service];
  const scenario = useMemo(() => { try { return parseServiceScenario(authored); } catch { return null; } }, [authored]);
  const finalIndex = (scenario?.steps.length ?? 1) - 1;
  const current = scenario?.steps[Math.min(stepIndex, finalIndex)];

  useEffect(() => {
    if (!isHydrated) return;
    if (!preferenceResolved.current) { preferenceResolved.current = true; setPlaying(!reducedMotion); return; }
    if (reducedMotion) setPlaying(false);
  }, [isHydrated, reducedMotion]);
  useEffect(() => {
    if (!scenario || !playing || stepIndex >= finalIndex) return;
    const timer = window.setTimeout(() => setStepIndex((value) => value + 1), 1900 / speed);
    return () => window.clearTimeout(timer);
  }, [finalIndex, playing, scenario, speed, stepIndex]);
  useEffect(() => { if (current?.terminal) markTerminalStateReached(); }, [current, markTerminalStateReached]);

  if (!scenario || !current || scenario.service !== service) {
    return <section className="service-player"><h3>Interactive service journey</h3><p role="alert">This service scenario cannot be animated safely. Use the static lesson explanation.</p></section>;
  }

  return <section className="service-player" aria-label={`${serviceLabel(service)} service journey`}>
    <h3>{scenario.title}</h3>
    <ServiceTopology service={service} step={current} />
    <TransportPlayerControls finalIndex={finalIndex} onNext={() => { setPlaying(false); setStepIndex((value) => Math.min(finalIndex, value + 1)); }} onPrevious={() => { setPlaying(false); setStepIndex((value) => Math.max(0, value - 1)); }} onRestart={() => { setStepIndex(0); setPlaying(!reducedMotion); }} onSpeedChange={setSpeed} onTogglePlay={() => setPlaying((value) => !value)} playing={playing} speed={speed} stepIndex={stepIndex} />
    <p aria-live="polite" role="status">Step {stepIndex + 1} of {scenario.steps.length}: {current.title}</p>
    <p>{current.explanation}</p>
    <p><strong>Active transport:</strong> {current.transport} {current.sourcePort} → {current.destinationPort}</p>
    <p><strong>Capture evidence:</strong> <code>{current.evidence}</code></p>
    <PortTransportPanel service={service} />
    <ProtocolMessageInspector message={current.message} />
    {current.terminal ? <div className="transport-outcome"><strong>Conclusion</strong><p>{scenario.conclusion}</p></div> : null}
    {state === "error" ? <button onClick={retry}>Retry saving progress</button> : null}
  </section>;
}
