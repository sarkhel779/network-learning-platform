import { describe, expect, it } from "vitest";

import { routeSelectionScenario } from "./route-selection.scenario";

const fieldsFor = (stepId: string) => {
  const step = routeSelectionScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

describe("routing fundamentals route-selection scenario", () => {
  it("parses with the OSPF-and-two-EIGRP-neighbors topology", () => {
    expect(routeSelectionScenario.devices.map((device) => device.id)).toEqual(["r-ospf", "r1", "r-eigrp-a", "r-eigrp-b"]);
    expect(routeSelectionScenario.links.map((link) => link.id)).toEqual(["l-ospf", "l-eigrp-a", "l-eigrp-b"]);
  });

  it("shows administrative distance eliminating the lower-trust OSPF route before metric is compared", () => {
    expect(summaryValue("ospf-advertises-route", "OSPF cost")).toBe("20");
    expect(summaryValue("compare-administrative-distance", "OSPF admin. distance")).toBe("110");
    expect(summaryValue("compare-administrative-distance", "EIGRP admin. distance")).toBe("90");
    expect(fieldsFor("compare-administrative-distance").stateNote).toMatch(/before metric/i);
  });

  it("breaks the tie between same-protocol EIGRP routes by composite metric", () => {
    expect(summaryValue("eigrp-a-advertises-route", "Composite metric")).toBe("76,800");
    expect(summaryValue("eigrp-b-advertises-route", "Composite metric")).toBe("51,200");
    expect(summaryValue("compare-metric-within-eigrp", "Via R-EIGRP-B")).toBe("51,200");
    expect(fieldsFor("compare-metric-within-eigrp").stateNote).toMatch(/same protocol/i);
  });

  it("installs the EIGRP route via R-EIGRP-B as the final decision", () => {
    expect(summaryValue("route-installed", "Installed route")).toBe("10.0.0.0/24 via R-EIGRP-B");
    expect(summaryValue("route-installed", "Source")).toBe("EIGRP (AD 90)");
  });
});
