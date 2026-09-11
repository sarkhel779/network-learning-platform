"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";

import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";
import { useOptionalLessonProgress } from "@/features/progress/lesson-progress-context";

import { EvidenceBoard } from "./evidence-board";
import { HypothesisJournal } from "./hypothesis-journal";
import { IncidentTimeline } from "./incident-timeline";
import { createIncidentStateStore } from "./incident-state-store";
import { RemediationPanel } from "./remediation-panel";
import { RestorationChecklist } from "./restoration-checklist";
import { createIncidentState, reduceIncident, type Confidence, type IncidentAction } from "./troubleshooting-engine";
import type { TroubleshootingScenario } from "./troubleshooting-scenario.schema";
import { TroubleshootingTopology } from "./troubleshooting-topology";

type Props = { scenario: TroubleshootingScenario; progressItemId?: string; guidance: "guided" | "sparse"; onStateChange?: (state: ReturnType<typeof createIncidentState>) => void };

function ProgressMilestone({ itemId }: { itemId: string }) {
  const progress = useProgressCompletionBoundary(itemId);
  const triggered = useRef(false);
  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;
    progress.markTerminalStateReached();
  }, [progress]);
  return null;
}

export function TroubleshootingWorkspace({ scenario, progressItemId, guidance, onStateChange }: Props) {
  const lessonProgress = useOptionalLessonProgress();
  const learnerAttemptKey = lessonProgress?.learnerAttemptKey ?? "preview:attempt-1";
  const store = useMemo(() => !lessonProgress || typeof window === "undefined" ? null : createIncidentStateStore(window.localStorage, learnerAttemptKey, scenario), [learnerAttemptKey, lessonProgress, scenario]);
  type WorkspaceAction = IncidentAction | { type: "restart_workspace" };
  const [state, dispatch] = useReducer((current: ReturnType<typeof createIncidentState>, action: WorkspaceAction) => action.type === "restart_workspace" ? createIncidentState(scenario) : reduceIncident(current, action, scenario), scenario, (currentScenario) => store?.load() ?? createIncidentState(currentScenario));
  const previousAttemptKey = useRef(learnerAttemptKey);
  const skipSave = useRef(false);
  const first = scenario.hypotheses[0];
  const [hypothesisId, setHypothesisId] = useState(first.id);
  const [predictionId, setPredictionId] = useState(first.predictions[0].id);
  const [confidence, setConfidence] = useState<Confidence>("underconfident");
  const [selectedTestId, setSelectedTestId] = useState<string>();
  const [feedback, setFeedback] = useState("Form a hypothesis, predict the result, then collect evidence.");
  const [journalOpen, setJournalOpen] = useState(guidance === "guided");
  const progress = useProgressCompletionBoundary(progressItemId);

  useEffect(() => {
    if (previousAttemptKey.current === learnerAttemptKey) return;
    previousAttemptKey.current = learnerAttemptKey;
    skipSave.current = true;
    dispatch({ type: "restart_workspace" });
  }, [learnerAttemptKey]);
  useEffect(() => {
    if (skipSave.current) { skipSave.current = false; return; }
    store?.save(state);
  }, [state, store]);
  useEffect(() => { onStateChange?.(state); }, [onStateChange, state]);

  const runTest = (testId: string) => {
    const test = scenario.tests.find(({ id }) => id === testId)!;
    const hypothesis = scenario.hypotheses.find(({ id }) => id === hypothesisId)!;
    const prediction = hypothesis.predictions.find(({ id }) => id === predictionId)!;
    const correct = test.expectedFaultId === hypothesis.faultId && prediction.supportingTestIds.includes(test.id) && state.exposedFaultIds.includes(hypothesis.faultId);
    dispatch({ type: "run_test", hypothesisId, predictionId, testId, confidence });
    setSelectedTestId(testId);
    setFeedback(correct ? `${test.evidence.title}: ${test.evidence.body}` : `${test.evidence.title}: this evidence does not support the selected hypothesis. Reconsider the layer and prediction.`);
  };
  const runRestoration = (checkId: string) => {
    try {
      const check = scenario.restorationChecks.find(({ id }) => id === checkId)!;
      dispatch({ type: "run_restoration", checkId });
      setFeedback(`${check.label}: verification passed and evidence was recorded.`);
    } catch (error) { setFeedback(error instanceof Error ? error.message : "Restoration verification could not run."); }
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
  const restart = () => {
    store?.clear();
    dispatch({ type: "restart_workspace" });
    setSelectedTestId(undefined);
    setFeedback("Incident restarted. Confirm the scope before collecting new evidence.");
  };
  const selectedEvidence = scenario.tests.find(({ id }) => id === selectedTestId)?.evidence;
  const restorationReady = state.correctedFaultIds.length === scenario.faults.length;
  const visibleTests = scenario.tests.filter((test) => test.phase === "diagnostic" && (!test.expectedFaultId || state.exposedFaultIds.includes(test.expectedFaultId)));
  const visibleRemediations = scenario.remediations.filter((item) => state.exposedFaultIds.includes(item.faultId));
  const activePath = state.correctedFaultIds.length === scenario.faults.length ? scenario.topology.nodes.map(({ id }) => id) : scenario.topology.nodes.slice(0, Math.min(state.correctedFaultIds.length + 2, scenario.topology.nodes.length)).map(({ id }) => id);

  return <section className="troubleshooting-workspace" data-guidance={guidance} aria-label={scenario.title}>
    <header><p className="eyebrow">Systematic troubleshooting capstone</p><h2>{scenario.title}</h2><p>{state.elapsedMinutes} simulated minutes · {state.correctedFaultIds.length}/{scenario.faults.length} faults corrected</p></header>
    <TroubleshootingTopology topology={scenario.topology} activePath={activePath} />
    <button disabled={state.scoped} onClick={() => dispatch({ type: "confirm_scope" })} type="button">{state.scoped ? "Incident scope confirmed" : "Confirm incident scope"}</button>
    {guidance === "sparse" ? <button aria-expanded={journalOpen} onClick={() => setJournalOpen((current) => !current)} type="button">{journalOpen ? "Close hypothesis worksheet" : "Open hypothesis worksheet"}</button> : null}
    <div className="troubleshooting-workspace__grid">{journalOpen ? <HypothesisJournal hypotheses={scenario.hypotheses} hypothesisId={hypothesisId} predictionId={predictionId} confidence={confidence} onHypothesisChange={setHypothesisId} onPredictionChange={setPredictionId} onConfidenceChange={setConfidence} /> : null}<EvidenceBoard tests={visibleTests} selectedEvidence={selectedEvidence} onRunTest={runTest} /></div>
    <p className="troubleshooting-workspace__feedback" role="status" aria-live="polite">{feedback}</p>
    <RemediationPanel remediations={visibleRemediations} correctedFaultIds={state.correctedFaultIds} onApply={apply} />
    <RestorationChecklist checks={scenario.restorationChecks} results={state.restorationResults} enabled={restorationReady} onRun={runRestoration} />
    <button className="troubleshooting-workspace__close" disabled={state.closed} onClick={close} type="button">{state.closed ? "Incident closed" : "Close incident"}</button>
    <button onClick={restart} type="button">Restart incident</button>
    <IncidentTimeline entries={state.timeline} />
    {scenario.id === "guided-branch-portal" && state.correctedFaultIds.includes("wrong-access-vlan") ? <ProgressMilestone itemId="capstone_guided_vlan_check" /> : null}
    {scenario.id === "guided-branch-portal" && state.correctedFaultIds.includes("wrong-specific-route") ? <ProgressMilestone itemId="capstone_guided_route_check" /> : null}
    {scenario.id === "guided-branch-portal" && state.correctedFaultIds.includes("stale-portal-dns") ? <ProgressMilestone itemId="capstone_guided_dns_check" /> : null}
    {scenario.id === "guided-branch-portal" && scenario.restorationChecks.every(({ id }) => state.restorationResults[id]) ? <ProgressMilestone itemId="capstone_restoration_verification" /> : null}
    {progress.state === "error" ? <button onClick={progress.retry}>Retry saving progress</button> : null}
  </section>;
}
