import { describe, expect, it } from "vitest";

import { buildPortDeliveryJourney, portDeliveryScenarios, udpPortDeliveryScenarios } from "./port-delivery-journeys";

describe("TCP and UDP port-delivery journeys", () => {
  it("provides all approved listener and no-listener scenarios", () => {
    expect(portDeliveryScenarios.map(({ id }) => id)).toEqual([
      "tcp-listener", "udp-listener", "ephemeral-clients", "tcp-no-listener", "udp-no-listener", "udp-ephemeral-clients",
    ]);
  });

  it("preserves the protocol and four-tuple through every step", () => {
    const journey = buildPortDeliveryJourney(portDeliveryScenarios[0]);
    expect(new Set(journey.map(({ tuple }) => tuple))).toEqual(new Set(["TCP 192.0.2.10:49152 → 198.51.100.20:443"]));
    expect(journey.at(-1)).toMatchObject({ application: "HTTPS service", terminal: true });
  });

  it("uses distinct ephemeral source ports for simultaneous clients", () => {
    const journey = buildPortDeliveryJourney(portDeliveryScenarios[2]);
    expect(journey.at(-1)?.relatedTuples).toEqual([
      "TCP 192.0.2.10:49152 → 198.51.100.20:443",
      "TCP 192.0.2.10:49153 → 198.51.100.20:443",
    ]);
  });

  it("distinguishes TCP reset evidence from conditional UDP outcomes", () => {
    expect(buildPortDeliveryJourney(portDeliveryScenarios[3]).at(-1)?.conclusion).toMatch(/RST/);
    const udp = buildPortDeliveryJourney(portDeliveryScenarios[4]).at(-1)?.conclusion ?? "";
    expect(udp).toMatch(/may return ICMP Port Unreachable/i);
    expect(udp).toMatch(/silence/i);
  });

  it("offers only UDP examples in the focused UDP lesson", () => {
    expect(udpPortDeliveryScenarios.map(({ id }) => id)).toEqual(["udp-listener", "udp-no-listener", "udp-ephemeral-clients"]);
    expect(udpPortDeliveryScenarios.every(({ protocol }) => protocol === "UDP")).toBe(true);
  });
});
