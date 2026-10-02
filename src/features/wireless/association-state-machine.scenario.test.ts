import { describe, expect, it } from "vitest";

import { associationStateMachineScenario } from "./association-state-machine.scenario";

const fieldsFor = (stepId: string) => {
  const step = associationStateMachineScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

const detailValue = (stepId: string, label: string) =>
  fieldsFor(stepId).detailFields.find((field) => field.label === label)?.value;

describe("Association state machine scenario", () => {
  it("parses with a client and an AP linked directly", () => {
    expect(associationStateMachineScenario.devices.map((device) => device.id)).toEqual(["client", "ap"]);
    expect(associationStateMachineScenario.links.map((link) => link.id)).toEqual(["client-ap"]);
  });

  it("walks scanning, authentication, and association in order", () => {
    expect(associationStateMachineScenario.steps.map((step) => step.id)).toEqual([
      "client-starts-unauthenticated-and-unassociated",
      "client-sends-a-probe-request",
      "ap-replies-with-a-probe-response",
      "client-sends-open-system-authentication",
      "ap-confirms-authentication-success",
      "client-sends-association-request",
      "ap-sends-association-response-with-aid",
      "associated-is-not-the-same-as-ready-for-data",
    ]);
  });

  it("starts in state 1 and progresses through active scanning", () => {
    expect(summaryValue("client-starts-unauthenticated-and-unassociated", "Client state")).toMatch(/^1/);
    expect(summaryValue("client-sends-a-probe-request", "Frame")).toBe("Probe Request");
    expect(summaryValue("ap-replies-with-a-probe-response", "Carries")).toMatch(/SSID/);
  });

  it("treats Open System authentication as a formality rather than real security", () => {
    expect(detailValue("client-sends-open-system-authentication", "Actually authenticates?")).toMatch(/^No/);
    expect(summaryValue("ap-confirms-authentication-success", "Client state")).toMatch(/^2/);
  });

  it("reaches state 3 with an assigned AID after association", () => {
    expect(summaryValue("ap-sends-association-response-with-aid", "Client state")).toMatch(/^3/);
    expect(summaryValue("ap-sends-association-response-with-aid", "Assigned")).toContain("AID");
  });

  it("distinguishes open-network readiness from the still-pending WPA2/WPA3 handshake", () => {
    expect(summaryValue("associated-is-not-the-same-as-ready-for-data", "Open network")).toMatch(/ready/i);
    expect(summaryValue("associated-is-not-the-same-as-ready-for-data", "WPA2/WPA3 network")).toMatch(/handshake|SAE/);
    expect(fieldsFor("associated-is-not-the-same-as-ready-for-data").stateNote).toMatch(/4-way handshake/);
  });
});
