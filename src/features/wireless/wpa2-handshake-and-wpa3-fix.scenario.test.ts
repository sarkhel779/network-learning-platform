import { describe, expect, it } from "vitest";

import { wpa2HandshakeAndWpa3FixScenario } from "./wpa2-handshake-and-wpa3-fix.scenario";

const fieldsFor = (stepId: string) => {
  const step = wpa2HandshakeAndWpa3FixScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

const detailValue = (stepId: string, label: string) =>
  fieldsFor(stepId).detailFields.find((field) => field.label === label)?.value;

describe("WPA2 handshake and WPA3 fix scenario", () => {
  it("parses with a client, AP, and a passive attacker, linked only client-to-AP", () => {
    expect(wpa2HandshakeAndWpa3FixScenario.devices.map((device) => device.id)).toEqual(["client", "ap", "attacker"]);
    expect(wpa2HandshakeAndWpa3FixScenario.links.map((link) => link.id)).toEqual(["client-ap"]);
  });

  it("walks all four handshake messages in order", () => {
    expect(wpa2HandshakeAndWpa3FixScenario.steps.map((step) => step.id)).toEqual([
      "both-sides-already-derived-the-pmk",
      "ap-sends-anonce",
      "client-derives-ptk-and-replies",
      "ap-confirms-and-sends-gtk",
      "client-installs-keys-handshake-complete",
      "attacker-passively-captured-all-four-messages",
      "attacker-runs-an-offline-dictionary-attack",
      "wpa3-sae-closes-this-gap",
    ]);
  });

  it("derives the PMK without any network exchange, then the PTK during message 2", () => {
    expect(summaryValue("both-sides-already-derived-the-pmk", "PMK derived from")).toContain("never sent");
    expect(summaryValue("client-derives-ptk-and-replies", "Client now has")).toContain("PTK");
    expect(detailValue("client-derives-ptk-and-replies", "PTK derived from")).toMatch(/ANonce/);
  });

  it("completes the handshake with an encrypted, authenticated session", () => {
    expect(summaryValue("client-installs-keys-handshake-complete", "Session state")).toMatch(/encrypted/i);
  });

  it("shows the attacker captured the handshake in the clear and can attack it fully offline", () => {
    expect(summaryValue("attacker-passively-captured-all-four-messages", "Attacker captured")).toContain("ANonce");
    expect(summaryValue("attacker-runs-an-offline-dictionary-attack", "Attack surface")).toMatch(/offline/i);
    expect(fieldsFor("attacker-runs-an-offline-dictionary-attack").stateNote).toMatch(/structural weakness/i);
  });

  it("explains WPA3's SAE fix with forward secrecy", () => {
    expect(summaryValue("wpa3-sae-closes-this-gap", "WPA3 fix")).toMatch(/SAE/);
    expect(detailValue("wpa3-sae-closes-this-gap", "Also known as")).toMatch(/Dragonfly/i);
    expect(fieldsFor("wpa3-sae-closes-this-gap").stateNote).toMatch(/forward secrecy/i);
  });
});
