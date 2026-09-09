"use client";

import { FormEvent, useEffect, useState } from "react";
import { useReducedMotion } from "@/features/packet-flow/use-reduced-motion";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";
import { classifyIpv6, expandIpv6, splitIpv6Prefix } from "./ipv6";

const DEFAULT_VALUE = "2001:db8:0:0:20c:29ff:fe9c:409/64";
const scenarios = [
  { label: "Global documentation address", value: DEFAULT_VALUE },
  { label: "Link-local neighbour", value: "fe80::20c:29ff:fe9c:409/64" },
  { label: "Unique-local service", value: "fd12:3456:789a::25/64" },
  { label: "Link-local multicast group", value: "ff02::1/128" },
  { label: "Loopback", value: "::1/128" },
  { label: "Unspecified source", value: "::/128" },
] as const;
const stages = ["Validate the address", "Expand eight hextets", "Reveal the prefix boundary", "Remove leading zeros", "Find the longest zero run", "Compress once with ::", "Classify address and scope"] as const;

export function Ipv6AddressExplorer({ progressItemId }: { progressItemId?: string }) {
  const reducedMotion = useReducedMotion();
  const { markTerminalStateReached } = useProgressCompletionBoundary(progressItemId);
  const [input, setInput] = useState(DEFAULT_VALUE);
  const [validValue, setValidValue] = useState(DEFAULT_VALUE);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [speed, setSpeed] = useState(1);
  const prefix = splitIpv6Prefix(validValue);
  const analysis = classifyIpv6(prefix.address);
  const hextets = expandIpv6(prefix.address).split(":");

  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);
  useEffect(() => {
    if (!playing || step === stages.length - 1) return;
    const timer = window.setTimeout(() => setStep((value) => value + 1), 1400 / speed);
    return () => window.clearTimeout(timer);
  }, [playing, speed, step]);
  useEffect(() => { if (step === stages.length - 1) markTerminalStateReached(); }, [markTerminalStateReached, step]);

  function explore(event: FormEvent) {
    event.preventDefault();
    try {
      splitIpv6Prefix(input);
      setValidValue(input.trim()); setError(""); setStep(0); setPlaying(!reducedMotion);
    } catch {
      setError("Enter one valid IPv6 address and a prefix from /0 to /128.");
    }
  }

  function chooseScenario(value: string) {
    setInput(value); setValidValue(value); setError(""); setStep(0); setPlaying(!reducedMotion);
  }

  return <section className="ipv6-address-explorer" aria-labelledby="ipv6-explorer-title">
    <h3 id="ipv6-explorer-title">Explore an IPv6 address</h3>
    <fieldset><legend>Choose an address type</legend>{scenarios.map((scenario) => <label key={scenario.label}><input checked={validValue === scenario.value} name="ipv6-scenario" onChange={() => chooseScenario(scenario.value)} type="radio" />{scenario.label}</label>)}</fieldset>
    <form onSubmit={explore}>
      <label>Try an IPv6 address and prefix<input aria-label="Try an IPv6 address and prefix" value={input} onChange={(event) => setInput(event.target.value)} /></label>
      <button type="submit">Explore address</button>
    </form>
    {error ? <p role="alert">{error}</p> : null}
    <p><strong>{validValue}</strong></p>
    <p role="status">Step {step + 1} of {stages.length}: <strong>{stages[step]}</strong></p>
    <div className="ipv6-hextets" aria-label="Eight expanded IPv6 hextets">{hextets.map((value, index) => <code data-testid="ipv6-hextet" key={`${value}-${index}`}>{value}</code>)}</div>
    <p><code>{prefix.address}</code></p>
    <p>{prefix.networkBits} network bits · {prefix.interfaceBits} interface bits</p>
    <p><strong>{analysis.kind}</strong> · {analysis.scope}</p><p>{analysis.explanation}</p>
    <div className="player-controls">
      <button disabled={step === 0} onClick={() => { setPlaying(false); setStep((value) => value - 1); }}>Previous</button>
      <button onClick={() => setPlaying((value) => !value)}>{playing ? "Pause" : "Play"}</button>
      <button disabled={step === stages.length - 1} onClick={() => { setPlaying(false); setStep((value) => value + 1); }}>Next</button>
      <button onClick={() => { setStep(0); setPlaying(!reducedMotion); }}>Restart</button>
      <label>Playback speed <select aria-label="Playback speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option></select></label>
    </div>
  </section>;
}
