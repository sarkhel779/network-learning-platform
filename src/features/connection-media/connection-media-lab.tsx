"use client";

import { useId, useState, type FormEvent } from "react";

import { publicConnectionMedia } from "./connection-media.data";
import type { ConnectionMediumId, ConnectionOutcome, ConnectionScenario } from "./connection-media.schema";
import { safeEvaluateConnectionChoice, type ConnectionChoiceResult } from "./evaluate-connection-choice";

const outcomeLabels: Record<ConnectionOutcome, string> = {
  recommended: "Recommended",
  "workable-with-trade-offs": "Workable with trade-offs",
  unsuitable: "Unsuitable",
};

function ScenarioRequirements({ scenario }: { scenario: ConnectionScenario }) {
  const requirements = [
    ["Source", scenario.source],
    ["Destination", scenario.destination],
    ["Distance", scenario.distance],
    ["Minimum bandwidth", scenario.minimumBandwidth],
    ["Latency sensitivity", scenario.latencySensitivity],
    ["Environment and interference", scenario.environment],
    ["Mobility", scenario.mobilityRequired ? "Movement required" : "Fixed connection"],
    ["Reliability priority", scenario.reliabilityPriority],
    ["Budget", scenario.budget],
  ];

  return (
    <dl className="encapsulation-player__layers">
      {requirements.map(([label, value]) => (
        <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
      ))}
    </dl>
  );
}

export function ConnectionMediaLab({ scenarios }: { scenarios: readonly ConnectionScenario[] }) {
  const id = useId();
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "");
  const [mediumId, setMediumId] = useState<ConnectionMediumId>();
  const [result, setResult] = useState<ConnectionChoiceResult>();
  const [checkCount, setCheckCount] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const scenario = scenarios.find(({ id: candidateId }) => candidateId === scenarioId);

  function clearResult() {
    setResult(undefined);
    setAnnouncement("");
    setUnavailable(false);
  }

  function checkChoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scenario || !mediumId) return;
    const evaluation = safeEvaluateConnectionChoice(scenario, mediumId);
    if (!evaluation) {
      setResult(undefined);
      setUnavailable(true);
      setAnnouncement("Connection choice evaluation unavailable. Review the troubleshooting workflow below.");
      return;
    }
    const nextCheck = checkCount + 1;
    setCheckCount(nextCheck);
    setResult(evaluation);
    setUnavailable(false);
    // A numbered, concise update also announces an identical resubmission once.
    setAnnouncement(`Check ${nextCheck}: ${outcomeLabels[evaluation.outcome]}. Review the connection choice result below.`);
  }

  if (!scenario) {
    return <p>Connection design lab unavailable. The selected scenario could not be found.</p>;
  }

  const recommendedMedium = result
    ? publicConnectionMedia.find(({ id: medium }) => medium === result.recommendedMediumId)
    : undefined;
  const selectedMedium = result
    ? publicConnectionMedia.find(({ id: medium }) => medium === result.selectedMediumId)
    : undefined;

  return (
    <div className="encapsulation-player">
      <form onSubmit={checkChoice}>
        <fieldset className="journey-selector">
          <legend>Choose a connection scenario</legend>
          <div className="journey-selector__choices">
            {scenarios.map((choice) => (
              <label key={choice.id}>
                <input
                  type="radio"
                  name={`${id}-scenario`}
                  value={choice.id}
                  checked={scenarioId === choice.id}
                  onChange={() => {
                    setScenarioId(choice.id);
                    setMediumId(undefined);
                    clearResult();
                  }}
                />
                <span>{choice.title}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <section aria-label="Scenario requirements">
          <h3>{scenario.title}</h3>
          <ScenarioRequirements scenario={scenario} />
        </section>

        <fieldset className="journey-selector">
          <legend>Choose a connection medium</legend>
          <div className="journey-selector__choices">
            {publicConnectionMedia.map((medium) => (
              <label key={medium.id}>
                <input
                  type="radio"
                  name={`${id}-medium`}
                  value={medium.id}
                  checked={mediumId === medium.id}
                  onChange={() => {
                    setMediumId(medium.id);
                    clearResult();
                  }}
                />
                <span>{medium.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="encapsulation-player__controls">
          <button type="submit" disabled={!mediumId}>Check my connection choice</button>
        </div>
      </form>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      {unavailable ? <p>Connection choice evaluation unavailable. Review the troubleshooting workflow below.</p> : null}
      {result && recommendedMedium && selectedMedium ? (
        <section className="encapsulation-player__step" aria-label="Connection choice result">
          <h3>{outcomeLabels[result.outcome]}</h3>
          <p><strong>Your choice:</strong> {selectedMedium.name}</p>
          <p>{result.explanation}</p>
          <h4>Decisive requirements</h4>
          <ul>{result.decisiveRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
          <p><strong>Recommended option:</strong> {recommendedMedium.name}</p>
          {result.selectedMediumId === result.recommendedMediumId ? (
            <p>Your choice is the recommended option for these requirements.</p>
          ) : (
            <p>{scenario.evaluations[result.recommendedMediumId].explanation}</p>
          )}
        </section>
      ) : null}

      <details>
        <summary>Read all scenario requirements</summary>
        <p>These summaries remain available without the interactive controls.</p>
        {scenarios.map((summary) => (
          <section key={summary.id} aria-label={`${summary.title} summary`}>
            <h3>{summary.title}</h3>
            <ScenarioRequirements scenario={summary} />
          </section>
        ))}
      </details>
    </div>
  );
}
