import { describe, expect, it } from "vitest";
import { safeParseRouteDecisionCatalog, type RouteDecisionScenarioInput } from "./route-decision.schema";

function validScenario(): RouteDecisionScenarioInput {
  return {
    id: "remote-via-gateway", difficulty: "foundational", title: "Reach a remote server",
    sourceIp: "192.168.10.20", sourcePrefixLength: 24, destinationIp: "203.0.113.10",
    interfaces: [{ id: "eth0", label: "Ethernet", ip: "192.168.10.20", prefixLength: 24, mac: "02:00:00:00:10:20" }],
    routes: [
      { id: "local", destination: "192.168.10.0", prefixLength: 24, interfaceId: "eth0", kind: "connected" },
      { id: "default", destination: "0.0.0.0", prefixLength: 0, nextHop: "192.168.10.1", interfaceId: "eth0", kind: "default" },
    ],
    destinationMac: "02:00:00:00:30:10", nextHopMac: "02:00:00:00:10:01", destinationKind: "unicast",
    expected: { scope: "remote-via-gateway", routeId: "default", interfaceId: "eth0", nextHopIp: "192.168.10.1", firstHopRecipient: "gateway", boundaryAction: "route-unicast" },
    plainExplanation: "The remote destination requires the gateway.",
    technicalExplanation: "Longest-prefix matching selects the default route, then ARP resolves the local next hop.",
    wrongAnswerExplanations: { scope: "Check the prefix.", interface: "Use the route interface.", nextHop: "Resolve the local next hop.", boundary: "Routers do not forward ordinary Layer 2 broadcasts." },
  };
}

describe("route-decision catalog schema", () => {
  it("accepts a complete and internally consistent catalog", () => {
    expect(safeParseRouteDecisionCatalog([validScenario()]).success).toBe(true);
  });

  it("rejects malformed IPv4 addresses", () => {
    for (const field of ["sourceIp", "destinationIp"] as const) {
      const scenario = validScenario(); scenario[field] = "999.1.2.3";
      expect(safeParseRouteDecisionCatalog([scenario]).success).toBe(false);
    }
  });

  it("rejects invalid prefixes and duplicate route identifiers", () => {
    const prefix = validScenario(); prefix.sourcePrefixLength = 33;
    expect(safeParseRouteDecisionCatalog([prefix]).success).toBe(false);
    const duplicate = validScenario(); duplicate.routes.push({ ...duplicate.routes[0] });
    expect(safeParseRouteDecisionCatalog([duplicate]).success).toBe(false);
  });

  it("rejects unknown interface and route references", () => {
    const routeInterface = validScenario(); routeInterface.routes[0].interfaceId = "eth9";
    expect(safeParseRouteDecisionCatalog([routeInterface]).success).toBe(false);
    const expectedRoute = validScenario(); expectedRoute.expected.routeId = "missing";
    expect(safeParseRouteDecisionCatalog([expectedRoute]).success).toBe(false);
  });

  it("enforces connected and default route shapes", () => {
    const connected = validScenario(); connected.routes[0].nextHop = "192.168.10.1";
    expect(safeParseRouteDecisionCatalog([connected]).success).toBe(false);
    const defaultRoute = validScenario(); defaultRoute.routes[1].destination = "10.0.0.0";
    expect(safeParseRouteDecisionCatalog([defaultRoute]).success).toBe(false);
  });

  it("rejects an off-link gateway and ambiguous equal-prefix routes", () => {
    const offLink = validScenario(); offLink.routes[1].nextHop = "10.10.10.1"; offLink.expected.nextHopIp = "10.10.10.1";
    expect(safeParseRouteDecisionCatalog([offLink]).success).toBe(false);
    const ambiguous = validScenario();
    ambiguous.routes.push({ id: "also-default", destination: "0.0.0.0", prefixLength: 0, nextHop: "192.168.10.2", interfaceId: "eth0", kind: "static" });
    expect(safeParseRouteDecisionCatalog([ambiguous]).success).toBe(false);
  });

  it("requires local broadcasts to stop at the router boundary", () => {
    const scenario = validScenario(); scenario.destinationKind = "local-broadcast";
    scenario.expected.scope = "local-broadcast"; scenario.expected.firstHopRecipient = "local-broadcast";
    delete scenario.expected.routeId; delete scenario.expected.nextHopIp;
    expect(safeParseRouteDecisionCatalog([scenario]).success).toBe(false);
  });
});
