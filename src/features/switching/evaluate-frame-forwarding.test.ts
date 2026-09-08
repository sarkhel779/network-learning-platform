import { describe, expect, it } from "vitest";

import type { SwitchDecision, SwitchingScenario } from "./switching.schema";
import { evaluateFrameForwarding, safeEvaluateFrameForwarding } from "./evaluate-frame-forwarding";

function scenario(overrides: Partial<SwitchingScenario> = {}): SwitchingScenario {
  return {
    id: "known-destination",
    difficulty: "foundational",
    title: "Known destination",
    ports: [
      { id: "p1", label: "Port 1", eligible: true },
      { id: "p2", label: "Port 2", eligible: true },
      { id: "p3", label: "Port 3", eligible: true },
      { id: "p4", label: "Port 4", eligible: true },
    ],
    initialTable: [{ mac: "02:00:00:00:00:02", portId: "p2" }],
    ingressPortId: "p1",
    sourceMac: "02:00:00:00:00:01",
    destinationMac: "02:00:00:00:00:02",
    destinationType: "unicast",
    eligibleEgressPortIds: ["p2", "p3", "p4"],
    expectedDecision: "known-unicast",
    expectedEgressPortIds: ["p2"],
    expectedLearnedEntry: { mac: "02:00:00:00:00:01", portId: "p1" },
    explanation: "Learn the source and forward to the learned destination.",
    wrongAnswerExplanations: {
      "known-unicast": "Check the selected egress port.",
      filter: "The destination is on another port.",
      "unknown-unicast-flood": "The destination is learned.",
      "broadcast-flood": "The destination is unicast.",
    },
    evidenceNotes: ["Destination 02 is on port 2."],
    ...overrides,
  };
}

function predict(decision: SwitchDecision, egressPortIds: readonly string[]) {
  return { decision, egressPortIds };
}

describe("evaluateFrameForwarding", () => {
  it("learns the source before forwarding a known unicast", () => {
    const result = evaluateFrameForwarding(scenario(), predict("known-unicast", ["p2"]));
    expect(result.learnedEntry).toEqual({ mac: "02:00:00:00:00:01", portId: "p1" });
    expect(result.nextTable).toEqual([
      { mac: "02:00:00:00:00:02", portId: "p2" },
      { mac: "02:00:00:00:00:01", portId: "p1" },
    ]);
    expect(result.decision).toBe("known-unicast");
    expect(result.egressPortIds).toEqual(["p2"]);
    expect(result.correct).toBe(true);
  });

  it("refreshes or moves a source entry without creating a duplicate", () => {
    const input = scenario({
      ingressPortId: "p4",
      eligibleEgressPortIds: ["p1", "p2", "p3"],
      initialTable: [
        { mac: "02:00:00:00:00:01", portId: "p3" },
        { mac: "02:00:00:00:00:02", portId: "p2" },
      ],
      expectedLearnedEntry: { mac: "02:00:00:00:00:01", portId: "p4" },
    });
    const result = evaluateFrameForwarding(input, predict("known-unicast", ["p2"]));
    expect(result.nextTable.filter(({ mac }) => mac === input.sourceMac)).toEqual([
      { mac: "02:00:00:00:00:01", portId: "p4" },
    ]);
  });

  it("filters when the destination is learned on the ingress port", () => {
    const input = scenario({
      initialTable: [{ mac: "02:00:00:00:00:02", portId: "p1" }],
      expectedDecision: "filter",
      expectedEgressPortIds: [],
    });
    const result = evaluateFrameForwarding(input, predict("filter", []));
    expect(result.decision).toBe("filter");
    expect(result.egressPortIds).toEqual([]);
    expect(result.correct).toBe(true);
  });

  it("floods unknown unicast to every eligible port in topology order", () => {
    const input = scenario({
      initialTable: [],
      eligibleEgressPortIds: ["p4", "p2", "p3"],
      expectedDecision: "unknown-unicast-flood",
      expectedEgressPortIds: ["p4", "p2", "p3"],
    });
    const result = evaluateFrameForwarding(input, predict("unknown-unicast-flood", ["p3", "p4", "p2"]));
    expect(result.egressPortIds).toEqual(["p2", "p3", "p4"]);
    expect(result.correct).toBe(true);
  });

  it("floods broadcast without using a unicast table entry", () => {
    const input = scenario({
      destinationMac: "FF:FF:FF:FF:FF:FF",
      destinationType: "broadcast",
      expectedDecision: "broadcast-flood",
      expectedEgressPortIds: ["p2", "p3", "p4"],
    });
    const result = evaluateFrameForwarding(input, predict("broadcast-flood", ["p2", "p3", "p4"]));
    expect(result.decision).toBe("broadcast-flood");
    expect(result.egressPortIds).toEqual(["p2", "p3", "p4"]);
  });

  it("treats an aged-out destination as unknown unicast", () => {
    const input = scenario({
      id: "aged-out-destination",
      initialTable: [],
      expectedDecision: "unknown-unicast-flood",
      expectedEgressPortIds: ["p2", "p3", "p4"],
    });
    expect(evaluateFrameForwarding(input, predict("unknown-unicast-flood", ["p2", "p3", "p4"]))).toMatchObject({
      decision: "unknown-unicast-flood",
      correct: true,
    });
  });

  it("explains an incorrect decision or incomplete port set", () => {
    const wrongDecision = evaluateFrameForwarding(scenario(), predict("filter", []));
    expect(wrongDecision).toMatchObject({ correct: false, wrongAnswerExplanation: "The destination is on another port." });

    const wrongPorts = evaluateFrameForwarding(scenario(), predict("known-unicast", ["p3"]));
    expect(wrongPorts).toMatchObject({ correct: false, wrongAnswerExplanation: "Check the selected egress port." });
  });

  it("rejects unknown decision and port identifiers through the safe API", () => {
    expect(safeEvaluateFrameForwarding(scenario(), { decision: "route" as SwitchDecision, egressPortIds: [] })).toBeUndefined();
    expect(safeEvaluateFrameForwarding(scenario(), predict("known-unicast", ["p9"]))).toBeUndefined();
  });
});
