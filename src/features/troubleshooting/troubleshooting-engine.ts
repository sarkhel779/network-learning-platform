import type { TroubleshootingScenario } from "./troubleshooting-scenario.schema";

export type Confidence = "underconfident" | "calibrated" | "overconfident";

export type AttemptRecord = {
  hypothesisId: string;
  predictionId: string;
  testId: string;
  confidence: Confidence;
  correct: boolean;
};

export type TimelineEntry = {
  kind: "test" | "remediation" | "restoration" | "closure";
  label: string;
  elapsedMinutes: number;
  result: "correct" | "incorrect" | "passed" | "failed" | "complete";
};

export type IncidentState = {
  exposedFaultIds: string[];
  correctedFaultIds: string[];
  attempts: AttemptRecord[];
  timeline: TimelineEntry[];
  restorationResults: Record<string, boolean>;
  elapsedMinutes: number;
  closed: boolean;
};

export type IncidentAction =
  | { type: "run_test"; hypothesisId: string; predictionId: string; testId: string; confidence: Confidence }
  | { type: "apply_remediation"; remediationId: string }
  | { type: "record_restoration"; checkId: string; passed: boolean }
  | { type: "close_incident" };

export type IncidentScore = Record<"scope" | "hypothesis" | "prediction" | "safety" | "interpretation" | "rootCause" | "restoration" | "report", number>;

export function createIncidentState(scenario: TroubleshootingScenario): IncidentState {
  const unlockedByAnotherFault = new Set(scenario.faults.flatMap((fault) => fault.unlocksFaultId ? [fault.unlocksFaultId] : []));
  return {
    exposedFaultIds: scenario.faults.filter((fault) => !unlockedByAnotherFault.has(fault.id)).map((fault) => fault.id),
    correctedFaultIds: [], attempts: [], timeline: [], restorationResults: {}, elapsedMinutes: 0, closed: false,
  };
}

function runScenarioTest(state: IncidentState, action: Extract<IncidentAction, { type: "run_test" }>, scenario: TroubleshootingScenario): IncidentState {
  const test = scenario.tests.find(({ id }) => id === action.testId);
  const hypothesis = scenario.hypotheses.find(({ id }) => id === action.hypothesisId);
  if (!test || !hypothesis || !hypothesis.predictions.some(({ id }) => id === action.predictionId)) throw new Error("Unknown troubleshooting selection.");
  const duplicate = state.attempts.some((attempt) => attempt.hypothesisId === action.hypothesisId && attempt.predictionId === action.predictionId && attempt.testId === action.testId);
  if (duplicate) return state;
  const correct = test.expectedFaultId === hypothesis.faultId && state.exposedFaultIds.includes(hypothesis.faultId);
  const elapsedMinutes = state.elapsedMinutes + test.timeCost;
  return {
    ...state,
    attempts: [...state.attempts, { hypothesisId: action.hypothesisId, predictionId: action.predictionId, testId: action.testId, confidence: action.confidence, correct }],
    timeline: [...state.timeline, { kind: "test", label: test.label, elapsedMinutes, result: correct ? "correct" : "incorrect" }],
    elapsedMinutes,
  };
}

function applyScenarioRemediation(state: IncidentState, action: Extract<IncidentAction, { type: "apply_remediation" }>, scenario: TroubleshootingScenario): IncidentState {
  const remediation = scenario.remediations.find(({ id }) => id === action.remediationId);
  if (!remediation) throw new Error("Unknown remediation.");
  if (!state.exposedFaultIds.includes(remediation.faultId)) throw new Error("Fault is not exposed yet.");
  if (state.correctedFaultIds.includes(remediation.faultId)) return state;
  const tested = new Set(state.attempts.map(({ testId }) => testId));
  if (!remediation.requiresTestIds.every((testId) => tested.has(testId))) throw new Error("Collect required evidence before remediation.");
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

function recordRestorationResult(state: IncidentState, action: Extract<IncidentAction, { type: "record_restoration" }>, scenario: TroubleshootingScenario): IncidentState {
  const check = scenario.restorationChecks.find(({ id }) => id === action.checkId);
  if (!check) throw new Error("Unknown restoration check.");
  const test = scenario.tests.find(({ id }) => id === check.testId);
  const elapsedMinutes = state.elapsedMinutes + (test?.timeCost ?? 0);
  return {
    ...state,
    restorationResults: { ...state.restorationResults, [check.id]: action.passed },
    timeline: [...state.timeline, { kind: "restoration", label: check.label, elapsedMinutes, result: action.passed ? "passed" : "failed" }],
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
  if (state.closed) return state;
  switch (action.type) {
    case "run_test": return runScenarioTest(state, action, scenario);
    case "apply_remediation": return applyScenarioRemediation(state, action, scenario);
    case "record_restoration": return recordRestorationResult(state, action, scenario);
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
  const calibrated = correct.filter((attempt) => attempt.confidence === "calibrated");
  const restored = scenario.restorationChecks.filter(({ id }) => state.restorationResults[id]);
  const corrected = state.correctedFaultIds.length;
  return {
    scope: percent(new Set(state.attempts.map(({ testId }) => testId)).size, scenario.tests.length),
    hypothesis: percent(correct.length, state.attempts.length),
    prediction: percent(correct.filter(({ predictionId }) => Boolean(predictionId)).length, scenario.faults.length),
    safety: percent(safe.length, state.attempts.length),
    interpretation: percent(calibrated.length, correct.length),
    rootCause: percent(corrected, scenario.faults.length),
    restoration: percent(restored.length, scenario.restorationChecks.length),
    report: state.closed ? 100 : 0,
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled incident action: ${JSON.stringify(value)}`);
}
