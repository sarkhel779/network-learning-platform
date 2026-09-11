import type { TroubleshootingScenario } from "./troubleshooting-scenario.schema";

export type Confidence = "underconfident" | "calibrated" | "overconfident";

export type AttemptRecord = {
  hypothesisId: string;
  predictionId: string;
  testId: string;
  confidence: Confidence;
  correct: boolean;
  hypothesisCorrect: boolean;
  predictionCorrect: boolean;
  timelineIndex: number;
};

export type ConclusionRecord = { attemptIndex: number; conclusion: "supported" | "refuted"; correct: boolean };

export type TimelineEntry = {
  kind: "test" | "remediation" | "restoration" | "closure";
  label: string;
  elapsedMinutes: number;
  result: "correct" | "incorrect" | "passed" | "failed" | "complete";
  hypothesis?: string;
  prediction?: string;
  confidence?: Confidence;
  conclusion?: "supported" | "refuted";
};

export type IncidentState = {
  scoped: boolean;
  exposedFaultIds: string[];
  correctedFaultIds: string[];
  attempts: AttemptRecord[];
  conclusions: ConclusionRecord[];
  identifiedRootCauseIds: string[];
  timeline: TimelineEntry[];
  restorationResults: Record<string, boolean>;
  restorationEvidence: Record<string, TroubleshootingScenario["tests"][number]["evidence"]>;
  elapsedMinutes: number;
  closed: boolean;
  reportSubmitted: boolean;
};

export type IncidentAction =
  | { type: "run_test"; hypothesisId: string; predictionId: string; testId: string; confidence: Confidence }
  | { type: "apply_remediation"; remediationId: string }
  | { type: "confirm_scope" }
  | { type: "record_conclusion"; attemptIndex: number; conclusion: "supported" | "refuted" }
  | { type: "run_restoration"; checkId: string }
  | { type: "submit_report" }
  | { type: "close_incident" };

export type IncidentScore = Record<"scope" | "hypothesis" | "prediction" | "safety" | "interpretation" | "rootCause" | "restoration" | "report", number>;

export function createIncidentState(scenario: TroubleshootingScenario): IncidentState {
  const unlockedByAnotherFault = new Set(scenario.faults.flatMap((fault) => fault.unlocksFaultId ? [fault.unlocksFaultId] : []));
  return {
    scoped: false, exposedFaultIds: scenario.faults.filter((fault) => !unlockedByAnotherFault.has(fault.id)).map((fault) => fault.id),
    correctedFaultIds: [], attempts: [], conclusions: [], identifiedRootCauseIds: [], timeline: [], restorationResults: {}, restorationEvidence: {}, elapsedMinutes: 0, closed: false, reportSubmitted: false,
  };
}

function runScenarioTest(state: IncidentState, action: Extract<IncidentAction, { type: "run_test" }>, scenario: TroubleshootingScenario): IncidentState {
  if (!state.scoped) throw new Error("Confirm the incident scope before collecting evidence.");
  const test = scenario.tests.find(({ id }) => id === action.testId);
  const hypothesis = scenario.hypotheses.find(({ id }) => id === action.hypothesisId);
  const prediction = hypothesis?.predictions.find(({ id }) => id === action.predictionId);
  if (!test || !hypothesis || !prediction) throw new Error("Unknown troubleshooting selection.");
  if (test.phase === "restoration" || (test.expectedFaultId && !state.exposedFaultIds.includes(test.expectedFaultId))) throw new Error("This test is not available in the current incident phase.");
  const hypothesisCorrect = hypothesis.valid && state.exposedFaultIds.includes(hypothesis.faultId);
  const predictionCorrect = prediction.supportingTestIds.includes(test.id);
  const correct = test.expectedFaultId === hypothesis.faultId && hypothesisCorrect && predictionCorrect;
  const elapsedMinutes = state.elapsedMinutes + test.timeCost;
  return {
    ...state,
    attempts: [...state.attempts, { hypothesisId: action.hypothesisId, predictionId: action.predictionId, testId: action.testId, confidence: action.confidence, correct, hypothesisCorrect, predictionCorrect, timelineIndex: state.timeline.length }],
    timeline: [...state.timeline, { kind: "test", label: test.label, elapsedMinutes, result: correct ? "correct" : "incorrect", hypothesis: hypothesis.label, prediction: prediction.label, confidence: action.confidence }],
    elapsedMinutes,
  };
}

function recordConclusion(state: IncidentState, action: Extract<IncidentAction, { type: "record_conclusion" }>, scenario: TroubleshootingScenario): IncidentState {
  const attempt = state.attempts[action.attemptIndex];
  if (!attempt) throw new Error("Collect evidence before recording a conclusion.");
  const expected = attempt.correct ? "supported" : "refuted";
  const correct = action.conclusion === expected;
  const hypothesis = scenario.hypotheses.find(({ id }) => id === attempt.hypothesisId)!;
  if (state.correctedFaultIds.includes(hypothesis.faultId)) throw new Error("Conclusions are locked after remediation.");
  const conclusions = [...state.conclusions.filter(({ attemptIndex }) => attemptIndex !== action.attemptIndex), { attemptIndex: action.attemptIndex, conclusion: action.conclusion, correct }];
  const identifiedRootCauseIds = [...new Set(conclusions.flatMap((item) => {
    const concludedAttempt = state.attempts[item.attemptIndex];
    if (!item.correct || item.conclusion !== "supported" || !concludedAttempt) return [];
    return [scenario.hypotheses.find(({ id }) => id === concludedAttempt.hypothesisId)!.faultId];
  }))];
  return {
    ...state,
    conclusions,
    identifiedRootCauseIds,
    timeline: state.timeline.map((entry, index) => index === attempt.timelineIndex ? { ...entry, conclusion: action.conclusion } : entry),
  };
}

