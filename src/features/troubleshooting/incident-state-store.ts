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
  const attemptsValid = Array.isArray(state.attempts) && state.attempts.every((candidate) => {
    if (!candidate || typeof candidate !== "object") return false;
    const attempt = candidate as Partial<IncidentState["attempts"][number]>;
    const hypothesis = typeof attempt.hypothesisId === "string" ? hypotheses.get(attempt.hypothesisId) : undefined;
    return Boolean(hypothesis)
      && typeof attempt.predictionId === "string" && hypothesis!.predictions.some(({ id }) => id === attempt.predictionId)
      && typeof attempt.testId === "string" && tests.has(attempt.testId)
      && ["underconfident", "calibrated", "overconfident"].includes(attempt.confidence ?? "")
      && [attempt.correct, attempt.hypothesisCorrect, attempt.predictionCorrect].every((flag) => typeof flag === "boolean")
      && Number.isInteger(attempt.timelineIndex) && (attempt.timelineIndex ?? -1) >= 0;
  });
  const objectKeysValid = (record: unknown, keys: Set<string>) => {
    if (!record || typeof record !== "object") return false;
    return Object.keys(record).every((key) => keys.has(key));
  };
  return typeof state.scoped === "boolean"
    && Array.isArray(state.exposedFaultIds) && state.exposedFaultIds.every((id) => typeof id === "string" && faultIds.has(id))
    && Array.isArray(state.correctedFaultIds) && state.correctedFaultIds.every((id) => typeof id === "string" && faultIds.has(id))
    && attemptsValid
    && Array.isArray(state.conclusions) && state.conclusions.every((item) => Boolean(item) && typeof item === "object" && Number.isInteger(item.attemptIndex) && item.attemptIndex! >= 0 && item.attemptIndex! < state.attempts!.length && ["supported", "refuted"].includes(item.conclusion ?? "") && typeof item.correct === "boolean")
    && Array.isArray(state.identifiedRootCauseIds) && state.identifiedRootCauseIds.every((id) => typeof id === "string" && faultIds.has(id))
    && Array.isArray(state.timeline) && state.timeline.every((item) => Boolean(item) && typeof item === "object" && ["test", "remediation", "restoration", "closure"].includes(item.kind ?? "") && typeof item.label === "string" && typeof item.elapsedMinutes === "number")
    && objectKeysValid(state.restorationResults, restorationIds) && Object.values(state.restorationResults!).every((result) => typeof result === "boolean")
    && objectKeysValid(state.restorationEvidence, restorationIds)
    && typeof state.elapsedMinutes === "number" && state.elapsedMinutes >= 0
    && typeof state.closed === "boolean" && typeof state.reportSubmitted === "boolean";
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
