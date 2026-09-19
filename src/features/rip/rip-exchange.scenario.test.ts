import { describe, expect, it } from "vitest";

import { ripExchangeScenario } from "./rip-exchange.scenario";

const fieldsFor = (stepId: string) => {
  const step = ripExchangeScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

describe("RIP exchange scenario", () => {
  it("parses with a two-router topology and a connected LAN", () => {
    expect(ripExchangeScenario.devices.map((device) => device.id)).toEqual(["lan", "r1", "r2"]);
    expect(ripExchangeScenario.links.map((link) => link.id)).toEqual(["lan-r1", "r1-r2"]);
  });

  it("increments the metric by one hop when R2 installs R1's advertised route", () => {
    expect(summaryValue("r1-advertises-lan", "Metric")).toBe("1");
    expect(summaryValue("r2-installs-route", "Metric")).toBe("2");
  });

  it("poisons the route back toward R1 with split horizon with poisoned reverse", () => {
    expect(summaryValue("r2-applies-split-horizon", "Metric")).toBe("16 (poisoned)");
    expect(fieldsFor("r2-applies-split-horizon").detailFields[0]?.value).toMatch(/split horizon/i);
  });

  it("triggers an immediate update on link failure instead of waiting for the periodic timer", () => {
    expect(fieldsFor("lan-link-fails").stateNote).toMatch(/triggered update/i);
    expect(summaryValue("r1-sends-triggered-update", "Metric")).toBe("16 (unreachable)");
    expect(summaryValue("r2-removes-route", "Route 192.168.10.0/24")).toBe("Removed");
  });
});
