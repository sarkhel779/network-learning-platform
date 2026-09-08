import { describe, expect, it } from "vitest";
import { evaluateRouteDecision, evaluateRoutePrediction, safeEvaluateRouteDecision } from "./evaluate-route-decision";
import { parseRouteDecisionCatalog, type RouteDecisionScenario } from "./route-decision.schema";

function scenario(overrides: Partial<RouteDecisionScenario> = {}) {
  return parseRouteDecisionCatalog([{
    id: "route-case", difficulty: "foundational", title: "Route case",
    sourceIp: "192.0.2.10", sourcePrefixLength: 24, destinationIp: "198.51.100.20",
    interfaces: [{ id: "eth0", label: "Ethernet", ip: "192.0.2.10", prefixLength: 24, mac: "02:00:00:00:00:10" }],
    routes: [
      { id: "local", destination: "192.0.2.0", prefixLength: 24, interfaceId: "eth0", kind: "connected" },
      { id: "default", destination: "0.0.0.0", prefixLength: 0, nextHop: "192.0.2.1", interfaceId: "eth0", kind: "default" },
    ],
    nextHopMac: "02:00:00:00:00:01", destinationKind: "unicast",
    expected: { scope: "remote-via-gateway", routeId: "default", interfaceId: "eth0", nextHopIp: "192.0.2.1", firstHopRecipient: "gateway", boundaryAction: "route-unicast" },
    plainExplanation: "Plain explanation.", technicalExplanation: "Technical explanation.",
    wrongAnswerExplanations: { scope: "Scope feedback.", interface: "Interface feedback.", nextHop: "Next-hop feedback.", boundary: "Boundary feedback." },
    ...overrides,
  }])[0];
}

describe("route decision evaluator", () => {
  it("delivers on-link traffic directly to the destination", () => {
    const local = scenario({ destinationIp: "192.0.2.44", expected: { scope: "on-link", routeId: "local", interfaceId: "eth0", nextHopIp: "192.0.2.44", firstHopRecipient: "destination", boundaryAction: "direct-delivery" } });
    expect(evaluateRouteDecision(local).firstHopRecipient).toBe("destination");
  });

  it("sends remote traffic to the selected gateway", () => {
    const result = evaluateRouteDecision(scenario());
    expect(result.firstHopRecipient).toBe("gateway");
    expect(result.nextHopIp).toBe("192.0.2.1");
  });

  it("uses longest-prefix matching instead of route order", () => {
    const input = scenario({
      destinationIp: "198.51.100.20",
      routes: [
        { id: "default", destination: "0.0.0.0", prefixLength: 0, nextHop: "192.0.2.1", interfaceId: "eth0", kind: "default" },
        { id: "route-office", destination: "198.51.100.0", prefixLength: 24, nextHop: "192.0.2.2", interfaceId: "eth0", kind: "static" },
      ],
      expected: { scope: "remote-via-gateway", routeId: "route-office", interfaceId: "eth0", nextHopIp: "192.0.2.2", firstHopRecipient: "gateway", boundaryAction: "route-unicast" },
    });
    expect(evaluateRouteDecision(input).routeId).toBe("route-office");
  });

  it("returns no-route when nothing matches", () => {
    const input = scenario({ routes: [{ id: "local", destination: "192.0.2.0", prefixLength: 24, interfaceId: "eth0", kind: "connected" }], expected: { scope: "no-route", firstHopRecipient: "none", boundaryAction: "host-routing-failure" } });
    expect(evaluateRouteDecision(input).scope).toBe("no-route");
  });

  it("stops a local broadcast at the router boundary", () => {
    const input = scenario({ destinationIp: "192.0.2.255", destinationKind: "local-broadcast", expected: { scope: "local-broadcast", interfaceId: "eth0", firstHopRecipient: "local-broadcast", boundaryAction: "stop-broadcast" } });
    expect(evaluateRouteDecision(input).boundaryAction).toBe("stop-broadcast");
  });

  it("uses the configured prefix rather than assuming /24", () => {
    const input = scenario({ sourceIp: "192.0.16.10", sourcePrefixLength: 20, destinationIp: "192.0.31.20", interfaces: [{ id: "eth0", label: "Ethernet", ip: "192.0.16.10", prefixLength: 20, mac: "02:00:00:00:00:10" }], routes: [{ id: "local", destination: "192.0.16.0", prefixLength: 20, interfaceId: "eth0", kind: "connected" }], expected: { scope: "on-link", routeId: "local", interfaceId: "eth0", nextHopIp: "192.0.31.20", firstHopRecipient: "destination", boundaryAction: "direct-delivery" } });
    expect(evaluateRouteDecision(input).scope).toBe("on-link");
  });

  it("scores each learner decision independently", () => {
    const result = evaluateRoutePrediction(scenario(), { scope: "remote-via-gateway", interfaceId: "eth0", nextHopIp: "198.51.100.20", boundaryAction: "direct-delivery" });
    expect(result).toMatchObject({ scopeCorrect: true, interfaceCorrect: true, nextHopCorrect: false, boundaryCorrect: false });
    expect(result.feedback.nextHop).toBe("Next-hop feedback.");
  });

  it("safely rejects unknown scenario input", () => {
    expect(safeEvaluateRouteDecision({ id: "broken" }).success).toBe(false);
  });
});
