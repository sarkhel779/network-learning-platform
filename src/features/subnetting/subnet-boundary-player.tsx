"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/features/packet-flow/use-reduced-motion";
import { analyzeSubnet } from "./subnetting";

const scenarios = [
  { label: "A /26 office subnet", address: "192.0.2.130", prefix: 26 },
  { label: "A /30 routed link", address: "198.51.100.6", prefix: 30 },
  { label: "Point-to-point /31", address: "192.0.2.10", prefix: 31 },
] as const;

const stages = [
  "Read the address and prefix",
  "Subnet mask",
  "Separate network bits from host bits",
  "Find the interesting octet and block size",
  "Locate the containing address block",
  "Read the complete subnet range",
] as const;

export function SubnetBoundaryPlayer() {
  const reducedMotion = useReducedMotion();
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [speed, setSpeed] = useState(1);
  const scenario = scenarios[scenarioIndex];
  const result = analyzeSubnet(scenario.address, scenario.prefix);

  useEffect(() => {
    if (reducedMotion) setPlaying(false);
  }, [reducedMotion]);

  useEffect(() => {
    if (!playing || step === stages.length - 1) return;
    const timer = window.setTimeout(() => setStep((value) => value + 1), 1400 / speed);
    return () => window.clearTimeout(timer);
  }, [playing, speed, step]);

  function chooseScenario(index: number) {
    setScenarioIndex(index);
    setStep(0);
    setPlaying(!reducedMotion);
  }

  return (
    <section className="subnet-player" aria-labelledby="subnet-boundary-title">
      <h3 id="subnet-boundary-title">Reveal the subnet boundary</h3>
      <fieldset>
        <legend>Choose an address scenario</legend>
        {scenarios.map((item, index) => (
          <label key={item.label}>
            <input checked={scenarioIndex === index} name="subnet-boundary-scenario" onChange={() => chooseScenario(index)} type="radio" />
            {item.label}
          </label>
        ))}
      </fieldset>
      <p className="subnet-address"><strong>{scenario.address}/{scenario.prefix}</strong></p>
      <p role="status">Step {step + 1} of {stages.length}: <strong>{stages[step]}</strong></p>
      <div className="subnet-binary" aria-label="Binary subnet mask">
        <span>Mask: {result.mask}</span><code>{result.maskBinary}</code>
        <span>Network bits: {result.prefix}</span><span>Host bits: {result.hostBits}</span>
      </div>
      <dl className="subnet-results">
        <div><dt>Interesting octet</dt><dd>{result.interestingOctet}</dd></div>
        <div><dt>Block size</dt><dd>{result.blockSize}</dd></div>
        <div><dt>Network</dt><dd>{result.network}</dd></div>
        <div><dt>First usable</dt><dd>{result.firstUsable}</dd></div>
        <div><dt>Last usable</dt><dd>{result.lastUsable}</dd></div>
        <div><dt>Broadcast</dt><dd>{result.broadcast ?? "No broadcast address for this prefix"}</dd></div>
      </dl>
      <div className="player-controls">
        <button disabled={step === 0} onClick={() => { setPlaying(false); setStep((value) => value - 1); }}>Previous</button>
        <button onClick={() => setPlaying((value) => !value)}>{playing ? "Pause" : "Play"}</button>
        <button disabled={step === stages.length - 1} onClick={() => { setPlaying(false); setStep((value) => value + 1); }}>Next</button>
        <button onClick={() => { setStep(0); setPlaying(!reducedMotion); }}>Restart</button>
        <label>Playback speed <select aria-label="Playback speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option></select></label>
      </div>
    </section>
  );
}
