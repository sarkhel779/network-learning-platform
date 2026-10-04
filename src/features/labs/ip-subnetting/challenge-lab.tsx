"use client";

import { useId, useState } from "react";

import type { ChallengeRound } from "./challenge-rounds";

export function ChallengeLab({ rounds }: { rounds: ChallengeRound[] }) {
  const id = useId();
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const round = rounds[roundIndex];

  function checkAnswer() {
    if (!selectedId) return;
    setChecked(true);
    if (selectedId === round.correctId) setScore((value) => value + 1);
  }

  function nextRound() {
    if (roundIndex + 1 >= rounds.length) {
      setFinished(true);
      return;
    }
    setRoundIndex((value) => value + 1);
    setSelectedId(null);
    setChecked(false);
  }

  function restart() {
    setRoundIndex(0);
    setSelectedId(null);
    setChecked(false);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <section aria-label="Challenge results" className="challenge-lab">
        <div className="challenge-lab__summary">
          <h3>Scenario complete</h3>
          <p role="status">You scored {score} out of {rounds.length}.</p>
          <button type="button" onClick={restart}>Try again</button>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Interactive challenge" className="challenge-lab">
      <p className="challenge-lab__progress">Round {roundIndex + 1} of {rounds.length} · Score {score}</p>
      <fieldset className="challenge-lab__question">
        <legend className="challenge-lab__prompt">{round.prompt}</legend>
        {round.detail ? <p className="challenge-lab__detail">{round.detail}</p> : null}
        <div className="challenge-lab__options">
          {round.options.map((option) => (
            <label key={option.id}>
              <input
                type="radio"
                name={`${id}-round-${roundIndex}`}
                checked={selectedId === option.id}
                onChange={() => { setSelectedId(option.id); setChecked(false); }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="challenge-lab__controls">
        {!checked ? (
          <button type="button" disabled={!selectedId} onClick={checkAnswer}>Check answer</button>
        ) : (
          <button type="button" onClick={nextRound}>{roundIndex + 1 >= rounds.length ? "See results" : "Next round"}</button>
        )}
      </div>
      {checked ? (
        <p role="status" aria-label="Answer feedback" className="challenge-lab__feedback">
          {selectedId === round.correctId ? "Correct. " : "Not quite. "}
          {round.explanation}
        </p>
      ) : null}
    </section>
  );
}
