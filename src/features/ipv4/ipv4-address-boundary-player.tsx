"use client";

import { useState } from "react";
import { classifyIpv4Address, describePrefix } from "./ipv4-addressing";

const scenarios = [
  { label: "Documentation example", address: "192.0.2.44", prefix: 24 },
  { label: "Private office host", address: "10.20.30.40", prefix: 20 },
  { label: "Link-local fallback", address: "169.254.9.2", prefix: 16 },
] as const;

export function Ipv4AddressBoundaryPlayer() {
  const [selected, setSelected] = useState(0);
  const scenario = scenarios[selected];
  const result = describePrefix(scenario.address, scenario.prefix);
  return <section className="ipv4-player" aria-labelledby="boundary-title">
    <h3 id="boundary-title">Reveal the network boundary</h3>
    <fieldset><legend>Choose an address scenario</legend>{scenarios.map((item, index) => <label key={item.label}><input checked={selected === index} name="ipv4-scenario" onChange={() => setSelected(index)} type="radio" />{item.label}</label>)}</fieldset>
    <p><strong>{scenario.address}/{scenario.prefix}</strong></p>
    <div className="ipv4-boundary" aria-live="polite"><span>Network: {result.networkAddress}</span><span>Broadcast: {result.broadcastAddress}</span><span>Network bits: {result.networkBits}</span><span>Host bits: {result.hostBits}</span><span>Type: {classifyIpv4Address(scenario.address)}</span></div>
  </section>;
}
