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
  it("parses with a three-router triangle topology", () => {
    expect(ripExchangeScenario.devices.map((device) => device.id)).toEqual(["r1", "r2", "r3"]);
    expect(ripExchangeScenario.links.map((link) => link.id)).toEqual(["r1-r2", "r1-r3", "r2-r3"]);
  });

  it("fans R1's advertisement out to both neighbors at once, each adding one hop", () => {
    const step = fieldsFor("r1-advertises-to-both-neighbors");
    expect(step.activeLinkIds).toEqual(["r1-r2", "r1-r3"]);
    expect(step.packet?.fanOut).toBe(true);
    expect(summaryValue("r1-advertises-to-both-neighbors", "Metric")).toBe("1");
    expect(summaryValue("r2-and-r3-install-route", "R2 installs")).toContain("metric 2");
    expect(summaryValue("r2-and-r3-install-route", "R3 installs")).toContain("metric 2");
  });

  it("keeps the lower-hop-count route when R3 hears the same network twice", () => {
    expect(summaryValue("r3-hears-a-longer-second-path", "Advertised metric (via R2)")).toBe("3");
    expect(summaryValue("r3-hears-a-longer-second-path", "R3's installed route")).toContain("metric 2");
  });

  it("poisons the route back toward R1 with split horizon with poisoned reverse", () => {
    expect(summaryValue("r2-applies-split-horizon-toward-r1", "Advertised back to R1")).toContain("metric 16 (poisoned)");
    expect(fieldsFor("r2-applies-split-horizon-toward-r1").detailFields[0]?.value).toMatch(/split horizon/i);
  });

  it("triggers an immediate update to both neighbors on link failure instead of waiting for the periodic timer", () => {
    expect(fieldsFor("r1-lan-link-fails").stateNote).toMatch(/triggered update/i);
    const triggered = fieldsFor("r1-sends-triggered-update-to-both");
    expect(triggered.activeLinkIds).toEqual(["r1-r2", "r1-r3"]);
    expect(triggered.packet?.fanOut).toBe(true);
    expect(summaryValue("r1-sends-triggered-update-to-both", "Advertised to both neighbors")).toContain("metric 16");
    expect(summaryValue("r2-and-r3-remove-route", "Route 192.168.10.0/24")).toContain("Removed on both");
  });
});
