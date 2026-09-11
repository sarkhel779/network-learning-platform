import { describe, expect, it } from "vitest";

import { guidedBranchPortalIncident } from "./troubleshooting-scenarios";
import { createIncidentState, reduceIncident, scoreIncident } from "./troubleshooting-engine";

describe("troubleshooting incident engine", () => {
  it("reveals faults only after evidence-backed remediation", () => {
    let state = createIncidentState(guidedBranchPortalIncident);
    expect(state.exposedFaultIds).toEqual(["wrong-access-vlan"]);
    expect(() => reduceIncident(state, {
      type: "run_test", hypothesisId: "guided-vlan", predictionId: "wrong-vlan", testId: "inspect-vlan", confidence: "calibrated",
    }, guidedBranchPortalIncident)).toThrow(/scope/i);
    state = reduceIncident(state, { type: "confirm_scope" }, guidedBranchPortalIncident);

    state = reduceIncident(state, {
      type: "run_test", hypothesisId: "guided-vlan", predictionId: "wrong-vlan", testId: "inspect-vlan", confidence: "underconfident",
    }, guidedBranchPortalIncident);
    state = reduceIncident(state, { type: "record_conclusion", attemptIndex: 0, conclusion: "supported" }, guidedBranchPortalIncident);
    state = reduceIncident(state, { type: "apply_remediation", remediationId: "fix-vlan" }, guidedBranchPortalIncident);

    expect(state.correctedFaultIds).toEqual(["wrong-access-vlan"]);
    expect(state.exposedFaultIds).toEqual(["wrong-access-vlan", "wrong-specific-route"]);
    expect(() => reduceIncident(state, { type: "close_incident" }, guidedBranchPortalIncident)).toThrow(/restoration/i);
  });

  it("rejects remediation before its required evidence is collected", () => {
    const state = createIncidentState(guidedBranchPortalIncident);
    expect(() => reduceIncident(state, { type: "apply_remediation", remediationId: "fix-vlan" }, guidedBranchPortalIncident)).toThrow(/evidence/i);
    expect(() => reduceIncident(state, { type: "apply_remediation", remediationId: "remove-route" }, guidedBranchPortalIncident)).toThrow(/not exposed/i);
  });

  it("does not authorize remediation when the test contradicts the selected prediction", () => {
    let state = createIncidentState(guidedBranchPortalIncident);
    state = reduceIncident(state, { type: "confirm_scope" }, guidedBranchPortalIncident);
    state = reduceIncident(state, {
      type: "run_test", hypothesisId: "guided-route", predictionId: "unexpected-next-hop", testId: "inspect-vlan", confidence: "overconfident",
    }, guidedBranchPortalIncident);

    expect(state.attempts[0]?.correct).toBe(false);
    expect(() => reduceIncident(state, { type: "apply_remediation", remediationId: "fix-vlan" }, guidedBranchPortalIncident)).toThrow(/interpret.*root cause/i);
  });

  it("keeps future-fault and restoration tests unavailable until their incident phase", () => {
    const state = reduceIncident(createIncidentState(guidedBranchPortalIncident), { type: "confirm_scope" }, guidedBranchPortalIncident);
    expect(() => reduceIncident(state, {
      type: "run_test", hypothesisId: "guided-route", predictionId: "unexpected-next-hop", testId: "inspect-route", confidence: "calibrated",
    }, guidedBranchPortalIncident)).toThrow(/not available/i);
    expect(() => reduceIncident(state, { type: "run_restoration", checkId: "verify-http" }, guidedBranchPortalIncident)).toThrow(/remediation/i);
  });

  it("records incorrect attempts and does not charge repeated tests twice", () => {
    let state = createIncidentState(guidedBranchPortalIncident);
    state = reduceIncident(state, { type: "confirm_scope" }, guidedBranchPortalIncident);
    const action = { type: "run_test" as const, hypothesisId: "guided-route", predictionId: "unexpected-next-hop", testId: "inspect-vlan", confidence: "overconfident" as const };
    state = reduceIncident(state, action, guidedBranchPortalIncident);
    expect(state.attempts[0]).toMatchObject({ correct: false, confidence: "overconfident" });
    state = reduceIncident(state, { type: "record_conclusion", attemptIndex: 0, conclusion: "refuted" }, guidedBranchPortalIncident);
    expect(state.timeline[0]).toMatchObject({ hypothesis: "A more-specific route overrides the correct path", prediction: "Route lookup selects the retired WAN next hop.", confidence: "overconfident", conclusion: "refuted" });
    expect(state.elapsedMinutes).toBe(2);

    const repeated = reduceIncident(state, action, guidedBranchPortalIncident);
    expect(repeated.attempts).toHaveLength(1);
    expect(repeated.elapsedMinutes).toBe(2);
  });

  it("requires every restoration layer before closing", () => {
    let state = createIncidentState(guidedBranchPortalIncident);
    state = reduceIncident(state, { type: "confirm_scope" }, guidedBranchPortalIncident);
    for (const [hypothesisId, predictionId, testId, remediationId] of [
      ["guided-vlan", "wrong-vlan", "inspect-vlan", "fix-vlan"],
      ["guided-route", "unexpected-next-hop", "inspect-route", "remove-route"],
      ["guided-dns", "retired-address", "inspect-dns", "refresh-dns"],
    ] as const) {
      state = reduceIncident(state, { type: "run_test", hypothesisId, predictionId, testId, confidence: "calibrated" }, guidedBranchPortalIncident);
      state = reduceIncident(state, { type: "record_conclusion", attemptIndex: state.attempts.length - 1, conclusion: "supported" }, guidedBranchPortalIncident);
      state = reduceIncident(state, { type: "apply_remediation", remediationId }, guidedBranchPortalIncident);
    }
    for (const check of guidedBranchPortalIncident.restorationChecks) {
      state = reduceIncident(state, { type: "run_restoration", checkId: check.id }, guidedBranchPortalIncident);
    }
    expect(state.restorationEvidence["verify-vlan"]).toMatchObject({ title: "Restored switchport state" });
    state = reduceIncident(state, { type: "close_incident" }, guidedBranchPortalIncident);
    expect(state.closed).toBe(true);
    expect(state.timeline.at(-1)?.kind).toBe("closure");
  });

  it("scores reasoning dimensions independently", () => {
    let state = createIncidentState(guidedBranchPortalIncident);
    state = reduceIncident(state, { type: "confirm_scope" }, guidedBranchPortalIncident);
    state = reduceIncident(state, {
      type: "run_test", hypothesisId: "guided-vlan", predictionId: "wrong-vlan", testId: "inspect-vlan", confidence: "calibrated",
    }, guidedBranchPortalIncident);
    state = reduceIncident(state, { type: "record_conclusion", attemptIndex: 0, conclusion: "supported" }, guidedBranchPortalIncident);
    state = reduceIncident(state, { type: "apply_remediation", remediationId: "fix-vlan" }, guidedBranchPortalIncident);
    const score = scoreIncident(state, guidedBranchPortalIncident);
    expect(Object.keys(score)).toEqual(["scope", "hypothesis", "prediction", "safety", "interpretation", "rootCause", "restoration", "report"]);
    expect(score.rootCause).toBeGreaterThan(score.restoration);
    expect(score.safety).toBeGreaterThanOrEqual(score.hypothesis);
    expect(score.scope).toBe(100);
    expect(score.hypothesis).toBe(100);
    expect(score.prediction).toBe(100);
    expect(score.interpretation).toBe(100);
    expect(score.rootCause).toBe(33);
    expect(Math.max(...Object.values(score))).toBeLessThanOrEqual(100);
  });

  it("scores hypothesis, prediction, and interpretation independently", () => {
    let state = reduceIncident(createIncidentState(guidedBranchPortalIncident), { type: "confirm_scope" }, guidedBranchPortalIncident);
    state = reduceIncident(state, { type: "run_test", hypothesisId: "guided-vlan", predictionId: "wrong-vlan", testId: "inspect-addressing", confidence: "overconfident" }, guidedBranchPortalIncident);
    state = reduceIncident(state, { type: "record_conclusion", attemptIndex: 0, conclusion: "refuted" }, guidedBranchPortalIncident);
    const score = scoreIncident(state, guidedBranchPortalIncident);
    expect(score.hypothesis).toBe(100);
    expect(score.prediction).toBe(0);
    expect(score.interpretation).toBe(100);
    expect(score.rootCause).toBe(0);
  });

  it("awards report credit only when a report is explicitly submitted", () => {
    const initial = createIncidentState(guidedBranchPortalIncident);
    expect(scoreIncident(initial, guidedBranchPortalIncident).report).toBe(0);
    const submitted = reduceIncident(initial, { type: "submit_report" }, guidedBranchPortalIncident);
    expect(scoreIncident(submitted, guidedBranchPortalIncident).report).toBe(100);
  });
});
