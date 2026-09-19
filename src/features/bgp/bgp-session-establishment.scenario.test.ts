import { describe, expect, it } from "vitest";

import { bgpSessionEstablishmentScenario } from "./bgp-session-establishment.scenario";

const fieldsFor = (stepId: string) => {
  const step = bgpSessionEstablishmentScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

const detailValue = (stepId: string, label: string) =>
  fieldsFor(stepId).detailFields.find((field) => field.label === label)?.value;

describe("BGP session establishment scenario", () => {
  it("moves through the finite state machine from Idle to Established in order", () => {
    expect(bgpSessionEstablishmentScenario.steps.map((step) => step.id)).toEqual([
      "idle-state",
      "tcp-connection-established",
      "r1-sends-open",
      "r2-sends-open",
      "keepalives-exchanged-established",
      "r1-sends-update",
    ]);
  });

  it("exchanges OPEN messages carrying each peer's AS number and Router ID", () => {
    expect(summaryValue("r1-sends-open", "My AS")).toBe("65001");
    expect(summaryValue("r2-sends-open", "My AS")).toBe("65002");
  });

  it("reaches Established only after both OPEN and KEEPALIVE exchanges", () => {
    expect(detailValue("r2-sends-open", "R1 state")).toBe("OpenConfirm");
    expect(summaryValue("keepalives-exchanged-established", "R1 state")).toBe("Established");
    expect(summaryValue("keepalives-exchanged-established", "R2 state")).toBe("Established");
  });

  it("advertises a prefix with AS_PATH, NEXT_HOP, and ORIGIN path attributes", () => {
    expect(summaryValue("r1-sends-update", "AS_PATH")).toBe("65001");
    expect(detailValue("r1-sends-update", "NEXT_HOP")).toBe("192.0.2.1");
    expect(detailValue("r1-sends-update", "ORIGIN")).toBe("IGP");
  });
});
