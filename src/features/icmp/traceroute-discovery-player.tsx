"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PLAYBACK_SPEEDS } from "@/features/packet-flow/packet-flow.schema";
import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";
import { buildTracerouteJourney, parseTracerouteScenario, tracerouteScenarios, type TracerouteScenario } from "./traceroute-journeys";

export function TracerouteDiscoveryPlayer({ progressItemId, scenarios = tracerouteScenarios }: { progressItemId?: string; scenarios?: readonly TracerouteScenario[] }) {
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const preferenceResolved = useRef(false);
  const { markTerminalStateReached, state, retry } = useProgressCompletionBoundary(progressItemId);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [speed, setSpeed] = useState(1);
  const scenario = scenarios[scenarioIndex];
  const parsed = useMemo(() => { try { return parseTracerouteScenario(scenario); } catch { return null; } }, [scenario]);
  const journey = useMemo(() => { try { return parsed ? buildTracerouteJourney(parsed) : null; } catch { return null; } }, [parsed]);
  const step = journey?.[Math.min(stepIndex, journey.length - 1)];
  const finalIndex = (journey?.length ?? 1) - 1;
  useEffect(() => { if (!isHydrated) return; if (!preferenceResolved.current) { preferenceResolved.current = true; setPlaying(!reducedMotion); return; } if (reducedMotion) setPlaying(false); }, [isHydrated, reducedMotion]);
  useEffect(() => { if (!journey || !playing || stepIndex >= finalIndex) return; const timer = window.setTimeout(() => setStepIndex((value) => value + 1), 1800 / speed); return () => window.clearTimeout(timer); }, [finalIndex, journey, playing, speed, stepIndex]);
  useEffect(() => { if (step?.terminal) markTerminalStateReached(); }, [markTerminalStateReached, step]);

  if (!scenario || !parsed || !journey || !step) return <section aria-labelledby="traceroute-title" className="traceroute-discovery-player"><h3 id="traceroute-title">Discover the path one TTL at a time</h3><p role="alert">This traceroute scenario cannot be animated safely. Use the static path evidence below.</p><div aria-label="Static traceroute evidence" role="region"><strong>{scenario?.title ?? "Unavailable scenario"}</strong><p>{scenario?.conclusion}</p></div></section>;
  const observations = journey.slice(0, stepIndex + 1).filter((item) => item.phase === "observe");
  const choose = (index: number) => { setScenarioIndex(index); setStepIndex(0); setPlaying(!reducedMotion); };
  const terminalLabel = step.destinationReached ? "Destination reached" : parsed.outcome === "unreachable" ? "Destination reported unreachable" : "Trace stopped without a destination response";
  return <section aria-labelledby="traceroute-title" className="traceroute-discovery-player">
    <h3 id="traceroute-title">Discover the path one TTL at a time</h3>
    <p>{parsed.methodNote}</p>
    <fieldset><legend>Choose a traceroute outcome</legend>{scenarios.map((item, index) => <label key={item.id}><input checked={scenarioIndex === index} name="traceroute-scenario" onChange={() => choose(index)} type="radio" />{item.title}</label>)}</fieldset>
    <ol aria-label="Traceroute path topology" className="traceroute-topology">{parsed.devices.map((device) => <li data-active={device.id === step.activeDeviceId} key={device.id}><strong>{device.label}</strong><code>{device.address}</code></li>)}</ol>
    <div className="player-controls"><button disabled={stepIndex === 0} onClick={() => { setPlaying(false); setStepIndex((value) => value - 1); }}>Previous</button><button disabled={stepIndex === finalIndex} onClick={() => setPlaying((value) => !value)}>{playing ? "Pause" : "Play"}</button><button disabled={stepIndex === finalIndex} onClick={() => { setPlaying(false); setStepIndex((value) => value + 1); }}>Next</button><button onClick={() => { setStepIndex(0); setPlaying(!reducedMotion); }}>Restart</button><label>Playback speed <select aria-label="Playback speed" onChange={(event) => setSpeed(Number(event.target.value))} value={speed}>{PLAYBACK_SPEEDS.map((value) => <option key={value} value={value}>{value}×</option>)}</select></label></div>
    <p aria-live="polite" role="status">Step {stepIndex + 1} of {journey.length}: probe {step.probeId}, TTL {step.probeTtl}</p>
    <p>{step.explanation}</p>
    {step.response ? <p><strong>ICMP:</strong> {step.response.kind.replaceAll("-", " ")} (type {step.response.type}, code {step.response.code}) from {parsed.devices.find(({ id }) => id === step.response!.reporterId)?.label}</p> : null}
    <div aria-label="Scrollable traceroute probe evidence" className="traceroute-evidence-scroll" role="region" tabIndex={0}><table aria-label="Observed traceroute probes"><thead><tr><th>Probe</th><th>TTL</th><th>Observed responder</th><th>RTT</th><th>Meaning</th></tr></thead><tbody>{observations.map((item) => <tr key={item.id}><td>{item.probeId}</td><td>{item.probeTtl}</td><td>{item.observedResponder}</td><td>{item.response ? `${item.response.rttMs} ms` : "No reply"}</td><td>{item.explanation}</td></tr>)}</tbody></table></div>
    {step.terminal ? <div className="icmp-outcome"><strong>{terminalLabel}</strong><p>{parsed.conclusion}</p></div> : null}
    {state === "error" ? <button onClick={retry}>Retry saving progress</button> : null}
  </section>;
}
