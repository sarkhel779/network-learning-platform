import { describe, expect, it } from "vitest";

import { tlsHandshakeScenario } from "./tls-handshake.scenario";

const fieldsFor = (stepId: string) => {
  const step = tlsHandshakeScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

describe("TLS 1.3 handshake scenario", () => {
  it("parses with a client and a server", () => {
    expect(tlsHandshakeScenario.devices.map((device) => device.id)).toEqual(["client", "server"]);
    expect(tlsHandshakeScenario.links.map((link) => link.id)).toEqual(["client-server"]);
  });

  it("sends a guessed key share in the ClientHello and gets one back immediately", () => {
    expect(summaryValue("client-hello", "SNI")).toBe("example.com");
    expect(summaryValue("client-hello", "Key share group")).toContain("guessed");
    expect(summaryValue("server-selects-parameters-and-sends-key-share", "Handshake traffic keys")).toContain("Derivable by both sides");
  });

  it("encrypts the certificate and proves possession of its private key", () => {
    expect(summaryValue("server-sends-encrypted-certificate", "Encrypted")).toContain("Yes");
    expect(summaryValue("server-sends-certificate-verify", "Proves")).toMatch(/private key/i);
  });

  it("completes the server's flight and the client's Finished in one round trip", () => {
    expect(fieldsFor("server-finished").stateNote).toMatch(/one round trip/i);
    expect(summaryValue("client-verifies-and-sends-finished", "Client validated")).toContain("CertificateVerify");
  });

  it("unlocks AEAD-protected application data after exactly one round trip", () => {
    expect(summaryValue("application-data-protected", "Round trips used")).toBe("1");
    expect(summaryValue("application-data-protected", "Protection")).toMatch(/AEAD/);
  });
});
