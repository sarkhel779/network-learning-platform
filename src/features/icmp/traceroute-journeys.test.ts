import { describe, expect, it } from "vitest";
import { buildTracerouteJourney, parseTracerouteScenario, tracerouteScenarios } from "./traceroute-journeys";

describe("traceroute journeys", () => {
  it("discovers a stable path with increasing TTL and destination completion", () => {
    const stable = tracerouteScenarios[0];
    const steps = buildTracerouteJourney(stable);
    expect(steps.filter(({ phase }) => phase === "send").map(({ probeTtl }) => probeTtl)).toEqual([1, 2, 3]);
    expect(steps.filter(({ response }) => response?.kind === "time-exceeded").map(({ response }) => response?.reporterId)).toEqual(["router-1", "router-2"]);
    expect(steps.at(-1)).toMatchObject({ terminal: true, destinationReached: true });
  });

  it("keeps a silent hop while later responses prove forwarding continued", () => {
    const scenario = tracerouteScenarios.find(({ outcome }) => outcome === "silent-hop")!;
    const observations = buildTracerouteJourney(scenario).filter(({ phase }) => phase === "observe");
    expect(observations.map(({ observedResponder }) => observedResponder)).toEqual(["192.0.2.1", "*", "198.51.100.20"]);
    expect(observations[1].explanation).toMatch(/does not prove.*failed to forward/i);
  });

  it("preserves different responders for changing probes and identifies unreachable reporters", () => {
    const changing = tracerouteScenarios.find(({ outcome }) => outcome === "changing-path")!;
    expect(buildTracerouteJourney(changing).filter(({ phase }) => phase === "observe").map(({ observedResponder }) => observedResponder)).toContain("203.0.113.9");
    const unreachable = tracerouteScenarios.find(({ outcome }) => outcome === "unreachable")!;
    expect(unreachable.probes.at(-1)?.response?.reporterId).toBe("router-2");
  });

  it("keeps incomplete traces terminal without claiming destination reachability", () => {
    const incomplete = tracerouteScenarios.find(({ outcome }) => outcome === "incomplete")!;
    expect(buildTracerouteJourney(incomplete).at(-1)).toMatchObject({ terminal: true, destinationReached: false });
  });

  it("rejects impossible probes and completion claims", () => {
    const stable = tracerouteScenarios[0];
    expect(() => parseTracerouteScenario({ ...stable, probes: [{ ...stable.probes[0], ttl: 0 }] })).toThrow();
    expect(() => parseTracerouteScenario({ ...stable, probes: [stable.probes[0], stable.probes[0]] })).toThrow();
    expect(() => parseTracerouteScenario({ ...stable, probes: stable.probes.map((probe) => ({ ...probe, response: probe.response ? { ...probe.response, reporterId: "missing" } : null })) })).toThrow();
    expect(() => parseTracerouteScenario({ ...stable, probes: stable.probes.map((probe) => ({ ...probe, response: null })) })).toThrow();
  });
});
