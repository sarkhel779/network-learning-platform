import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { evaluateRouteDecision } from "./evaluate-route-decision";
import { publicRouteDecisionScenarios } from "./route-decision.data";
import { safeParseRouteDecisionCatalog } from "./route-decision.schema";

describe("public route-decision scenarios", () => {
  it("contains exactly five unique, valid public scenarios", () => {
    expect(publicRouteDecisionScenarios).toHaveLength(5);
    expect(new Set(publicRouteDecisionScenarios.map(({ id }) => id))).toHaveProperty("size", 5);
    expect(safeParseRouteDecisionCatalog(publicRouteDecisionScenarios).success).toBe(true);
  });

  it("covers direct, gateway, no-route, gateway-self, and broadcast-boundary decisions", () => {
    expect(publicRouteDecisionScenarios.map(({ id }) => id)).toEqual([
      "same-subnet-destination", "remote-through-default-gateway", "remote-without-route", "gateway-own-address", "local-broadcast-boundary",
    ]);
    expect(publicRouteDecisionScenarios.map(evaluateRouteDecision).map(({ scope }) => scope)).toEqual([
      "on-link", "remote-via-gateway", "no-route", "on-link", "local-broadcast",
    ]);
  });

  it("uses documentation-only addresses and excludes protected scenario identifiers", () => {
    const serialized = JSON.stringify(publicRouteDecisionScenarios);
    for (const scenario of publicRouteDecisionScenarios) {
      expect([scenario.sourceIp, scenario.destinationIp, ...scenario.interfaces.map(({ ip }) => ip)])
        .toEqual(expect.arrayContaining([expect.stringMatching(/^(192\.0\.2|198\.51\.100|203\.0\.113)\./)]));
    }
    expect(serialized).not.toMatch(/off-link-gateway|wrong-prefix|more-specific-route|router-no-onward-route/);
  });

  it("keeps the complete public teaching fallback in the MDX source", () => {
    const lesson = readFileSync(resolve("src/content/networking-foundations/routers-default-gateways-and-network-boundaries.public.mdx"), "utf8");
    for (const id of ["why-network-boundaries-matter", "what-a-router-does", "local-or-remote", "default-gateway", "direct-and-routed-delivery", "what-changes-at-each-hop", "route-decision-player"]) {
      expect(lesson).toContain(`id="${id}"`);
    }
    expect(lesson).toContain("matching the first three octets is not a general subnet rule");
    expect(lesson).toContain("This example does not use NAT");
    expect(lesson).toContain("Ordinary Layer 2 broadcasts stop at the router boundary");
    expect(lesson).toContain("<RouteDecisionPlayer />");
    expect(lesson).toMatch(/Question.*Direct delivery.*Routed delivery.*No route/s);
  });
});
