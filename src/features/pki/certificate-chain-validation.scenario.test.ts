import { describe, expect, it } from "vitest";

import { certificateChainValidationScenario } from "./certificate-chain-validation.scenario";

const fieldsFor = (stepId: string) => {
  const step = certificateChainValidationScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

describe("PKI certificate chain validation scenario", () => {
  it("parses with a client, server, intermediate CA, and root CA", () => {
    expect(certificateChainValidationScenario.devices.map((device) => device.id)).toEqual(["client", "server", "intermediate-ca", "root-ca"]);
    expect(certificateChainValidationScenario.links.map((link) => link.id)).toEqual(["client-server"]);
  });

  it("sends the leaf and intermediate but not the root", () => {
    expect(summaryValue("server-presents-chain", "Sent by server")).toContain("not root");
  });

  it("walks the chain leaf -> intermediate -> root before checking the trust store", () => {
    expect(summaryValue("client-checks-leaf-signature", "Leaf signature")).toMatch(/valid/i);
    expect(summaryValue("client-checks-intermediate-signature", "Intermediate signature")).toMatch(/valid/i);
    expect(summaryValue("client-finds-root-in-trust-store", "Root CA in trust store?")).toBe("Yes — pre-installed");
  });

  it("checks validity, hostname, and revocation after the chain itself is verified", () => {
    expect(summaryValue("client-checks-validity-and-hostname", "Hostname in SAN?")).toContain("example.com");
    expect(summaryValue("client-checks-revocation-status", "Revocation status")).toBe("Not revoked");
  });

  it("concludes with a fully verified chain to a trusted root", () => {
    expect(summaryValue("chain-verified-connection-trusted", "Chain")).toContain("trusted root");
    expect(summaryValue("chain-verified-connection-trusted", "Server identity")).toBe("Trusted");
  });
});
