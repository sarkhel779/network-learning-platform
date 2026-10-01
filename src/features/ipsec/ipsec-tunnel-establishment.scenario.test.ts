import { describe, expect, it } from "vitest";

import { ipsecTunnelEstablishmentScenario } from "./ipsec-tunnel-establishment.scenario";

const fieldsFor = (stepId: string) => {
  const step = ipsecTunnelEstablishmentScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

describe("IPsec tunnel establishment scenario", () => {
  it("parses with two gateways", () => {
    expect(ipsecTunnelEstablishmentScenario.devices.map((device) => device.id)).toEqual(["gateway-a", "gateway-b"]);
    expect(ipsecTunnelEstablishmentScenario.links.map((link) => link.id)).toEqual(["gateway-a-gateway-b"]);
  });

  it("negotiates the IKE SA in the clear, then authenticates inside the now-encrypted channel", () => {
    expect(summaryValue("ike-sa-init-exchange", "Protected")).toMatch(/no/i);
    expect(summaryValue("ike-channel-established", "IKE SA")).toMatch(/encrypted/i);
    expect(summaryValue("ike-auth-exchange", "Exchange")).toBe("IKE_AUTH");
  });

  it("negotiates the Child SA in exactly two round trips", () => {
    expect(summaryValue("child-sa-negotiated", "Round trips used")).toContain("2");
  });

  it("wraps the whole original packet in a new outer header under ESP tunnel mode", () => {
    expect(summaryValue("original-packet-needs-protection", "Original packet")).toBe("10.0.1.5 → 10.0.2.5");
    expect(summaryValue("esp-tunnel-encapsulation", "Outer header")).toBe("Gateway A → Gateway B");
    expect(fieldsFor("esp-tunnel-encapsulation").detailFields[0]?.value).toContain("50");
  });

  it("delivers the original packet unmodified after Gateway B decapsulates it", () => {
    expect(summaryValue("gatewayb-decapsulates-and-forwards", "Delivered")).toContain("unmodified");
    expect(fieldsFor("gatewayb-decapsulates-and-forwards").stateNote).toMatch(/ever needed to know IPsec/i);
  });
});
