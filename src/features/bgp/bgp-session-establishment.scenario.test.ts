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

describe("BGP session establishment and decision process scenario", () => {
  it("parses with two eBGP peers feeding into a third decision-making router", () => {
    expect(bgpSessionEstablishmentScenario.devices.map((device) => device.id)).toEqual(["r1", "r2", "r3"]);
    expect(bgpSessionEstablishmentScenario.links.map((link) => link.id)).toEqual(["r1-r3", "r2-r3"]);
  });

  it("moves R1 and R3 through the finite state machine from Idle to Established in order", () => {
    expect(bgpSessionEstablishmentScenario.steps.map((step) => step.id)).toEqual([
      "idle-state",
      "connect-state",
      "tcp-connection-established",
      "r1-sends-open",
      "r3-sends-open",
      "keepalives-exchanged-established",
      "r2-also-establishes-with-r3",
      "r1-advertises-prefix",
      "r2-advertises-prefix",
      "r3-runs-the-decision-process",
      "r3-installs-best-path",
    ]);
  });

  it("shows the Connect state before the TCP handshake, with Active as the documented retry path", () => {
    expect(summaryValue("connect-state", "R1 state")).toBe("Connect");
    expect(detailValue("connect-state", "On failure")).toMatch(/Active/);
  });

  it("exchanges OPEN messages carrying each peer's AS number and Router ID", () => {
    expect(summaryValue("r1-sends-open", "My AS")).toBe("65001");
    expect(summaryValue("r3-sends-open", "My AS")).toBe("65002");
  });

  it("reaches Established only after both OPEN and KEEPALIVE exchanges, then R2 establishes too", () => {
    expect(detailValue("r3-sends-open", "R1 state")).toBe("OpenConfirm");
    expect(summaryValue("keepalives-exchanged-established", "R1 state")).toBe("Established");
    expect(summaryValue("keepalives-exchanged-established", "R3 state")).toBe("Established");
    expect(summaryValue("r2-also-establishes-with-r3", "R2–R3 session")).toBe("Established");
  });

  it("advertises the same prefix from both peers with different AS_PATH lengths", () => {
    expect(summaryValue("r1-advertises-prefix", "AS_PATH")).toContain("65001");
    expect(summaryValue("r1-advertises-prefix", "AS_PATH")).toContain("1 AS");
    expect(summaryValue("r2-advertises-prefix", "AS_PATH")).toContain("65003 65004");
    expect(summaryValue("r2-advertises-prefix", "AS_PATH")).toContain("2 ASes");
  });

  it("ties on LOCAL_PREF and lets AS_PATH length decide, documenting the full decision order", () => {
    expect(summaryValue("r3-runs-the-decision-process", "LOCAL_PREF (both routes)")).toMatch(/tie/i);
    expect(summaryValue("r3-runs-the-decision-process", "AS_PATH comparison")).toContain("R1");
    expect(detailValue("r3-runs-the-decision-process", "Full decision order")).toMatch(/LOCAL_PREF.*AS_PATH.*ORIGIN.*MED.*eBGP over iBGP.*Router ID/);
  });

  it("installs the route via R1 and explains the remaining criteria were never needed", () => {
    expect(summaryValue("r3-installs-best-path", "Installed route")).toContain("via R1");
    expect(summaryValue("r3-installs-best-path", "Decided by")).toBe("AS_PATH length");
    expect(fieldsFor("r3-installs-best-path").stateNote).toMatch(/ORIGIN.*MED.*eBGP over iBGP/);
  });
});
