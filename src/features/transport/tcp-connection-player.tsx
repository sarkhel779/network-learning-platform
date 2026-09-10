"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";
import { buildTcpJourney, tcpScenarios } from "./tcp-journeys";
import { parseTcpScenario, type TcpScenario } from "./transport.schema";
import { TransportPlayerControls } from "./transport-player-controls";

export function TcpConnectionPlayer({ progressItemId, scenarios = tcpScenarios }: {
  progressItemId?: string;
  scenarios?: readonly TcpScenario[];
}) {
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const preferenceResolved = useRef(false);
  const { markTerminalStateReached, state, retry } = useProgressCompletionBoundary(progressItemId);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [speed, setSpeed] = useState(1);
  const authoredScenario = scenarios[scenarioIndex];
  const scenario = useMemo(() => { try { return parseTcpScenario(authoredScenario); } catch { return null; } }, [authoredScenario]);
  const journey = useMemo(() => { try { return scenario ? buildTcpJourney(scenario) : null; } catch { return null; } }, [scenario]);
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

  if (!authoredScenario || !scenario || !journey || !step) return <section aria-labelledby="tcp-connection-title" className="transport-player">
    <h3 id="tcp-connection-title">TCP Connection Journey</h3>
    <p role="alert">This TCP scenario cannot be animated safely. Use the static explanation below.</p>
    <div aria-label="Static TCP evidence" role="region"><strong>{authoredScenario?.title ?? "Unavailable scenario"}</strong><p>{authoredScenario?.conclusion ?? "No trustworthy conclusion is available."}</p></div>
  </section>;

  const chooseScenario = (index: number) => { setScenarioIndex(index); setStepIndex(0); setPlaying(!reducedMotion); };
  const flags = step.flags.length ? step.flags.join(", ") : "None";
  return <section aria-labelledby="tcp-connection-title" className="transport-player tcp-connection-player">
    <h3 id="tcp-connection-title">TCP Connection Journey</h3>
    <fieldset><legend>Choose a TCP journey</legend>{scenarios.map((item, index) => <label key={item.id}>
      <input checked={scenarioIndex === index} name="tcp-journey" onChange={() => chooseScenario(index)} type="radio" />{item.title}
    </label>)}</fieldset>
    <div aria-label="TCP endpoint topology" className="transport-topology" role="group">
      <div><strong>{scenario.client.label}</strong><span>Client: {step.clientState}</span></div>
      <div aria-label="Packet direction" data-direction={step.direction}>{step.direction === "none" ? "No packet crossing" : step.direction === "client-to-server" ? "Client → Server" : "Server → Client"}</div>
      <div><strong>{scenario.server.label}</strong><span>Server: {step.serverState}</span></div>
    </div>
    <p aria-live="polite" role="status">Step {stepIndex + 1} of {journey.length}: {step.title}</p>
    <p>{step.explanation}</p>
    <div aria-label="Scrollable TCP packet evidence" className="transport-evidence-scroll" role="region" tabIndex={0}>
      <table><caption>TCP evidence for {step.title}</caption><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>
        <tr><th scope="row">Flags</th><td>{flags}</td></tr>
        <tr><th scope="row">Sequence number</th><td>{step.sequenceNumber ?? "Not present"}</td></tr>
        <tr><th scope="row">Acknowledgement number</th><td>{step.acknowledgementNumber ?? "Not present"}</td></tr>
        <tr><th scope="row">Payload</th><td>{step.payloadBytes} bytes</td></tr>
        <tr><th scope="row">Receive window</th><td>{step.receiveWindow ?? "Not advertised"}</td></tr>
      </tbody></table>
    </div>
    <p><strong>Observed state:</strong> {step.outcome}</p>
    {step.terminal ? <div className="transport-outcome"><strong>Conclusion</strong><p>{scenario.conclusion}</p></div> : null}
    <TransportPlayerControls finalIndex={finalIndex} onNext={() => { setPlaying(false); setStepIndex((current) => current + 1); }} onPrevious={() => { setPlaying(false); setStepIndex((current) => current - 1); }} onRestart={() => { setStepIndex(0); setPlaying(!reducedMotion); }} onSpeedChange={setSpeed} onTogglePlay={() => setPlaying((current) => !current)} playing={playing} speed={speed} stepIndex={stepIndex} />
    {state === "error" ? <button onClick={retry}>Retry saving progress</button> : null}
  </section>;
}
