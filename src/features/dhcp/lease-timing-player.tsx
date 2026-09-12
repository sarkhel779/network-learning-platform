"use client";

import { useEffect, useState } from "react";
import { TransportPlayerControls } from "@/features/transport/transport-player-controls";
import { leaseStateScenarios, type LeaseSignalRoute, type LeaseState } from "./lease-state-flow.data";

const signalPaths: Record<LeaseSignalRoute, string> = {
  "init-selecting": "M450 83 V110",
  "selecting-offer": "M534 142 C610 142 610 108 534 108",
  "selecting-requesting": "M450 170 V197",
  "requesting-bound": "M450 257 V284",
  "requesting-loop": "M534 229 C610 229 610 195 534 195",
  "requesting-init": "M534 228 H838 V54 H535",
  "bound-renewing": "M366 315 H233",
  "renewing-bound": "M233 300 H280 V270 H405 V284",
  "renewing-rebinding": "M149 345 V392 H751 V345",
  "rebinding-bound": "M667 300 H620 V270 H495 V284",
  "bound-init": "M534 315 H860 V54 H535",
};

const nodes: { state: LeaseState; x: number; y: number; width: number }[] = [
  { state: "INIT", x: 366, y: 24, width: 168 },
  { state: "SELECTING", x: 366, y: 111, width: 168 },
  { state: "REQUESTING", x: 366, y: 198, width: 168 },
  { state: "BOUND", x: 366, y: 285, width: 168 },
  { state: "RENEWING", x: 65, y: 285, width: 168 },
  { state: "REBINDING", x: 667, y: 285, width: 168 },
];

function StateDiagram({ active, signalRoute, signalKey, speed }: { active: LeaseState; signalRoute?: LeaseSignalRoute; signalKey: string; speed: number }) {
  return <div className="lease-state-diagram__scroll">
    <svg aria-label="DHCP lease state diagram" className="lease-state-diagram" role="img" viewBox="0 0 900 420">
      <defs><marker id="lease-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4"><path d="M0 0 L8 4 L0 8 Z" /></marker></defs>
      <g className="lease-state-diagram__links" markerEnd="url(#lease-arrow)">
        {Object.entries(signalPaths).map(([route, d]) => <path d={d} key={route} />)}
      </g>
      {signalRoute ? <path aria-hidden="true" className="lease-state-diagram__signal" d={signalPaths[signalRoute]} data-route={signalRoute} data-testid="dhcp-line-signal" key={signalKey} pathLength={100} style={{ animationDuration: `${1.5 / speed}s` }} /> : null}
      <g className="lease-state-diagram__labels">
        <text x="465" y="100">DISCOVER</text><text x="465" y="187">REQUEST</text><text x="465" y="274">ACK</text>
        <text x="245" y="306">T1 · 50%</text><text x="278" y="262">ACK → BOUND</text>
        <text x="602" y="262">ACK → BOUND</text><text x="390" y="384">T2 · 87.5% · no renewal ACK</text>
        <text x="690" y="205">Release / NAK / expiry → INIT</text>
      </g>
      {nodes.map(({ state, x, y, width }) => <g data-active={active === state} data-testid={`state-${state.toLowerCase()}`} key={state} className="lease-state-diagram__node">
        <rect height="60" rx="22" width={width} x={x} y={y} />
        <text dominantBaseline="middle" textAnchor="middle" x={x + width / 2} y={y + 30}>{state}</text>
      </g>)}
    </svg>
  </div>;
}

export function LeaseTimingPlayer() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const scenario = leaseStateScenarios[scenarioIndex];
  const step = scenario.steps[stepIndex];
  const finalIndex = scenario.steps.length - 1;
  const choose = (index: number) => { setScenarioIndex(index); setStepIndex(0); setPlaying(false); };

  useEffect(() => {
    if (!playing || stepIndex >= finalIndex) return;
    const timer = window.setTimeout(() => setStepIndex((value) => value + 1), 1900 / speed);
    return () => window.clearTimeout(timer);
  }, [finalIndex, playing, speed, stepIndex]);
  useEffect(() => { if (stepIndex >= finalIndex) setPlaying(false); }, [finalIndex, stepIndex]);

  return <section className="dhcp-player lease-state-player">
    <h3>DHCP lease state and packet flow</h3>
    <p>Follow each DHCP message through the client and server. The highlighted state is where the client ends this step.</p>
    <fieldset className="lease-state-player__scenarios"><legend>Choose a scenario</legend>{leaseStateScenarios.map((item, index) => <label key={item.id}><input checked={scenarioIndex === index} name="lease-state-scenario" onChange={() => choose(index)} type="radio" />{item.title}</label>)}</fieldset>
    <p className="lease-state-player__scroll-hint">Swipe or scroll sideways to see the full state diagram.</p>
    <StateDiagram active={step.state} signalKey={`${scenario.id}-${stepIndex}`} signalRoute={step.message ? step.signalRoute : undefined} speed={speed} />
    <div aria-label="Animated DHCP packet flow" className="lease-packet-flow">
      <div className="lease-packet-flow__device"><strong>Client</strong><small>UDP 68</small></div>
      <div className="lease-packet-flow__track">
        <span className="lease-packet-flow__line" />
        {step.viaRelay ? <span className="lease-packet-flow__relay">Relay</span> : null}
        {step.message ? <span className={`lease-packet-flow__packet lease-packet-flow__packet--${step.direction}`} data-testid="dhcp-packet" key={`${scenario.id}-${stepIndex}`} style={{ animationDuration: `${1.5 / speed}s` }}>✉</span> : null}
      </div>
      <div className="lease-packet-flow__device"><strong>DHCP server</strong><small>UDP 67</small></div>
    </div>
    <div aria-live="polite" className="lease-state-player__explanation" role="status">
      <strong>Step {stepIndex + 1} of {scenario.steps.length} · {step.title} · {step.state}</strong>
      <p className="lease-state-player__message">{step.message ?? "No packet sent"} · {step.delivery}</p>
      <p>{step.explanation}</p>
      <p>Lease: {step.leaseValid ? "valid — address may be used" : "not valid — do not use the address"}</p>
    </div>
    <TransportPlayerControls finalIndex={finalIndex} onNext={() => { setPlaying(false); setStepIndex((value) => value + 1); }} onPrevious={() => { setPlaying(false); setStepIndex((value) => value - 1); }} onRestart={() => { setStepIndex(0); setPlaying(false); }} onSpeedChange={setSpeed} onTogglePlay={() => setPlaying((value) => !value)} playing={playing} speed={speed} stepIndex={stepIndex} />
  </section>;
}
