import { describe, expect, it } from "vitest";

import { buildDoraJourney, doraScenarios } from "./dora-journeys";

describe("direct DHCP journeys", () => {
  it("offers the approved direct scenarios", () => {
    expect(doraScenarios.map(({ id }) => id)).toEqual(["initial-allocation", "multiple-offers", "request-nak", "server-silence"]);
  });

  it("models DORA with exact ports, destinations, and one transaction", () => {
    const journey = buildDoraJourney(doraScenarios[0]);
    expect(journey.map(({ packet }) => packet.messageType)).toEqual(["DISCOVER", "OFFER", "REQUEST", "ACK"]);
    expect(journey.map(({ packet }) => [packet.udp.sourcePort, packet.udp.destinationPort])).toEqual([[68, 67], [67, 68], [68, 67], [67, 68]]);
    expect(journey[0].packet.ipv4).toEqual({ source: "0.0.0.0", destination: "255.255.255.255" });
    expect(journey[2].packet.deliveryMode).toBe("broadcast");
    expect(new Set(journey.map(({ packet }) => packet.bootp.xid)).size).toBe(1);
    expect(journey.filter(({ terminal }) => terminal)).toHaveLength(1);
  });

  it("carries offer, selection, and lease evidence in fields and options", () => {
    const journey = buildDoraJourney(doraScenarios[0]);
    expect(journey[1].packet.bootp.yiaddr).toBe("192.0.2.10");
    expect(journey[2].packet.options.map(({ code }) => code)).toEqual(expect.arrayContaining([50, 54]));
    expect(journey[3].packet.options.map(({ code }) => code)).toEqual(expect.arrayContaining([1, 3, 6, 51, 58, 59]));
  });

  it("ends server silence without fabricating an offer", () => {
    const journey = buildDoraJourney(doraScenarios[3]);
    expect(journey.map(({ packet }) => packet.messageType)).toEqual(["DISCOVER"]);
    expect(journey[0].packet.deliveryMode).toBe("silence");
    expect(journey[0].terminal).toBe(true);
  });
});
