"use client";

import { useState } from "react";
import type { ServiceId } from "./essential-services.schema";
import { rfcExercises } from "./pro-exercises";

export function RfcValidationLab({ service }: { service: ServiceId }) {
  const exercise = rfcExercises[service][0];
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  return <section className="rfc-validation-lab"><h3>RFC-level validation</h3><fieldset><legend>{exercise.question}</legend>{exercise.options.map((option, index) => <label key={option}><input checked={choice === index} name={`${service}-rfc`} onChange={() => { setChoice(index); setSubmitted(false); }} type="radio" />{option}</label>)}</fieldset><button disabled={choice === null} onClick={() => setSubmitted(true)}>Check RFC decision</button>{submitted ? <div role="status"><p>{choice === exercise.correctIndex ? "Correct." : "Review the rule."} {exercise.rule}</p><p><strong>Evidence:</strong> {exercise.evidence}</p><p><strong>Consequence:</strong> {exercise.consequence}</p></div> : null}<a href={exercise.referenceUrl} rel="noreferrer" target="_blank">{exercise.referenceLabel}</a></section>;
}
