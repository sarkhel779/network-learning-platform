import { describe, expect, it } from "vitest";

import { ospfAdjacencyScenario } from "./ospf-adjacency.scenario";

const fieldsFor = (stepId: string) => {
  const step = ospfAdjacencyScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

const detailValue = (stepId: string, label: string) =>
  fieldsFor(stepId).detailFields.find((field) => field.label === label)?.value;

describe("OSPF adjacency scenario", () => {
  it("parses with a four-router full-mesh multi-access segment", () => {
    expect(ospfAdjacencyScenario.devices.map((device) => device.id)).toEqual(["r1", "r2", "r3", "r4"]);
    expect(ospfAdjacencyScenario.links.map((link) => link.id)).toEqual([
      "r1-r2", "r1-r3", "r1-r4", "r2-r3", "r2-r4", "r3-r4",
    ]);
  });

  it("fans a Hello out to every other router on the segment at once", () => {
    const step = fieldsFor("hellos-exchanged-on-segment");
    expect(step.activeLinkIds).toEqual(["r1-r2", "r1-r3", "r1-r4"]);
    expect(step.packet?.fanOut).toBe(true);
    expect(detailValue("hellos-exchanged-on-segment", "R4 priority / Router ID")).toBe("255 / 4.4.4.4");
  });

  it("elects the highest-priority router as DR and the next-highest as BDR", () => {
    expect(summaryValue("dr-and-bdr-elected", "Designated Router (DR)")).toBe("R4 (priority 255)");
    expect(summaryValue("dr-and-bdr-elected", "Backup Designated Router (BDR)")).toBe("R3 (priority 100)");
  });

  it("has the DR and BDR each form a full adjacency with every other router", () => {
    expect(summaryValue("dr-forms-full-with-every-router", "R4 (DR) ↔ R1")).toBe("Full");
    expect(detailValue("dr-forms-full-with-every-router", "Also happens separately with")).toContain("R2");
    expect(summaryValue("bdr-also-forms-full-with-every-router", "R3 (BDR) ↔ R1")).toBe("Full");
    expect(detailValue("bdr-also-forms-full-with-every-router", "Also happens separately with")).toContain("R4");
  });

  it("keeps two DROTHERs at 2-Way with each other, never exchanging DBD/LSR/LSU directly", () => {
    const step = fieldsFor("drother-drother-stays-at-2-way");
    expect(step.packet).toBeUndefined();
    expect(summaryValue("drother-drother-stays-at-2-way", "R1 (DROTHER) ↔ R2 (DROTHER)")).toContain("2-Way only");
    expect(step.stateNote).toMatch(/entire point of electing a DR and BDR/i);
  });

  it("ends with 5 full adjacencies and exactly 1 pair stuck at 2-Way", () => {
    expect(summaryValue("final-adjacency-state", "Full adjacencies")).toContain("5");
    expect(summaryValue("final-adjacency-state", "2-Way only")).toContain("1");
  });
});
