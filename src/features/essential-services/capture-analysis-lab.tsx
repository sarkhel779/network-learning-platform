"use client";

import { useState } from "react";
import type { ServiceId } from "./essential-services.schema";
import { captureExercises } from "./pro-exercises";

export function CaptureAnalysisLab({ service }: { service: ServiceId }) {
  const exercise = captureExercises[service][0];
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  return <section className="capture-analysis-lab"><h3>{exercise.title}</h3><p><strong>Display filter:</strong> <code>{exercise.displayFilter}</code></p><p>{exercise.conversation}</p><div className="service-table-scroll"><table aria-label={exercise.title}><thead><tr><th>No.</th><th>Time</th><th>Source</th><th>Destination</th><th>Protocol</th><th>Length</th><th>Info</th></tr></thead><tbody>{exercise.rows.map((row) => <tr key={row.number}><td>{row.number}</td><td>{row.relativeTime}</td><td>{row.source}</td><td>{row.destination}</td><td>{row.protocol}</td><td>{row.length}</td><td>{row.summary}</td></tr>)}</tbody></table></div><fieldset><legend>{exercise.question}</legend>{exercise.options.map((option, index) => <label key={option}><input checked={choice === index} name={`${service}-capture`} onChange={() => { setChoice(index); setSubmitted(false); }} type="radio" />{option}</label>)}</fieldset><button disabled={choice === null} onClick={() => setSubmitted(true)}>Check capture evidence</button>{submitted ? <p role="status">{choice === exercise.correctIndex ? "Correct. " : "Not quite. "}{exercise.explanation}</p> : null}</section>;
}
