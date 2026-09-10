"use client";

import { useState } from "react";

import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";

import { dnsIncidents } from "./troubleshooting-scenarios";

export function DnsTroubleshootingPlayer({ access, progressItemId }: { access: "public" | "account"; progressItemId?: string }) {
  const available = access === "public" ? dnsIncidents.filter((incident) => incident.access === "public") : dnsIncidents;
  const [incidentId, setIncidentId] = useState(available[0].id);
  const [choice, setChoice] = useState<number | null>(null);
  const [submittedChoice, setSubmittedChoice] = useState<number | null>(null);
  const [announcementId, setAnnouncementId] = useState(0);
  const { markTerminalStateReached, state, retry } = useProgressCompletionBoundary(progressItemId);
  const incident = available.find(({ id }) => id === incidentId) ?? available[0];
  const submit = () => {
    if (choice === null) return;
    setSubmittedChoice(choice);
    setAnnouncementId((value) => value + 1);
    markTerminalStateReached();
  };
  const changeIncident = (id: string) => { setIncidentId(id); setChoice(null); setSubmittedChoice(null); };
  return <section className="dns-troubleshooting-player">
    <h3>Interactive DNS troubleshooting</h3>
    {access === "account" ? <label>Choose a DNS incident <select aria-label="Choose a DNS incident" value={incident.id} onChange={(event) => changeIncident(event.target.value)}>{available.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label> : null}
    <h4>{incident.title}</h4>
    <section aria-label="Observed evidence"><h5>Observed evidence</h5><ul>{incident.evidence.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <fieldset><legend>What does the evidence show?</legend>{incident.choices.map((option, index) => <label key={option}><input checked={choice === index} name={`dns-diagnosis-${incident.id}`} onChange={() => { setChoice(index); setSubmittedChoice(null); }} type="radio" />{option}</label>)}</fieldset>
    <button disabled={choice === null} onClick={submit}>Check diagnosis</button>
    {submittedChoice !== null ? <div aria-live="polite" data-announcement-id={announcementId} role="status">
      <strong>{submittedChoice === incident.correctIndex ? "Correct" : "Incorrect"}: {incident.diagnosis}</strong>
      <p>{incident.explanation}</p><p><strong>Responsible role:</strong> {incident.responsibleRole}</p><p><strong>Next step:</strong> {incident.nextStep}</p>
    </div> : null}
    {state === "error" ? <button onClick={retry}>Retry saving progress</button> : null}
  </section>;
}
