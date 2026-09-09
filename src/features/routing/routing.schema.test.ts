import { describe, expect, it } from "vitest";
import { parseRouteDecisionScenario } from "./routing.schema";

const connected = { id: "connected", title: "Connected", family: "ipv4", destination: "192.0.2.20", routes: [{ id: "local", source: "connected", prefix: "192.0.2.0/24", outgoingInterface: "Gi0/0", administrativeDistance: 0, metric: 0, metricDomain: "connected" }] };

describe("routing scenario schema", () => {
  it("accepts connected routes and IPv4 and IPv6 host/default prefixes", () => {
    expect(parseRouteDecisionScenario(connected).routes[0].nextHop).toBeUndefined();
    expect(() => parseRouteDecisionScenario({ ...connected, family: "ipv6", destination: "2001:db8::20", routes: [{ ...connected.routes[0], prefix: "2001:db8::20/128" }] })).not.toThrow();
    expect(() => parseRouteDecisionScenario({ ...connected, routes: [{ ...connected.routes[0], prefix: "0.0.0.0/0" }] })).not.toThrow();
  });

  it.each([
    { ...connected, family: "ipx" },
    { ...connected, destination: "999.1.1.1" },
    { ...connected, routes: [{ ...connected.routes[0], prefix: "192.0.2.0/33" }] },
    { ...connected, routes: [{ ...connected.routes[0], outgoingInterface: "" }] },
    { ...connected, routes: [connected.routes[0], connected.routes[0]] },
  ])("rejects malformed authored data", (scenario) => expect(() => parseRouteDecisionScenario(scenario)).toThrow());
});
