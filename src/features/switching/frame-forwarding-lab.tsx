"use client";

import { useId, useRef, useState, type FormEvent } from "react";

import { safeEvaluateFrameForwarding, type FrameForwardingResult } from "./evaluate-frame-forwarding";
import type { SwitchDecision, SwitchingScenario } from "./switching.schema";

const decisionLabels: Readonly<Record<SwitchDecision, string>> = {
  "known-unicast": "Known unicast",
  filter: "Filter",
  "unknown-unicast-flood": "Unknown-unicast flood",
  "broadcast-flood": "Broadcast flood",
};

const decisions = Object.keys(decisionLabels) as SwitchDecision[];

function ForwardingTable({ entries, label }: {
  entries: readonly { mac: string; portId: string }[];
  label: string;
}) {
  return (
    <div className="forwarding-table-scroll" role="region" aria-label={label} tabIndex={0}>
      {entries.length === 0 ? <p>No learned entries yet</p> : (
        <table>
          <caption>{label.split(";")[0]}</caption>
          <thead><tr><th scope="col">MAC address</th><th scope="col">Learned port</th></tr></thead>
          <tbody>{entries.map((entry) => <tr key={entry.mac}><th scope="row">{entry.mac}</th><td>{entry.portId}</td></tr>)}</tbody>
        </table>
      )}
    </div>
  );
}

export function FrameForwardingLab({ scenarios, showAdvancedShortcut = false }: {
  scenarios: readonly SwitchingScenario[];
  showAdvancedShortcut?: boolean;
}) {
  const id = useId();
  const intermediateScenarioInput = useRef<HTMLInputElement>(null);
  const firstDecisionInput = useRef<HTMLInputElement>(null);
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "");
  const [decision, setDecision] = useState<SwitchDecision>();
  const [egressPortIds, setEgressPortIds] = useState<readonly string[]>([]);
  const [result, setResult] = useState<FrameForwardingResult>();
  const [checkCount, setCheckCount] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const scenario = scenarios.find(({ id: candidate }) => candidate === scenarioId);
  const advancedScenario = scenarios.find(({ difficulty }) => difficulty === "intermediate");

  function resetPrediction() {
    setDecision(undefined);
    setEgressPortIds([]);
    setResult(undefined);
    setAnnouncement("");
    setUnavailable(false);
  }

  function selectScenario(nextId: string) {
    setScenarioId(nextId);
    resetPrediction();
  }

  function submitPrediction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scenario || !decision) return;
    const evaluation = safeEvaluateFrameForwarding(scenario, { decision, egressPortIds });
    if (!evaluation) {
      setResult(undefined);
      setUnavailable(true);
      setAnnouncement("Forwarding evaluation unavailable. Review the evidence workflow below.");
      return;
    }
    const nextCheck = checkCount + 1;
    const outcome = evaluation.correct ? "Correct prediction" : "Review this prediction";
    setCheckCount(nextCheck);
    setResult(evaluation);
    setUnavailable(false);
    setAnnouncement(`Check ${nextCheck}: ${outcome}. Review the frame forwarding result below.`);
  }

  if (!scenario) return <p>Frame-forwarding lab unavailable. The selected scenario could not be found.</p>;

  return (
    <div className="frame-forwarding-lab">
      {showAdvancedShortcut && advancedScenario ? (
        <button type="button" onClick={() => {
          selectScenario(advancedScenario.id);
          intermediateScenarioInput.current?.focus();
        }}>I know this—proceed to advanced</button>
      ) : null}

      <form onSubmit={submitPrediction}>
        <fieldset>
          <legend>Choose a forwarding scenario</legend>
          <div className="switching-choice-grid">
            {scenarios.map((choice) => (
              <label key={choice.id}>
                <input
                  ref={choice.id === advancedScenario?.id ? intermediateScenarioInput : undefined}
                  type="radio"
                  name={`${id}-scenario`}
                  checked={scenarioId === choice.id}
                  onChange={() => selectScenario(choice.id)}
                  onKeyDown={(event) => {
                    if (choice.id === advancedScenario?.id && event.key === "Tab" && !event.shiftKey) {
                      event.preventDefault();
                      firstDecisionInput.current?.focus();
                    }
                  }}
                />
                {choice.title}
              </label>
            ))}
          </div>
        </fieldset>

        <section aria-label="Frame evidence">
          <h3>{scenario.title}</h3>
          <dl className="frame-evidence">
            <div><dt>Ingress</dt><dd>{scenario.ingressPortId}</dd></div>
            <div><dt>Source MAC</dt><dd>{scenario.sourceMac}</dd></div>
            <div><dt>Destination MAC</dt><dd>{scenario.destinationMac}</dd></div>
            <div><dt>Destination type</dt><dd>{scenario.destinationType}</dd></div>
          </dl>
          <ForwardingTable entries={scenario.initialTable} label="Current forwarding table; scroll horizontally if needed" />
        </section>

        <fieldset>
          <legend>Predict the switching decision</legend>
          <div className="switching-choice-grid">
            {decisions.map((choice) => (
              <label key={choice}>
                <input
                  ref={choice === "known-unicast" ? firstDecisionInput : undefined}
                  type="radio"
                  name={`${id}-decision`}
                  checked={decision === choice}
                  onChange={() => { setDecision(choice); setResult(undefined); setAnnouncement(""); }}
                />
                {decisionLabels[choice]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Predict the egress ports</legend>
          <p>Select no ports when you predict filtering.</p>
          <div className="switching-choice-grid">
            {scenario.ports.filter(({ id: portId }) => scenario.eligibleEgressPortIds.includes(portId)).map((port) => (
              <label key={port.id}>
                <input
                  type="checkbox"
                  checked={egressPortIds.includes(port.id)}
                  onChange={() => {
                    setEgressPortIds((current) => current.includes(port.id)
                      ? current.filter((id) => id !== port.id)
                      : [...current, port.id]);
                    setResult(undefined);
                    setAnnouncement("");
                  }}
                />
                {port.label}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" disabled={!decision}>Check my forwarding prediction</button>
      </form>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      {unavailable ? <p>Forwarding evaluation unavailable. Review the evidence workflow below.</p> : null}
      {result ? (
        <section aria-label="Frame forwarding result" className="frame-forwarding-result">
          <h3>{result.correct ? "Correct prediction" : "Review this prediction"}</h3>
          <h4>Source learning</h4>
          <p>Learn {result.learnedEntry.mac} on {result.learnedEntry.portId} from the arriving source.</p>
          <h4>Destination lookup</h4>
          <p>Look up {scenario.destinationMac} after the source entry is refreshed.</p>
          <h4>Forwarding decision</h4>
          <p><strong>{decisionLabels[result.decision]}:</strong> {result.explanation}</p>
          {result.wrongAnswerExplanation ? <p>{result.wrongAnswerExplanation}</p> : null}
          <h4>Updated forwarding table</h4>
          <ForwardingTable entries={result.nextTable} label="Updated forwarding table; scroll horizontally if needed" />
        </section>
      ) : null}
    </div>
  );
}
