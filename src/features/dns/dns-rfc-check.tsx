"use client";

import { useState } from "react";
import type { DnsRfcCheck as DnsRfcCheckData } from "./dns.schema";

export function DnsRfcCheck({ check }: { check: DnsRfcCheckData }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  return <section className="dns-rfc-check"><h3>{check.question}</h3><fieldset><legend>Choose the standards-based conclusion</legend>{check.options.map((option, index) => <label key={option}><input checked={choice === index} name={`dns-rfc-${check.id}`} onChange={() => { setChoice(index); setSubmitted(false); }} type="radio" />{option}</label>)}</fieldset>
    <button disabled={choice === null} onClick={() => setSubmitted(true)}>Check answer</button>
    {submitted && choice !== null ? <div aria-live="polite" role="status"><strong>{choice === check.correctIndex ? "Correct" : "Incorrect"}</strong><p><strong>Rule:</strong> {check.rule}</p><p><strong>Evidence:</strong> {check.evidence}</p><p><strong>Consequence:</strong> {check.consequence}</p><a href={check.referenceUrl}>{check.referenceLabel}</a></div> : null}
  </section>;
}
