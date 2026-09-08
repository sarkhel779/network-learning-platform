import type { RouteDecisionScenarioInput } from "./route-decision.schema";

const eth0 = { id: "eth0", label: "Ethernet 0", ip: "192.0.2.10", prefixLength: 24, mac: "02:00:00:00:02:10" };
const local = { id: "local", destination: "192.0.2.0", prefixLength: 24, interfaceId: "eth0", kind: "connected" as const };
const defaultRoute = { id: "default", destination: "0.0.0.0", prefixLength: 0, nextHop: "192.0.2.1", interfaceId: "eth0", kind: "default" as const };
const wrong = { scope: "Recalculate the network using the configured prefix.", interface: "Read the interface on the matching route.", nextHop: "Resolve only the next hop on the local link.", boundary: "Separate host route failure from router forwarding failure." };

function practice(overrides: Partial<RouteDecisionScenarioInput>): RouteDecisionScenarioInput {
  return {
    id: "practice", difficulty: "foundational", title: "Routing practice", sourceIp: "192.0.2.10", sourcePrefixLength: 24,
    destinationIp: "198.51.100.20", interfaces: [eth0], routes: [local, defaultRoute], destinationKind: "unicast",
    expected: { scope: "remote-via-gateway", routeId: "default", interfaceId: "eth0", nextHopIp: "192.0.2.1", firstHopRecipient: "gateway", boundaryAction: "route-unicast" },
    plainExplanation: "Use the route evidence to choose the local next hop.", technicalExplanation: "Apply longest-prefix matching, then resolve the selected next hop on-link.", wrongAnswerExplanations: wrong,
    ...overrides,
  };
}

export const accountRouteDecisionScenarioInput: RouteDecisionScenarioInput[] = [
  practice({ id: "correct-local-delivery", title: "Correct local delivery", destinationIp: "192.0.2.55", destinationMac: "02:00:00:00:02:55", expected: { scope: "on-link", routeId: "local", interfaceId: "eth0", nextHopIp: "192.0.2.55", firstHopRecipient: "destination", boundaryAction: "direct-delivery" } }),
  practice({ id: "correct-default-gateway", title: "Correct default-gateway decision" }),
  practice({ id: "missing-default-route", title: "Missing default route", routes: [local], expected: { scope: "no-route", firstHopRecipient: "none", boundaryAction: "host-routing-failure" } }),
  practice({ id: "gateway-not-on-link", title: "Configured gateway is not locally reachable", routes: [local], expected: { scope: "no-route", firstHopRecipient: "none", boundaryAction: "host-routing-failure" }, plainExplanation: "The configured gateway is outside the local prefix and no valid on-link route makes it usable.", technicalExplanation: "Reject the off-link gateway as unusable; without a valid matching route the host cannot form the first-hop frame." }),
  practice({ id: "wrong-prefix", difficulty: "intermediate", title: "Wrong prefix changes the decision", sourceIp: "192.0.2.10", sourcePrefixLength: 16, destinationIp: "192.0.3.20", interfaces: [{ ...eth0, prefixLength: 16 }], routes: [{ id: "too-wide-local", destination: "192.0.0.0", prefixLength: 16, interfaceId: "eth0", kind: "connected" }], expected: { scope: "on-link", routeId: "too-wide-local", interfaceId: "eth0", nextHopIp: "192.0.3.20", firstHopRecipient: "destination", boundaryAction: "direct-delivery" } }),
  practice({ id: "more-specific-route", difficulty: "intermediate", title: "More-specific route overrides the default", destinationIp: "198.51.100.20", routes: [defaultRoute, { id: "office", destination: "198.51.100.0", prefixLength: 24, nextHop: "192.0.2.2", interfaceId: "eth0", kind: "static" }], expected: { scope: "remote-via-gateway", routeId: "office", interfaceId: "eth0", nextHopIp: "192.0.2.2", firstHopRecipient: "gateway", boundaryAction: "route-unicast" } }),
  practice({ id: "router-onward-no-route", difficulty: "intermediate", title: "Router has no onward route", sourceIp: "192.0.2.1", destinationIp: "203.0.113.40", interfaces: [{ ...eth0, ip: "192.0.2.1", mac: "02:00:00:00:02:01" }], routes: [local], expected: { scope: "no-route", firstHopRecipient: "none", boundaryAction: "router-no-route" }, plainExplanation: "The packet reached a router, but that router has no onward route.", technicalExplanation: "The router's lookup has no matching prefix, so forwarding stops at the router rather than at the source host." }),
];
