"use client";

import { useId, useState } from "react";

import { natTroubleshootingCases } from "./nat-troubleshooting-cases";

type Props = { onComplete?: (result: { caseId: string; correct: boolean }) => void };

export function NatTroubleshootingLab({ onComplete }: Props) {
  const name = useId();
  const [caseIndex, setCaseIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const incident = natTroubleshootingCases[caseIndex];
  const reset = () => { setChoice(null); setSubmitted(false); };

  return (
    <section className="nat-practice-lab" aria-label="NAT troubleshooting lab">
      <h3>Diagnose the translation failure</h3>
      <label>Incident <select aria-label="Incident" value={caseIndex} onChange={(event) => { setCaseIndex(Number(event.target.value)); reset(); }}>{natTroubleshootingCases.map((item, index) => <option key={item.id} value={index}>{item.title}</option>)}</select></label>
      <p><strong>Observed evidence:</strong> {incident.evidence}</p>
      <fieldset><legend>Best diagnosis</legend>{incident.choices.map((item, index) => (
        <label key={item}><input type="radio" name={name} checked={choice === index} onChange={() => { setChoice(index); setSubmitted(false); }} />{item}</label>
      ))}</fieldset>
      <button type="button" disabled={choice === null} onClick={() => { if (choice === null) return; if (!submitted) onComplete?.({ caseId: incident.id, correct: choice === incident.correctIndex }); setSubmitted(true); }}>Check diagnosis</button>
      {submitted ? <div role="status"><p><strong>{choice === incident.correctIndex ? "Correct diagnosis." : "Review the evidence."}</strong></p><p><strong>Failed assumption:</strong> {incident.failedAssumption}</p><p>{incident.explanation}</p><p><strong>Next verification:</strong> {incident.nextVerification}</p><button type="button" onClick={reset}>Try again</button></div> : null}
    </section>
  );
}
