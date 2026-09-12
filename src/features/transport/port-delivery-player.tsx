"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";
import { TransportPacketTrack } from "./transport-packet-track";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";
import { buildPortDeliveryJourney, portDeliveryScenarios, udpPortDeliveryScenarios } from "./port-delivery-journeys";
import { parsePortDeliveryScenario, type PortDeliveryScenario } from "./transport.schema";
import { TransportPlayerControls } from "./transport-player-controls";

export function PortDeliveryPlayer({ progressItemId, scenarios = portDeliveryScenarios, title = "TCP vs UDP and Port Delivery" }: {
  progressItemId?: string;
  scenarios?: readonly PortDeliveryScenario[];
  title?: string;
}) {
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const preferenceResolved = useRef(false);
  const { markTerminalStateReached, state, retry } = useProgressCompletionBoundary(progressItemId);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [speed, setSpeed] = useState(1);
  const authoredScenario = scenarios[scenarioIndex];
  const scenario = useMemo(() => { try { return parsePortDeliveryScenario(authoredScenario); } catch { return null; } }, [authoredScenario]);
  const journey = useMemo(() => { try { return scenario ? buildPortDeliveryJourney(scenario) : null; } catch { return null; } }, [scenario]);
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

  if (!authoredScenario || !scenario || !journey || !step) return <section aria-labelledby="port-delivery-title" className="transport-player">
    <h3 id="port-delivery-title">{title}</h3>
    <p role="alert">This port-delivery scenario cannot be animated safely. Use the static explanation below.</p>
    <div aria-label="Static port-delivery evidence" role="region"><strong>{authoredScenario?.title ?? "Unavailable scenario"}</strong><p>{authoredScenario?.conclusion ?? "No trustworthy conclusion is available."}</p></div>
  </section>;

  const chooseScenario = (index: number) => { setScenarioIndex(index); setStepIndex(0); setPlaying(!reducedMotion); };
  return <section aria-labelledby="port-delivery-title" className="transport-player port-delivery-player">
    <h3 id="port-delivery-title">{title}</h3>
    <fieldset><legend>Choose a transport delivery journey</legend>{scenarios.map((item, index) => <label key={item.id}>
      <input checked={scenarioIndex === index} name="port-delivery-journey" onChange={() => chooseScenario(index)} type="radio" />{item.title}
    </label>)}</fieldset>
    <div aria-label="Transport delivery path" className="transport-topology" role="group">
      <div><strong>Sending application</strong><span>{scenario.sourceIp}:{scenario.sourcePort}</span></div>
      <div data-protocol={scenario.protocol}><strong>{scenario.protocol}</strong><span>{step.title}</span><TransportPacketTrack direction="forward" stepId={step.id} /></div>
      <div><strong>Receiving host</strong><span>{scenario.destinationIp}:{scenario.destinationPort}</span></div>
    </div>
    <TransportPlayerControls finalIndex={finalIndex} onNext={() => { setPlaying(false); setStepIndex((current) => current + 1); }} onPrevious={() => { setPlaying(false); setStepIndex((current) => current - 1); }} onRestart={() => { setStepIndex(0); setPlaying(!reducedMotion); }} onSpeedChange={setSpeed} onTogglePlay={() => setPlaying((current) => !current)} playing={playing} speed={speed} stepIndex={stepIndex} />
    <p aria-live="polite" role="status">Step {stepIndex + 1} of {journey.length}: {step.title}</p>
    <p>{step.explanation}</p>
    <p className="transport-tuple"><strong>Transport tuple:</strong> {step.tuple}</p>
    {step.relatedTuples.length > 1 ? <ul aria-label="Simultaneous transport conversations">{step.relatedTuples.map((tuple) => <li key={tuple}>{tuple}</li>)}</ul> : null}
    <div aria-label="Scrollable transport header evidence" className="transport-evidence-scroll" role="region" tabIndex={0}>
      <table><caption>{scenario.protocol} header evidence</caption><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>
        <tr><th scope="row">Source port</th><td>{scenario.sourcePort}</td></tr>
        <tr><th scope="row">Destination port</th><td>{scenario.destinationPort}</td></tr>
        {step.headerFields.map((field) => <tr key={field.label}><th scope="row">{field.label}</th><td>{field.value}</td></tr>)}
      </tbody></table>
    </div>
    <div className="transport-socket-result" data-match={step.listener ? "listener" : "none"}>
      <strong>Socket lookup</strong>
      <p>{step.application ? `${step.listener?.protocol} port ${step.listener?.port} → ${step.application}` : step.listener ? "Socket lookup pending" : stepIndex < 2 ? "Socket lookup pending" : `No ${scenario.protocol} listener on port ${scenario.destinationPort}`}</p>
    </div>
    {step.terminal ? <div className="transport-outcome"><strong>Conclusion</strong><p>{step.conclusion}</p></div> : null}
    {state === "error" ? <button onClick={retry}>Retry saving progress</button> : null}
  </section>;
}

export function UdpPortDeliveryPlayer({ progressItemId }: { progressItemId?: string }) {
  return <PortDeliveryPlayer progressItemId={progressItemId} scenarios={udpPortDeliveryScenarios} title="UDP Port Delivery" />;
}
