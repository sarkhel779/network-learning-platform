"use client";

import { useState } from "react";

import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";

import type { ServiceId } from "./essential-services.schema";
import { serviceLabel } from "./service-topology";
import { troubleshootingCases } from "./troubleshooting-cases";

type Confidence = "underconfident" | "confident";

export function ServiceTroubleshootingLab({ service, progressItemId }: { service: ServiceId; progressItemId: string }) {
  const { markTerminalStateReached, retry, state } = useProgressCompletionBoundary(progressItemId);
  const [caseIndex, setCaseIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const incident = troubleshootingCases[service][caseIndex];

  const reset = () => { setChoice(null); setConfidence(null); setSubmitted(false); };
  const submit = () => { if (choice === null) return; setSubmitted(true); markTerminalStateReached(); };

  return <section className="service-troubleshooting-lab" aria-label={`${serviceLabel(service)} troubleshooting lab`}>
    <h3>{serviceLabel(service)} troubleshooting</h3>
    <label>Case <select aria-label="Troubleshooting case" value={caseIndex} onChange={(event) => { setCaseIndex(Number(event.target.value)); reset(); }}>{troubleshootingCases[service].map((item, index) => <option key={item.id} value={index}>{item.prompt}</option>)}</select></label>
    <p><strong>Evidence:</strong> {incident.evidence}</p>
    <fieldset><legend>Choose the best diagnosis</legend>{incident.choices.map((item, index) => <label key={item}><input checked={choice === index} name={`${service}-diagnosis`} onChange={() => setChoice(index)} type="radio" />{item}</label>)}</fieldset>
    <fieldset><legend>How confident are you?</legend><label><input checked={confidence === "underconfident"} name={`${service}-confidence`} onChange={() => setConfidence("underconfident")} type="radio" />Underconfident</label><label><input checked={confidence === "confident"} name={`${service}-confidence`} onChange={() => setConfidence("confident")} type="radio" />Confident</label></fieldset>
    <button disabled={choice === null} onClick={submit}>Check diagnosis</button>
    {submitted ? <div className="service-troubleshooting-lab__feedback"><p role="status">{choice === incident.correctIndex ? "Correct diagnosis." : "That is not the best diagnosis."}</p><p>{incident.diagnosis}</p><p>{incident.explanation}</p><p><strong>Simplified explanation:</strong> {incident.simplifiedExplanation}</p><p><strong>Next step:</strong> {incident.nextStep}</p>{confidence ? <p>Confidence: {confidence}</p> : null}<button onClick={reset}>Try this case again</button></div> : null}
    {state === "error" ? <button onClick={retry}>Retry saving progress</button> : null}
  </section>;
}
