import { describe, expect, it } from "vitest";
import { buildPingJourney, pingScenarios } from "./ping-journeys";

describe("ping journeys", () => {
  it("authors every approved outcome with one deterministic terminal step", () => {
    expect(pingScenarios.map(({ outcome }) => outcome)).toEqual([
      "success", "timeout", "network-unreachable", "host-unreachable",
      "administratively-prohibited", "ttl-exceeded",
    ]);
    for (const scenario of pingScenarios) {
      const journey = buildPingJourney(scenario);
      expect(journey.filter(({ terminal }) => terminal)).toHaveLength(1);
      expect(journey.at(-1)?.terminal).toBe(true);
    }
  });

  it("never invents a response for a timeout", () => {
    const timeout = pingScenarios.find(({ outcome }) => outcome === "timeout")!;
    const journey = buildPingJourney(timeout);
    expect(journey.filter(({ packet }) => packet?.direction === "response")).toHaveLength(0);
    expect(journey.at(-1)?.explanation).toMatch(/No reply was observed before the deadline/i);
  });

  it("keeps the ICMP reporter separate from the intended destination", () => {
    const unreachable = pingScenarios.find(({ outcome }) => outcome === "host-unreachable")!;
    expect(unreachable.response?.reporterId).toBe("router");
    expect(unreachable.response?.reporterId).not.toBe(unreachable.destinationId);
    expect(buildPingJourney(unreachable).some(({ evidence }) =>
      evidence.some(({ label, value }) => label === "Reporting device" && value === "Gateway Router"),
    )).toBe(true);
  });
});
