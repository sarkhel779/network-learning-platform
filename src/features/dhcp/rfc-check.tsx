"use client";

import { useState } from "react";

import { parseRfcCheck, type RfcCheck } from "./dhcp.schema";

export function DhcpRfcCheck({ check: authored }: { check: RfcCheck }) {
  const check = parseRfcCheck(authored);
  const [selected, setSelected] = useState<number>();
  const [submitted, setSubmitted] = useState(false);
  const answer = (index: number) => { setSelected(index); setSubmitted(false); };

  return <section className="dhcp-rfc-check">
    <h3>{check.referenceLabel} check</h3><p>{check.question}</p>
    <fieldset><legend>Choose one answer</legend>{check.options.map((option, index) => <label key={option}><input checked={selected === index} name={check.id} onChange={() => answer(index)} type="radio" />{option}</label>)}</fieldset>
    <button disabled={selected === undefined} onClick={() => setSubmitted(true)}>Check answer</button>
    <div aria-live="polite" role="status">{submitted ? <><strong>{selected === check.correctIndex ? "Correct" : "Incorrect"}.</strong><p>{check.rule}</p><p><strong>Packet evidence:</strong> {check.evidence}</p><p><strong>Operational consequence:</strong> {check.consequence}</p><p><a href={check.referenceUrl} rel="noreferrer" target="_blank">Read {check.referenceLabel}</a></p></> : null}</div>
  </section>;
}