function applyScenarioRemediation(state: IncidentState, action: Extract<IncidentAction, { type: "apply_remediation" }>, scenario: TroubleshootingScenario): IncidentState {
  const remediation = scenario.remediations.find(({ id }) => id === action.remediationId);
  if (!remediation) throw new Error("Unknown remediation.");
  if (!state.exposedFaultIds.includes(remediation.faultId)) throw new Error("Fault is not exposed yet.");
  if (state.correctedFaultIds.includes(remediation.faultId)) return state;
  if (!state.identifiedRootCauseIds.includes(remediation.faultId)) throw new Error("Interpret the evidence and identify the root cause before remediation.");
  const supportingTests = new Set(state.attempts.filter((attempt) => attempt.correct).map(({ testId }) => testId));
  if (!remediation.requiresTestIds.every((testId) => supportingTests.has(testId))) throw new Error("Collect supporting evidence before remediation.");
  const fault = scenario.faults.find(({ id }) => id === remediation.faultId);
  const elapsedMinutes = state.elapsedMinutes + remediation.timeCost;
  return {
    ...state,
    correctedFaultIds: [...state.correctedFaultIds, remediation.faultId],
    exposedFaultIds: fault?.unlocksFaultId && !state.exposedFaultIds.includes(fault.unlocksFaultId) ? [...state.exposedFaultIds, fault.unlocksFaultId] : state.exposedFaultIds,
    timeline: [...state.timeline, { kind: "remediation", label: remediation.label, elapsedMinutes, result: "correct" }],
    elapsedMinutes,
  };
}

function runRestorationCheck(state: IncidentState, action: Extract<IncidentAction, { type: "run_restoration" }>, scenario: TroubleshootingScenario): IncidentState {
  const check = scenario.restorationChecks.find(({ id }) => id === action.checkId);
  if (!check) throw new Error("Unknown restoration check.");
  if (!scenario.faults.every(({ id }) => state.correctedFaultIds.includes(id))) throw new Error("Complete every remediation before restoration testing.");
  if (state.restorationResults[check.id]) return state;
  const test = scenario.tests.find(({ id }) => id === check.testId);
  if (!test) throw new Error("Restoration test is unavailable.");
  const evidence = test.restoredEvidence ?? test.evidence;
  const elapsedMinutes = state.elapsedMinutes + (test?.timeCost ?? 0);
  return {
    ...state,
    restorationResults: { ...state.restorationResults, [check.id]: true },
    restorationEvidence: { ...state.restorationEvidence, [check.id]: evidence },
    timeline: [...state.timeline, { kind: "restoration", label: check.label, elapsedMinutes, result: "passed" }],
    elapsedMinutes,
  };
}

function closeResolvedIncident(state: IncidentState, scenario: TroubleshootingScenario): IncidentState {
  const faultsCorrected = scenario.faults.every(({ id }) => state.correctedFaultIds.includes(id));
  const restored = scenario.restorationChecks.every(({ id }) => state.restorationResults[id]);
  if (!faultsCorrected || !restored) throw new Error("Complete every remediation and restoration check before closing the incident.");
  if (state.closed) return state;
  return { ...state, closed: true, timeline: [...state.timeline, { kind: "closure", label: "Incident resolved", elapsedMinutes: state.elapsedMinutes, result: "complete" }] };
}

export function reduceIncident(state: IncidentState, action: IncidentAction, scenario: TroubleshootingScenario): IncidentState {
  if (state.closed && action.type !== "submit_report") return state;
  switch (action.type) {
    case "confirm_scope": return { ...state, scoped: true };
    case "run_test": return runScenarioTest(state, action, scenario);
    case "record_conclusion": return recordConclusion(state, action, scenario);
    case "apply_remediation": return applyScenarioRemediation(state, action, scenario);
    case "run_restoration": return runRestorationCheck(state, action, scenario);
    case "submit_report": {
      if (!state.closed) throw new Error("Close the restored incident before submitting its report.");
      return { ...state, reportSubmitted: true };
    }
    case "close_incident": return closeResolvedIncident(state, scenario);
    default: return assertNever(action);
  }
}

function percent(part: number, whole: number): number {
  return whole ? Math.round((part / whole) * 100) : 0;
}

export function scoreIncident(state: IncidentState, scenario: TroubleshootingScenario): IncidentScore {
  const correct = state.attempts.filter((attempt) => attempt.correct);
  const safe = state.attempts.filter((attempt) => scenario.tests.find(({ id }) => id === attempt.testId)?.risk === "read-only");
  const restored = scenario.restorationChecks.filter(({ id }) => state.restorationResults[id]);
  return {
    scope: state.scoped ? 100 : 0,
    hypothesis: percent(state.attempts.filter(({ hypothesisCorrect }) => hypothesisCorrect).length, state.attempts.length),
    prediction: percent(state.attempts.filter(({ predictionCorrect }) => predictionCorrect).length, state.attempts.length),
    safety: percent(safe.length, state.attempts.length),
    interpretation: percent(state.conclusions.filter(({ correct }) => correct).length, state.conclusions.length),
    rootCause: percent(state.identifiedRootCauseIds.length, scenario.faults.length),
    restoration: percent(restored.length, scenario.restorationChecks.length),
    report: state.reportSubmitted ? 100 : 0,
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled incident action: ${JSON.stringify(value)}`);
}
