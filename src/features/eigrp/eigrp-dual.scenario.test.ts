import { describe, expect, it } from "vitest";

import { eigrpDualScenario } from "./eigrp-dual.scenario";

const fieldsFor = (stepId: string) => {
  const step = eigrpDualScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

const detailValue = (stepId: string, label: string) =>
  fieldsFor(stepId).detailFields.find((field) => field.label === label)?.value;

describe("EIGRP DUAL scenario", () => {
  it("parses with R1 and two EIGRP neighbors", () => {
    expect(eigrpDualScenario.devices.map((device) => device.id)).toEqual(["r2", "r1", "r3"]);
    expect(eigrpDualScenario.links.map((link) => link.id)).toEqual(["r1-r2", "r1-r3"]);
  });

  it("qualifies R3 as a feasible successor for network X because its reported distance beats the feasible distance", () => {
    expect(summaryValue("r1-learns-network-x", "Successor (network X)")).toContain("R2");
    expect(summaryValue("r1-learns-network-x", "Feasible successor (network X)")).toContain("R3");
    expect(detailValue("r1-learns-network-x", "Feasibility condition")).toMatch(/reported distance < r1's feasible distance/i);
  });

  it("fails R3 as a feasible successor for network Z because its reported distance is too high", () => {
    expect(summaryValue("r1-learns-network-z", "Successor (network Z)")).toContain("R2");
    expect(summaryValue("r1-learns-network-z", "Feasible successor (network Z)")).toMatch(/none/i);
    expect(detailValue("r1-learns-network-z", "Feasibility check")).toMatch(/not less than/i);
  });

  it("reroutes network X instantly with no query on link failure", () => {
    const step = fieldsFor("network-x-reroutes-instantly");
    expect(step.packet).toBeUndefined();
    expect(summaryValue("network-x-reroutes-instantly", "Network X successor")).toContain("R3");
    expect(summaryValue("network-x-reroutes-instantly", "Query sent?")).toBe("No");
    expect(step.stateNote).toMatch(/instant, loop-free local reroute/i);
  });

  it("sends network Z Active with a Query, then installs the route once R3 replies", () => {
    expect(summaryValue("network-z-goes-active-and-queries", "Network Z state")).toBe("Active");
    expect(summaryValue("network-z-goes-active-and-queries", "Query sent to")).toBe("R3");
    expect(summaryValue("r3-replies-and-r1-installs-route", "Network Z successor")).toContain("R3");
    expect(summaryValue("r3-replies-and-r1-installs-route", "Network Z state")).toContain("Passive");
  });

  it("explains Stuck-In-Active as the risk a feasible successor avoids entirely", () => {
    const step = fieldsFor("stuck-in-active-risk");
    expect(summaryValue("stuck-in-active-risk", "If the Reply never arrives")).toBe("Stuck-In-Active (SIA)");
    expect(step.stateNote).toMatch(/avoids the query\/reply process/i);
  });
});
