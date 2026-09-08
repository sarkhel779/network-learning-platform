import { describe, expect, it } from "vitest";

import type { PacketLayer } from "@/features/packet-journey/packet-journey.types";

import { createRouteJourney } from "./create-route-journey";
import { evaluateRouteDecision } from "./evaluate-route-decision";
import { publicRouteDecisionScenarios } from "./route-decision.data";

function scenario(id: string) {
  return publicRouteDecisionScenarios.find((item) => item.id === id)!;
}

function field(layer: PacketLayer, label: string) {
  return layer.fields.find((item) => item.label === label)?.value;
}

describe("createRouteJourney", () => {
  it("opens, routes, and rebuilds a remote packet without implying NAT", () => {
    const selected = scenario("remote-through-default-gateway");
    const journey = createRouteJourney(selected, evaluateRouteDecision(selected));

    expect(journey.stages.map(({ id }) => id)).toEqual([
      "build-at-source",
      "leave-source-eth0",
      "open-at-router-lan",
      "choose-router-wan",
      "reframe-for-next-link",
      "deliver-to-destination",
    ]);

    const firstIp = journey.stages[0].layers.find(({ kind }) => kind === "ip")!;
    const routedIp = journey.stages[4].layers.find(({ kind }) => kind === "ip")!;
    expect([field(firstIp, "Source IP"), field(firstIp, "Destination IP"), field(firstIp, "TTL")]).toEqual([
      "192.0.2.10", "198.51.100.20", "64",
    ]);
    expect([field(routedIp, "Source IP"), field(routedIp, "Destination IP"), field(routedIp, "TTL")]).toEqual([
      "192.0.2.10", "198.51.100.20", "63",
    ]);

    const firstEthernet = journey.stages[1].layers.find(({ kind }) => kind === "ethernet")!;
    const secondEthernet = journey.stages[4].layers.find(({ kind }) => kind === "ethernet")!;
    expect(field(firstEthernet, "Destination MAC")).toBe("02:00:00:00:02:01");
    expect(field(secondEthernet, "Destination MAC")).not.toBe(field(firstEthernet, "Destination MAC"));
    expect(journey.stages[3].activeInterfaceId).toBe("Router WAN");
    expect(journey.stages[4].explanation).toMatch(/IP addresses stay the same/i);
  });

  it.each([
    ["same-subnet-destination", ["build-at-source", "direct-on-local-link", "deliver-to-destination"], "source-destination"],
    ["gateway-own-address", ["build-at-source", "leave-source-eth0", "receive-at-router-lan"], "source-router"],
    ["remote-without-route", ["build-at-source", "stop-no-route"], undefined],
    ["local-broadcast-boundary", ["build-broadcast-frame", "broadcast-on-local-link", "stop-at-router-boundary"], "source-router"],
  ])("builds the expected terminal journey for %s", (id, expectedStages, expectedLink) => {
    const selected = scenario(id);
    const journey = createRouteJourney(selected, evaluateRouteDecision(selected));

    expect(journey.stages.map(({ id: stageId }) => stageId)).toEqual(expectedStages);
    expect(journey.stages.at(-1)?.activeLinkId).toBe(expectedLink);
  });
});
