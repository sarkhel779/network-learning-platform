import { describe, expect, it } from "vitest";

import { createIncidentState } from "./troubleshooting-engine";
import { createIncidentStateStore } from "./incident-state-store";
import { guidedBranchPortalIncident } from "./troubleshooting-scenarios";

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
}

describe("incident state store", () => {
  it("persists and restores state only for the same learner attempt and scenario", () => {
    const storage = memoryStorage();
    const first = createIncidentStateStore(storage, "learner-1:attempt-1", guidedBranchPortalIncident);
    const state = { ...createIncidentState(guidedBranchPortalIncident), scoped: true, elapsedMinutes: 4 };
    first.save(state);

    expect(first.load()).toEqual(state);
    expect(createIncidentStateStore(storage, "learner-1:attempt-2", guidedBranchPortalIncident).load()).toBeNull();
  });

  it("rejects corrupted or incompatible snapshots and supports an explicit restart", () => {
    const storage = memoryStorage();
    const store = createIncidentStateStore(storage, "learner-1:attempt-1", guidedBranchPortalIncident);
    storage.setItem(store.key, "not-json");
    expect(store.load()).toBeNull();
    store.save(createIncidentState(guidedBranchPortalIncident));
    store.clear();
    expect(store.load()).toBeNull();
  });

  it("rejects structurally plausible snapshots with unknown evidence references", () => {
    const storage = memoryStorage();
    const store = createIncidentStateStore(storage, "learner-1:attempt-1", guidedBranchPortalIncident);
    const invalid = {
      ...createIncidentState(guidedBranchPortalIncident),
      attempts: [{ hypothesisId: "unknown", predictionId: "unknown", testId: "unknown", confidence: "calibrated", correct: true, hypothesisCorrect: true, predictionCorrect: true, timelineIndex: 0 }],
      timeline: [{ kind: "test", label: "forged", elapsedMinutes: 1, result: "correct" }],
    };
    storage.setItem(store.key, JSON.stringify(invalid));
    expect(store.load()).toBeNull();
    expect(storage.getItem(store.key)).toBeNull();
  });

  it("rejects a forged closed snapshot that bypasses the incident workflow", () => {
    const storage = memoryStorage();
    const store = createIncidentStateStore(storage, "learner-1:attempt-1", guidedBranchPortalIncident);
    store.save({ ...createIncidentState(guidedBranchPortalIncident), closed: true });
    expect(store.load()).toBeNull();
  });
});
