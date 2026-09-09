"use client";

import { useState } from "react";
import { SUBNET_SCENARIOS } from "./subnet-scenarios";

export function SubnetScenarioPlayer() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string>();
  const [checked, setChecked] = useState(false);
  const scenario = SUBNET_SCENARIOS[index];
  const correct = answer === scenario.correctOptionId;

  function next() {
    setIndex((value) => (value + 1) % SUBNET_SCENARIOS.length);
    setAnswer(undefined);
    setChecked(false);
  }

  return <section className="subnet-player subnet-scenario-player" aria-labelledby="subnet-scenario-title">
    <h3 id="subnet-scenario-title">Solve a practical subnet scenario</h3>
    <p>Scenario {index + 1} of {SUBNET_SCENARIOS.length}</p>
    <fieldset><legend>{scenario.prompt}</legend>{scenario.options.map((option) => <label key={option.id}>
      <input checked={answer === option.id} name="subnet-answer" onChange={() => { setAnswer(option.id); setChecked(false); }} type="radio" />{option.label}
    </label>)}</fieldset>
    <button disabled={!answer} onClick={() => setChecked(true)}>Check answer</button>
    {checked && <div className="subnet-feedback">
      <p role={correct ? "status" : "alert"}><strong>{correct ? "Correct." : "Not quite."}</strong> Follow the boundary calculation below.</p>
      <p data-testid="scenario-attempted">Attempt recorded. Completion does not depend on correctness.</p>
      <ol>{scenario.explanationSteps.map((step) => <li key={step}>{step}</li>)}</ol>
      <button onClick={() => { setAnswer(undefined); setChecked(false); }}>Try again</button>
      <button onClick={next}>Next scenario</button>
    </div>}
  </section>;
}
