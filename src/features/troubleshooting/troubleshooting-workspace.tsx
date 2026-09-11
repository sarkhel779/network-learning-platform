"use client";

import { useReducer, useState } from "react";

import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";

import { EvidenceBoard } from "./evidence-board";
import { HypothesisJournal } from "./hypothesis-journal";
import { IncidentTimeline } from "./incident-timeline";
import { RemediationPanel } from "./remediation-panel";
import { RestorationChecklist } from "./restoration-checklist";
import { createIncidentState, reduceIncident, type Confidence, type IncidentAction } from "./troubleshooting-engine";
import type { TroubleshootingScenario } from "./troubleshooting-scenario.schema";
import { TroubleshootingTopology } from "./troubleshooting-topology";

type Props = { scenario: TroubleshootingScenario; progressItemId?: string; guidance: "guided" | "sparse" };

export function TroubleshootingWorkspace({ scenario, progressItemId, guidance }: Props) {
  const [state, dispatch] = useReducer((current: ReturnType<typeof createIncidentState>, action: IncidentAction) => reduceIncident(current, action, scenario), scenario, createIncidentState);
  const first = scenario.hypotheses[0];
  const [hypothesisId, setHypothesisId] = useState(first.id);
  const [predictionId, setPredictionId] = useState(first.predictions[0].id);
  const [confidence, setConfidence] = useState<Confidence>("underconfident");
  const [selectedTestId, setSelectedTestId] = useState<string>();
  const [feedback, setFeedback] = useState("Form a hypothesis, predict the result, then collect evidence.");
  const progress = useProgressCompletionBoundary(progressItemId);

  const runTest = (testId: string) => {
    const test = scenario.tests.find(({ id }) => id === testId)!;
    const hypothesis = scenario.hypotheses.find(({ id }) => id === hypothesisId)!;
    const correct = test.expectedFaultId === hypothesis.faultId && state.exposedFaultIds.includes(hypothesis.faultId);
    dispatch({ type: "run_test", hypothesisId, predictionId, testId, confidence });
    setSelectedTestId(testId);
    setFeedback(correct ? `${test.evidence.title}: ${test.evidence.body}` : `${test.evidence.title}: this evidence does not support the selected hypothesis. Reconsider the layer and prediction.`);
  };
  const apply = (remediationId: string) => {
    try {
      const remediation = scenario.remediations.find(({ id }) => id === remediationId)!;
      reduceIncident(state, { type: "apply_remediation", remediationId }, scenario);
      dispatch({ type: "apply_remediation", remediationId });
      setFeedback(`${remediation.label} applied. Continue testing; another fault may now be visible.`);
    } catch (error) { setFeedback(error instanceof Error ? error.message : "Remediation could not be applied."); }
  };
  const close = () => {
    try {
      const closed = reduceIncident(state, { type: "close_incident" }, scenario);
      dispatch({ type: "close_incident" });
      if (closed.closed) { setFeedback("Incident resolved. Every required layer has been restored."); progress.markTerminalStateReached(); }
    } catch (error) { setFeedback(error instanceof Error ? error.message : "Incident cannot be closed."); }
  };
  const selectedEvidence = scenario.tests.find(({ id }) => id === selectedTestId)?.evidence;
  const activePath = state.correctedFaultIds.length === scenario.faults.length ? scenario.topology.nodes.map(({ id }) => id) : scenario.topology.nodes.slice(0, Math.min(state.correctedFaultIds.length + 2, scenario.topology.nodes.length)).map(({ id }) => id);

  return <section className="troubleshooting-workspace" data-guidance={guidance} aria-label={scenario.title}>
    <header><p className="eyebrow">Systematic troubleshooting capstone</p><h2>{scenario.title}</h2><p>{state.elapsedMinutes} simulated minutes · {state.correctedFaultIds.length}/{scenario.faults.length} faults corrected</p></header>
    <TroubleshootingTopology topology={scenario.topology} activePath={activePath} />
    <div className="troubleshooting-workspace__grid"><HypothesisJournal hypotheses={scenario.hypotheses} hypothesisId={hypothesisId} predictionId={predictionId} confidence={confidence} onHypothesisChange={setHypothesisId} onPredictionChange={setPredictionId} onConfidenceChange={setConfidence} /><EvidenceBoard tests={scenario.tests} selectedEvidence={selectedEvidence} onRunTest={runTest} /></div>
    <p className="troubleshooting-workspace__feedback" role="status" aria-live="polite">{feedback}</p>
    <RemediationPanel remediations={scenario.remediations} correctedFaultIds={state.correctedFaultIds} onApply={apply} />
    <RestorationChecklist checks={scenario.restorationChecks} results={state.restorationResults} onChange={(checkId, passed) => dispatch({ type: "record_restoration", checkId, passed })} />
    <button className="troubleshooting-workspace__close" disabled={state.closed} onClick={close} type="button">{state.closed ? "Incident closed" : "Close incident"}</button>
    <IncidentTimeline entries={state.timeline} />
    {progress.state === "error" ? <button onClick={progress.retry}>Retry saving progress</button> : null}
  </section>;
}
