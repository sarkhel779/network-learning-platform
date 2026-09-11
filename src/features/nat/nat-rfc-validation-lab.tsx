"use client";

import { useId, useState } from "react";

import { natRfcChecks } from "./nat-pro-exercises";

export function NatRfcValidationLab() {
  const [checkIndex, setCheckIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const name = useId();
  const check = natRfcChecks[checkIndex];
  return <section className="nat-pro-lab" aria-label="NAT RFC validation lab">
    <h3>Validate translator behavior against RFC guidance</h3>
    <label>Check <select aria-label="RFC check" value={checkIndex} onChange={(event) => { setCheckIndex(Number(event.target.value)); setChoice(null); setSubmitted(false); }}>{natRfcChecks.map((item, index) => <option key={item.topic} value={index}>{item.topic}</option>)}</select></label>
    <fieldset><legend>{check.prompt}</legend>{check.choices.map((item, index) => <label key={item}><input type="radio" name={name} checked={choice === index} onChange={() => { setChoice(index); setSubmitted(false); }} />{item}</label>)}</fieldset>
    <button disabled={choice === null} type="button" onClick={() => setSubmitted(true)}>Check RFC behavior</button>
    {submitted ? <div role="status"><p><strong>{choice === check.correctIndex ? "Correct." : "Not quite."}</strong> {check.explanation}</p><p><strong>Operational consequence:</strong> {check.consequence}</p><a href={check.url}>{check.reference}</a></div> : null}
  </section>;
}
