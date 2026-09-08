import { describe, expect, it } from "vitest";

import { evaluateVlanDelivery } from "./evaluate-vlan-delivery";

const memberships = { "host-a": 10, "host-b": 10, "host-c": 20, "host-d": 20 } as const;

describe("evaluateVlanDelivery", () => {
  it("floods a broadcast only to same-VLAN peers and excludes ingress", () => {
    expect(evaluateVlanDelivery({ sourceId: "host-a", sourceVlan: 10, action: "broadcast", memberships })).toMatchObject({
      ingressInterface: "Gi0/1",
      vlan: 10,
      eligibleHostIds: ["host-b"],
      eligibleEgressInterfaces: ["Gi0/2"],
    });
  });

  it("blocks a cross-VLAN unicast at the Layer 2 boundary", () => {
    expect(evaluateVlanDelivery({ sourceId: "host-a", sourceVlan: 10, action: "cross-vlan-unicast", memberships })).toMatchObject({
      eligibleHostIds: [],
      eligibleEgressInterfaces: [],
      blockedReason: "Layer 2 boundary: different VLAN",
    });
  });

  it("includes a host after its access membership moves into the source VLAN", () => {
    const moved = { ...memberships, "host-d": 10 } as const;
    expect(evaluateVlanDelivery({ sourceId: "host-a", sourceVlan: 10, action: "broadcast", memberships: moved }).eligibleHostIds)
      .toEqual(["host-b", "host-d"]);
  });
});
