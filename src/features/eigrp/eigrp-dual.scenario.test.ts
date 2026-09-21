import { describe, expect, it } from "vitest";

import { eigrpDualScenario } from "./eigrp-dual.scenario";

const fieldsFor = (stepId: string) => {
  const step = eigrpDualScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

describe("EIGRP DUAL scenario", () => {
  it("parses with R1 and two EIGRP neighbors", () => {
    expect(eigrpDualScenario.devices.map((device) => device.id)).toEqual(["r2", "r1", "r3"]);
    expect(eigrpDualScenario.links.map((link) => link.id)).toEqual(["r1-r2", "r1-r3"]);
  });

  it("selects R2 as successor with the lowest total feasible distance", () => {
    expect(summaryValue("r1-computes-fd-via-r2", "Feasible Distance via R2")).toBe("76,800");
    expect(summaryValue("r1-computes-fd-via-r2", "Successor")).toBe("R2");
  });

  it("qualifies R3 as a feasible successor because its reported distance beats the feasible distance", () => {
    expect(summaryValue("r1-checks-feasibility-of-r3", "Feasible successor")).toBe("R3 (51,200 < 76,800)");
    expect(fieldsFor("r1-checks-feasibility-of-r3").detailFields[0]?.value).toMatch(/reported distance < feasible distance/i);
  });

  it("reroutes instantly to the feasible successor without a query on link failure", () => {
    expect(fieldsFor("r1-r2-link-fails").stateNote).toMatch(/instant, loop-free local reroute/i);
    expect(summaryValue("r1-switches-to-feasible-successor", "New successor")).toBe("R3");
    expect(summaryValue("r1-switches-to-feasible-successor", "New metric")).toBe("102,400");
  });
});
