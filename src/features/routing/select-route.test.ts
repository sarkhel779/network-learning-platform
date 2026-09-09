import { describe, expect, it } from "vitest";
import { parseRouteDecisionScenario } from "./routing.schema";
import { selectRoute } from "./select-route";

describe("selectRoute", () => {
  it("uses family, match, longest prefix, distance, then metric", () => {
    const trace = selectRoute(parseRouteDecisionScenario({ id: "ordering", title: "Ordering", family: "ipv4", destination: "10.20.30.40", routes: [
      { id: "v6", source: "static", prefix: "2001:db8::/32", nextHop: "2001:db8::1", outgoingInterface: "Gi0/0", administrativeDistance: 1, metric: 0, metricDomain: "static" },
      { id: "broad", source: "learned", prefix: "10.0.0.0/8", nextHop: "192.0.2.1", outgoingInterface: "Gi0/1", administrativeDistance: 90, metric: 20, metricDomain: "eigrp" },
      { id: "higher-ad", source: "learned", prefix: "10.20.30.0/24", nextHop: "192.0.2.3", outgoingInterface: "Gi0/3", administrativeDistance: 90, metric: 5, metricDomain: "eigrp" },
      { id: "preferred", source: "static", prefix: "10.20.30.0/24", nextHop: "192.0.2.2", outgoingInterface: "Gi0/2", administrativeDistance: 1, metric: 0, metricDomain: "static" },
    ] }));
    expect(trace.stages.map(({ criterion }) => criterion)).toEqual(["address-family", "prefix-match", "longest-prefix", "administrative-distance", "metric"]);
    expect(trace.outcome).toEqual({ kind: "selected", routeIds: ["preferred"] });
  });

  it("returns no route when nothing matches", () => {
    const scenario = parseRouteDecisionScenario({ id: "none", title: "None", family: "ipv4", destination: "203.0.113.9", routes: [{ id: "local", source: "connected", prefix: "192.0.2.0/24", outgoingInterface: "Gi0/0", administrativeDistance: 0, metric: 0, metricDomain: "connected" }] });
    expect(selectRoute(scenario).outcome).toEqual({ kind: "no-route", routeIds: [] });
  });

  it("preserves an authored equal-cost set", () => {
    const scenario = parseRouteDecisionScenario({ id: "ecmp", title: "ECMP", family: "ipv4", destination: "203.0.113.9", allowEqualCost: true, routes: [
      { id: "a", source: "static", prefix: "203.0.113.0/24", nextHop: "192.0.2.1", outgoingInterface: "Gi0/0", administrativeDistance: 1, metric: 10, metricDomain: "static" },
      { id: "b", source: "static", prefix: "203.0.113.0/24", nextHop: "198.51.100.1", outgoingInterface: "Gi0/1", administrativeDistance: 1, metric: 10, metricDomain: "static" },
    ] });
    expect(selectRoute(scenario).outcome).toEqual({ kind: "equal-cost", routeIds: ["a", "b"] });
  });
});
