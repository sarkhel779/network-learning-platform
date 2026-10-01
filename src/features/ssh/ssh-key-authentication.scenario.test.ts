import { describe, expect, it } from "vitest";

import { sshKeyAuthenticationScenario } from "./ssh-key-authentication.scenario";

const fieldsFor = (stepId: string) => {
  const step = sshKeyAuthenticationScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

describe("SSH public-key authentication scenario", () => {
  it("parses with a client and a server", () => {
    expect(sshKeyAuthenticationScenario.devices.map((device) => device.id)).toEqual(["client", "server"]);
    expect(sshKeyAuthenticationScenario.links.map((link) => link.id)).toEqual(["client-server"]);
  });

  it("checks the host key via trust-on-first-use before any encryption exists", () => {
    expect(summaryValue("server-sends-host-key", "known_hosts match?")).toMatch(/first connection/i);
    expect(summaryValue("key-exchange-session-established", "Session")).toMatch(/encrypted/i);
  });

  it("never sends the private key, only a signature over a server-issued challenge", () => {
    expect(fieldsFor("client-offers-public-key").detailFields.find((field) => field.label === "Private key sent?")?.value).toMatch(/no/i);
    expect(summaryValue("server-challenges-client", "Proves nothing yet")).toMatch(/proof of possession/i);
    expect(summaryValue("client-signs-challenge", "Private key location")).toMatch(/only on the client/i);
    expect(fieldsFor("client-signs-challenge").stateNote).toMatch(/can't be replayed/i);
  });

  it("grants access and opens multiplexed channels after signature verification", () => {
    expect(summaryValue("server-grants-access-and-opens-channels", "Authentication")).toBe("Succeeded");
    expect(summaryValue("server-grants-access-and-opens-channels", "Channels available")).toContain("multiplexed");
  });
});
