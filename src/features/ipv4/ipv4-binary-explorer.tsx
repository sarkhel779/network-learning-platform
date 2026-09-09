"use client";

import { useState } from "react";

export function Ipv4BinaryExplorer() {
  const [value, setValue] = useState(192);
  const binary = value.toString(2).padStart(8, "0");
  return <section className="ipv4-player" aria-labelledby="binary-explorer-title">
    <h3 id="binary-explorer-title">Build one IPv4 octet</h3>
    <p>Each switch represents one binary place value. Toggle it and watch the decimal octet change.</p>
    <div className="ipv4-bits">{[128, 64, 32, 16, 8, 4, 2, 1].map((bit) => <button aria-label={`Toggle ${bit} bit`} aria-pressed={(value & bit) !== 0} key={bit} onClick={() => setValue((current) => current ^ bit)} type="button"><span>{bit}</span><strong>{(value & bit) !== 0 ? 1 : 0}</strong></button>)}</div>
    <p className="ipv4-result" aria-live="polite">{value} = {binary}</p>
  </section>;
}
