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
  it("moves through every RFC 2328 neighbor state in order", () => {
    expect(ospfAdjacencyScenario.steps.map((step) => step.id)).toEqual([
      "down-state",
      "r1-sends-hello",
      "r2-replies-hello-with-r1-listed",
      "exstart-negotiate-master",
      "exchange-dbd",
      "loading-lsr-lsu",
      "full-adjacency",
    ]);
  });

  it("reaches 2-Way once R2's Hello lists R1's router ID", () => {
    expect(summaryValue("r2-replies-hello-with-r1-listed", "Neighbor list")).toBe("1.1.1.1");
    expect(detailValue("r2-replies-hello-with-r1-listed", "R1 state")).toBe("2-Way");
  });

  it("elects the higher router ID as master during ExStart", () => {
    expect(summaryValue("exstart-negotiate-master", "Master")).toBe("R2 (higher Router ID)");
  });

  it("ends with both routers in the Full state", () => {
    expect(summaryValue("full-adjacency", "R1 state")).toBe("Full");
    expect(summaryValue("full-adjacency", "R2 state")).toBe("Full");
  });
});
