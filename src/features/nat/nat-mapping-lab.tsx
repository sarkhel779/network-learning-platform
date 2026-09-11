"use client";

import { useId, useState } from "react";

import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";

type Props = {
  onComplete?: (result: { correct: boolean; confidence: string | null }) => void;
  progressItemId?: string;
};

const choices = [
  { label: "Static NAT", correct: false },
  { label: "Dynamic NAT", correct: false },
  { label: "PAT", correct: true },
  { label: "203.0.113.10:62001 maps to 10.0.0.25:51514", correct: true },
];

export function NatMappingLab({ onComplete, progressItemId }: Props) {
  const { markTerminalStateReached, retry, state } = useProgressCompletionBoundary(progressItemId);
  const name = useId();
  const confidenceName = useId();
  const [choice, setChoice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = choice !== null && choices[choice].correct;

  return (
    <section className="nat-practice-lab" aria-label="NAT mapping lab">
      <h3>Read the mapping</h3>
      <p>One public address uses port 62001 for the private socket 10.0.0.25:51514.</p>
      <fieldset><legend>Classify or reverse the mapping</legend>{choices.map((item, index) => (
        <label key={item.label}><input type="radio" name={name} checked={choice === index} onChange={() => { setChoice(index); setSubmitted(false); }} />{item.label}</label>
      ))}</fieldset>
      <fieldset><legend>How confident are you?</legend>{["Underconfident", "Confident"].map((item) => (
        <label key={item}><input type="radio" name={confidenceName} checked={confidence === item} onChange={() => setConfidence(item)} />{item}</label>
      ))}</fieldset>
      <button type="button" disabled={choice === null} onClick={() => { if (choice === null) return; if (!submitted) { onComplete?.({ correct, confidence }); markTerminalStateReached(); } setSubmitted(true); }}>Check mapping</button>
      {submitted ? <div role="status"><strong>{correct ? "Correct." : "Not quite."}</strong> PAT lets many clients share one public address by assigning unique transport ports. The reverse entry sends 203.0.113.10:62001 back to 10.0.0.25:51514.{confidence ? ` Confidence: ${confidence}.` : ""}</div> : null}
      {state === "error" ? <button type="button" onClick={() => void retry()}>Retry saving progress</button> : null}
    </section>
  );
}
