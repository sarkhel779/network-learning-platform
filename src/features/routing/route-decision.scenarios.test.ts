import { describe, expect, it } from "vitest";
import { selectRoute } from "./select-route";
import { routeDecisionScenarios } from "./route-decision.scenarios";

describe("route decision scenarios", () => {
  it("covers every approved foundational outcome with unique ids", () => {
    expect(new Set(routeDecisionScenarios.map(({ id }) => id)).size).toBe(routeDecisionScenarios.length);
    expect(routeDecisionScenarios.map(({ id }) => id)).toEqual(expect.arrayContaining([
      "connected-ipv4", "static-preference", "learned-more-specific", "ipv4-host-route",
      "ipv6-host-route", "ipv4-default", "ipv6-default", "distance-tie",
      "metric-tie", "equal-cost-preview", "no-route",
    ]));
  });

  it("computes the authored winner for every scenario", () => {
    const expected: Record<string, readonly string[]> = {
      "connected-ipv4": ["connected"], "static-preference": ["static"],
      "learned-more-specific": ["learned-24"], "ipv4-host-route": ["host-32"],
      "ipv6-host-route": ["host-128"], "ipv4-default": ["default-v4"],
      "ipv6-default": ["default-v6"], "distance-tie": ["static"],
      "metric-tie": ["metric-10"], "equal-cost-preview": ["ecmp-a", "ecmp-b"],
      "no-route": [],
    };
    for (const scenario of routeDecisionScenarios) expect(selectRoute(scenario).outcome.routeIds).toEqual(expected[scenario.id]);
  });
});
