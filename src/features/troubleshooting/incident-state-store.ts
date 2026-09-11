import type { IncidentState } from "./troubleshooting-engine";
import type { TroubleshootingScenario } from "./troubleshooting-scenario.schema";

const PREFIX = "packetsecrets:troubleshooting:v1";

function isIncidentState(value: unknown, scenario: TroubleshootingScenario): value is IncidentState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<IncidentState>;
  const faultIds = new Set(scenario.faults.map(({ id }) => id));
  return typeof state.scoped === "boolean"
    && Array.isArray(state.exposedFaultIds) && state.exposedFaultIds.every((id) => typeof id === "string" && faultIds.has(id))
    && Array.isArray(state.correctedFaultIds) && state.correctedFaultIds.every((id) => typeof id === "string" && faultIds.has(id))
    && Array.isArray(state.attempts) && Array.isArray(state.timeline)
    && Boolean(state.restorationResults) && typeof state.restorationResults === "object"
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
