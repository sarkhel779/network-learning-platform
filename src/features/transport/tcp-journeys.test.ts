import { describe, expect, it } from "vitest";

import { buildTcpJourney, tcpScenarios } from "./tcp-journeys";

describe("TCP connection journeys", () => {
  it("provides every approved scenario with one terminal step", () => {
    expect(tcpScenarios.map(({ id }) => id)).toEqual([
      "handshake", "data-transfer", "lost-segment", "graceful-close", "connection-refused", "connection-timeout",
    ]);
    for (const scenario of tcpScenarios) {
      expect(buildTcpJourney(scenario).filter(({ terminal }) => terminal)).toHaveLength(1);
    }
  });

  it("keeps handshake flags, numbers, and endpoint states synchronized", () => {
    const journey = buildTcpJourney(tcpScenarios[0]);
    expect(journey.map(({ flags }) => flags)).toEqual([["SYN"], ["SYN", "ACK"], ["ACK"], []]);
    expect(journey[1]).toMatchObject({ sequenceNumber: 5000, acknowledgementNumber: 1001, serverState: "SYN-RECEIVED" });
    expect(journey[2]).toMatchObject({ acknowledgementNumber: 5001, clientState: "ESTABLISHED", serverState: "ESTABLISHED" });
  });

  it("retransmits the same sequence range and accepts its payload once", () => {
    const journey = buildTcpJourney(tcpScenarios[2]);
    const transmissions = journey.filter(({ payloadBytes }) => payloadBytes === 100);
    expect(transmissions.map(({ sequenceNumber }) => sequenceNumber)).toEqual([1001, 1001]);
    expect(journey.filter(({ outcome }) => outcome.includes("100 bytes accepted"))).toHaveLength(1);
    expect(journey.some(({ acknowledgementNumber }) => acknowledgementNumber === 1101)).toBe(true);
  });

  it("distinguishes graceful close, reset, and silent timeout", () => {
    expect(buildTcpJourney(tcpScenarios[3]).flatMap(({ flags }) => flags)).toContain("FIN");
    expect(buildTcpJourney(tcpScenarios[4]).flatMap(({ flags }) => flags)).toContain("RST");
    const timeout = buildTcpJourney(tcpScenarios[5]);
    expect(timeout.at(-1)).toMatchObject({ direction: "none", flags: [], terminal: true });
  });
});
