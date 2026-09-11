import type { IncidentState } from "./troubleshooting-engine";
import type { TroubleshootingScenario } from "./troubleshooting-scenario.schema";

const PREFIX = "packetsecrets:troubleshooting:v1";

function isIncidentState(value: unknown, scenario: TroubleshootingScenario): value is IncidentState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<IncidentState>;
  const faultIds = new Set(scenario.faults.map(({ id }) => id));
  const tests = new Map(scenario.tests.map((test) => [test.id, test]));
  const hypotheses = new Map(scenario.hypotheses.map((hypothesis) => [hypothesis.id, hypothesis]));
  const restorationIds = new Set(scenario.restorationChecks.map(({ id }) => id));
  const attempts = Array.isArray(state.attempts) ? state.attempts : [];
  const conclusions = Array.isArray(state.conclusions) ? state.conclusions : [];
  const attemptsValid = Array.isArray(state.attempts) && attempts.every((candidate) => {
    if (!candidate || typeof candidate !== "object") return false;
    const attempt = candidate as Partial<IncidentState["attempts"][number]>;
    const hypothesis = typeof attempt.hypothesisId === "string" ? hypotheses.get(attempt.hypothesisId) : undefined;
    const prediction = typeof attempt.predictionId === "string" ? hypothesis?.predictions.find(({ id }) => id === attempt.predictionId) : undefined;
    const test = typeof attempt.testId === "string" ? tests.get(attempt.testId) : undefined;
    const hypothesisCorrect = Boolean(hypothesis?.valid);
    const predictionCorrect = Boolean(prediction && test && prediction.supportingTestIds.includes(test.id));
    const correct = Boolean(hypothesis && test && test.expectedFaultId === hypothesis.faultId && hypothesisCorrect && predictionCorrect);
    return Boolean(hypothesis)
      && typeof attempt.predictionId === "string" && hypothesis!.predictions.some(({ id }) => id === attempt.predictionId)
      && typeof attempt.testId === "string" && Boolean(test)
      && ["underconfident", "calibrated", "overconfident"].includes(attempt.confidence ?? "")
      && attempt.hypothesisCorrect === hypothesisCorrect && attempt.predictionCorrect === predictionCorrect && attempt.correct === correct
      && Number.isInteger(attempt.timelineIndex) && (attempt.timelineIndex ?? -1) >= 0
      && Array.isArray(state.timeline) && attempt.timelineIndex! < state.timeline.length && state.timeline[attempt.timelineIndex!]?.kind === "test";
  });
  const objectKeysValid = (record: unknown, keys: Set<string>) => {
    if (!record || typeof record !== "object") return false;
    return Object.keys(record).every((key) => keys.has(key));
  };
  const evidenceValid = (value: unknown) => {
    if (!value || typeof value !== "object") return false;
    const evidence = value as { kind?: unknown; title?: unknown; body?: unknown };
    return ["cli", "table", "log", "capture", "observation"].includes(String(evidence.kind)) && typeof evidence.title === "string" && Boolean(evidence.title.trim()) && typeof evidence.body === "string" && Boolean(evidence.body.trim());
  };
  const conclusionsValid = Array.isArray(state.conclusions) && Array.isArray(state.attempts) && conclusions.every((item) => {
    if (!item || typeof item !== "object" || !Number.isInteger(item.attemptIndex) || item.attemptIndex < 0 || item.attemptIndex >= attempts.length || !["supported", "refuted"].includes(item.conclusion) || typeof item.correct !== "boolean") return false;
    const expected = attempts[item.attemptIndex]!.correct ? "supported" : "refuted";
    return item.correct === (item.conclusion === expected);
  }) && new Set(conclusions.map(({ attemptIndex }) => attemptIndex)).size === conclusions.length;
  const derivedRootCauses = conclusionsValid ? new Set(conclusions.flatMap((item) => item.correct && item.conclusion === "supported" ? [hypotheses.get(attempts[item.attemptIndex]!.hypothesisId)!.faultId] : [])) : new Set<string>();
  const identifiedRootCausesValid = Array.isArray(state.identifiedRootCauseIds) && state.identifiedRootCauseIds.length === derivedRootCauses.size && state.identifiedRootCauseIds.every((id) => typeof id === "string" && derivedRootCauses.has(id));
  const closedValid = state.closed !== true || (state.scoped === true && scenario.faults.every(({ id }) => state.correctedFaultIds?.includes(id)) && scenario.restorationChecks.every(({ id }) => state.restorationResults?.[id] === true));
  return typeof state.scoped === "boolean"
    && Array.isArray(state.exposedFaultIds) && state.exposedFaultIds.every((id) => typeof id === "string" && faultIds.has(id))
    && Array.isArray(state.correctedFaultIds) && state.correctedFaultIds.every((id) => typeof id === "string" && faultIds.has(id))
    && attemptsValid
    && conclusionsValid && identifiedRootCausesValid
    && Array.isArray(state.timeline) && state.timeline.every((item) => Boolean(item) && typeof item === "object" && ["test", "remediation", "restoration", "closure"].includes(item.kind ?? "") && typeof item.label === "string" && typeof item.elapsedMinutes === "number")
    && objectKeysValid(state.restorationResults, restorationIds) && Object.values(state.restorationResults!).every((result) => typeof result === "boolean")
    && objectKeysValid(state.restorationEvidence, restorationIds) && Object.values(state.restorationEvidence!).every(evidenceValid)
    && typeof state.elapsedMinutes === "number" && state.elapsedMinutes >= 0
    && typeof state.closed === "boolean" && closedValid && typeof state.reportSubmitted === "boolean" && (!state.reportSubmitted || state.closed);
}

export function createIncidentStateStore(storage: Storage, learnerAttemptKey: string, scenario: TroubleshootingScenario) {
  const key = `${PREFIX}:${learnerAttemptKey}:${scenario.id}`;
  return {
    key,
    load(): IncidentState | null {
      const raw = storage.getItem(key);
      if (!raw) return null;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (isIncidentState(parsed, scenario)) return parsed;
      } catch { /* discard malformed snapshots */ }
      storage.removeItem(key);
      return null;
    },
    save(state: IncidentState) { storage.setItem(key, JSON.stringify(state)); },
    clear() { storage.removeItem(key); },
  };
}
