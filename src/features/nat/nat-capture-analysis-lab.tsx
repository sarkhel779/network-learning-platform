"use client";

import { useId, useState } from "react";

import { natCaptureCases } from "./nat-pro-exercises";

export function NatCaptureAnalysisLab() {
  const capture = natCaptureCases[0];
  const name = useId();
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  return <section className="nat-pro-lab" aria-label="NAT packet capture analysis">
    <h3>{capture.title}</h3>
    <div className="nat-table-scroll" tabIndex={0}><table><caption>Two-interface Wireshark evidence</caption><thead><tr><th>Interface</th><th>Direction</th><th>Tuple</th><th>Flags/type</th><th>Evidence</th></tr></thead><tbody>{capture.rows.map((row) => <tr key={`${row.interface}-${row.direction}`}><th>{row.interface}</th><td>{row.direction}</td><td><code>{row.tuple.sourceIp}:{row.tuple.sourcePort} → {row.tuple.destinationIp}:{row.tuple.destinationPort}</code></td><td>{row.flags}</td><td>{row.evidence}</td></tr>)}</tbody></table></div>
    <fieldset><legend>What changed?</legend>{capture.choices.map((item, index) => <label key={item}><input type="radio" name={name} checked={choice === index} onChange={() => { setChoice(index); setSubmitted(false); }} />{item}</label>)}</fieldset>
    <button disabled={choice === null} type="button" onClick={() => setSubmitted(true)}>Analyze capture</button>
    {submitted ? <p role="status"><strong>{choice === capture.correctIndex ? "Correct." : "Not quite."}</strong> {capture.explanation}</p> : null}
  </section>;
}
