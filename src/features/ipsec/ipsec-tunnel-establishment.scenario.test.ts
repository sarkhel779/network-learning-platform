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
  it("parses with a host and gateway on each side of the Internet", () => {
    expect(ipsecTunnelEstablishmentScenario.devices.map((device) => device.id)).toEqual([
      "host-a", "gateway-a", "internet", "gateway-b", "host-b",
    ]);
    expect(ipsecTunnelEstablishmentScenario.links.map((link) => link.id)).toEqual([
      "host-a-gateway-a", "gateway-a-internet", "internet-gateway-b", "gateway-b-host-b", "gateway-a-gateway-b",
    ]);
  });

  it("labels the tunnel link's public interfaces", () => {
    const tunnelLink = ipsecTunnelEstablishmentScenario.links.find((link) => link.id === "gateway-a-gateway-b");
    expect(tunnelLink?.fromInterface).toContain("70.0.0.1");
    expect(tunnelLink?.toInterface).toContain("80.0.0.1");
  });

  it("negotiates the IKE SA in the clear, then authenticates inside the now-encrypted channel", () => {
    expect(summaryValue("ike-sa-init-exchange", "Protected")).toMatch(/no/i);
    expect(summaryValue("ike-channel-established", "IKE SA")).toMatch(/encrypted/i);
    expect(summaryValue("ike-auth-exchange", "Exchange")).toBe("IKE_AUTH");
  });

  it("negotiates the Child SA in exactly two round trips", () => {
    expect(summaryValue("child-sa-negotiated", "Round trips used")).toContain("2");
  });

  it("carries the original packet from host-a onto the LAN before protection", () => {
    expect(summaryValue("original-packet-needs-protection", "Original packet")).toBe("10.0.1.5 → 10.0.2.5");
    expect(fieldsFor("original-packet-needs-protection").packet?.from).toBe("host-a");
    expect(fieldsFor("original-packet-needs-protection").packet?.to).toBe("gateway-a");
  });

  it("wraps the whole original packet in a new outer header under ESP tunnel mode", () => {
    expect(summaryValue("esp-tunnel-encapsulation", "Outer header")).toBe("R1 → R2");
    expect(fieldsFor("esp-tunnel-encapsulation").detailFields[0]?.value).toContain("50");
  });

  it("delivers the original packet unmodified onto host-b's LAN after R2 decapsulates it", () => {
    expect(summaryValue("gatewayb-decapsulates-and-forwards", "Delivered")).toContain("unmodified");
    expect(fieldsFor("gatewayb-decapsulates-and-forwards").packet?.to).toBe("host-b");
    expect(fieldsFor("gatewayb-decapsulates-and-forwards").stateNote).toMatch(/ever needed to know IPsec/i);
  });
});
