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

  it("keeps introductory router teaching in the MDX source", () => {
    const lesson = readFileSync(resolve("src/content/networking-foundations/routers-default-gateways-and-network-boundaries.public.mdx"), "utf8");
    for (const id of ["what-a-router-does", "router-interfaces", "network-boundaries", "default-gateway", "place-the-router", "knowledge-check"]) {
      expect(lesson).toContain(`id="${id}"`);
    }
    expect(lesson).toContain("A **router** connects different IP networks.");
    expect(lesson).toContain("A host's **default gateway** is normally a router interface on the host's own network.");
    expect(lesson).toContain("<RouterBoundaryPlacement />");
  });
});
