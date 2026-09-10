import { describe, expect, it } from "vitest";

import { buildRelayJourney, relayScenarios } from "./relay-journeys";

describe("DHCP relay journeys", () => {
  it("offers successful and failure helper-address scenarios", () => {
    expect(relayScenarios.map(({ id }) => id)).toEqual(["remote-allocation", "missing-helper", "wrong-scope", "blocked-upstream"]);
  });

  it("traces both halves of relayed DORA using exact UDP ports", () => {
    const journey = buildRelayJourney(relayScenarios[0]);
    expect(journey.map(({ packet }) => [packet.udp.sourcePort, packet.udp.destinationPort])).toEqual([
      [68, 67], [67, 67], [67, 67], [67, 68],
      [68, 67], [67, 67], [67, 67], [67, 68],
    ]);
    expect(journey.map(({ packet }) => packet.messageType)).toEqual(["DISCOVER", "DISCOVER", "OFFER", "OFFER", "REQUEST", "REQUEST", "ACK", "ACK"]);
  });

  it("uses giaddr for pool selection and handles Option 82 at the trust boundary", () => {
    const journey = buildRelayJourney(relayScenarios[0]);
    expect(journey[1].packet.bootp.giaddr).toBe("192.0.2.1");
    expect(journey[1].packet.bootp.hops).toBe(1);
    expect(journey[1].packet.options.some(({ code }) => code === 82)).toBe(true);
    expect(journey[2].packet.options.some(({ code }) => code === 82)).toBe(true);
    expect(journey[3].packet.options.some(({ code }) => code === 82)).toBe(false);
    expect(journey[6].evidence).toMatch(/192\.0\.2\.0\/24 pool/);
  });

  it("stops locally when no helper is configured", () => {
    const journey = buildRelayJourney(relayScenarios[1]);
    expect(journey).toHaveLength(1);
    expect(journey[0].packet.leg).toBe("client-to-server");
    expect(journey[0].terminal).toBe(true);
    expect(journey[0].explanation).toMatch(/no helper/i);
  });
});
