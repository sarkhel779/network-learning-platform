export type VlanId = 10 | 20;
export type HostId = "host-a" | "host-b" | "host-c" | "host-d";
export type VlanAction = "broadcast" | "same-vlan-unicast" | "cross-vlan-unicast";

export type VlanDeliveryInput = {
  sourceId: "host-a" | "host-c";
  sourceVlan: VlanId;
  action: VlanAction;
  memberships: Readonly<Record<HostId, VlanId>>;
};

export type VlanDeliveryResult = {
  ingressInterface: string;
  vlan: VlanId;
  eligibleHostIds: readonly HostId[];
  eligibleEgressInterfaces: readonly string[];
  blockedReason?: "Layer 2 boundary: different VLAN";
};

const interfaces: Record<HostId, string> = {
  "host-a": "Gi0/1",
  "host-b": "Gi0/2",
  "host-c": "Gi0/3",
  "host-d": "Gi0/4",
};

export function evaluateVlanDelivery(input: VlanDeliveryInput): VlanDeliveryResult {
  const base = { ingressInterface: interfaces[input.sourceId], vlan: input.sourceVlan };
  if (input.action === "cross-vlan-unicast") {
    return { ...base, eligibleHostIds: [], eligibleEgressInterfaces: [], blockedReason: "Layer 2 boundary: different VLAN" };
  }

  const peers = (Object.keys(input.memberships) as HostId[])
    .filter((id) => id !== input.sourceId && input.memberships[id] === input.sourceVlan);
  const eligibleHostIds = input.action === "same-vlan-unicast" ? peers.slice(0, 1) : peers;
  return { ...base, eligibleHostIds, eligibleEgressInterfaces: eligibleHostIds.map((id) => interfaces[id]) };
}
