"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PLAYBACK_SPEEDS } from "@/features/packet-flow/packet-flow.schema";
import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";
import { parsePingScenario, type PingScenario } from "./icmp.schema";
import { buildPingJourney, pingScenarios } from "./ping-journeys";

export function PingEvidencePlayer({ progressItemId, scenarios = pingScenarios }: {
  progressItemId?: string; scenarios?: readonly PingScenario[];
}) {
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const preferenceResolved = useRef(false);
  const { markTerminalStateReached, state, retry } = useProgressCompletionBoundary(progressItemId);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [speed, setSpeed] = useState(1);
  const scenario = scenarios[scenarioIndex];
  const parsed = useMemo(() => { try { return parsePingScenario(scenario); } catch { return null; } }, [scenario]);
  const journey = useMemo(() => { try { return parsed ? buildPingJourney(parsed) : null; } catch { return null; } }, [parsed]);
  const step = journey?.[Math.min(stepIndex, journey.length - 1)];
  const finalIndex = (journey?.length ?? 1) - 1;

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

  if (!scenario || !parsed || !journey || !step) return <section aria-labelledby="ping-evidence-title" className="ping-evidence-player">
    <h3 id="ping-evidence-title">Follow ping and read the ICMP evidence</h3>
    <p role="alert">This ICMP scenario cannot be animated safely. Use the static ICMP evidence below.</p>
    <div aria-label="Static ICMP evidence" className="icmp-evidence-scroll" role="region" tabIndex={0}>
      <p><strong>{scenario?.title ?? "Unavailable scenario"}</strong></p>
      <p>{scenario?.conclusion ?? "No trustworthy scenario conclusion is available."}</p>
    </div>
  </section>;

  const chooseScenario = (index: number) => { setScenarioIndex(index); setStepIndex(0); setPlaying(!reducedMotion); };
  return <section aria-labelledby="ping-evidence-title" className="ping-evidence-player">
    <h3 id="ping-evidence-title">Follow ping and read the ICMP evidence</h3>
    <fieldset><legend>Choose a ping outcome</legend>{scenarios.map((item, index) => <label key={item.id}>
      <input checked={index === scenarioIndex} name="ping-evidence-scenario" onChange={() => chooseScenario(index)} type="radio" />{item.title}
    </label>)}</fieldset>
    <ol aria-label="Ping path topology" className="icmp-topology">{parsed.devices.map((device) => <li data-active={step.activeDeviceIds.includes(device.id)} key={device.id}><strong>{device.label}</strong><span>{device.role}</span></li>)}</ol>
    <div className="player-controls">
      <button disabled={stepIndex === 0} onClick={() => { setPlaying(false); setStepIndex((current) => current - 1); }}>Previous</button>
      <button disabled={stepIndex === finalIndex} onClick={() => setPlaying((current) => !current)}>{playing ? "Pause" : "Play"}</button>
      <button disabled={stepIndex === finalIndex} onClick={() => { setPlaying(false); setStepIndex((current) => current + 1); }}>Next</button>
      <button onClick={() => { setStepIndex(0); setPlaying(!reducedMotion); }}>Restart</button>
      <label>Playback speed <select aria-label="Playback speed" onChange={(event) => setSpeed(Number(event.target.value))} value={speed}>{PLAYBACK_SPEEDS.map((value) => <option key={value} value={value}>{value}×</option>)}</select></label>
    </div>
    <p aria-live="polite" role="status">Step {stepIndex + 1} of {journey.length}: {step.title}</p>
    {!step.terminal ? <p>{step.explanation}</p> : null}
    {step.packet ? <p className="icmp-packet"><strong>{step.packet.label}</strong><span>{step.packet.direction === "request" ? "Outbound request" : "Returning response"}</span></p> : null}
    {step.ttl !== null ? <p><strong>TTL: {step.ttl}</strong></p> : null}
    <div aria-label="Scrollable ICMP packet evidence" className="icmp-evidence-scroll" role="region" tabIndex={0}>
      <table><caption>Evidence for {step.title}</caption><thead><tr><th>Field</th><th>Value</th><th>Layer</th></tr></thead>
        <tbody>{step.evidence.map((field) => <tr key={field.label}><th scope="row">{field.label}</th><td>{field.value}</td><td>{field.layer}</td></tr>)}</tbody></table>
    </div>
    {step.terminal ? <div className="icmp-outcome"><strong>Conclusion</strong><p>{parsed.conclusion}</p></div> : null}
    {state === "error" ? <button onClick={retry}>Retry saving progress</button> : null}
  </section>;
}
