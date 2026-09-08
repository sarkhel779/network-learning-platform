"use client";

import { useMemo, useState } from "react";

import { PacketFlowPlayer } from "@/features/packet-flow/packet-flow-player";
import { parsePacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";
import { evaluateVlanDelivery, type VlanAction, type VlanId } from "./evaluate-vlan-delivery";

type Journey = "vlan10" | "vlan20" | "same" | "cross";

const devices = [
  { id: "host-a", label: "Host A", role: "VLAN 10", x: 80, y: 55 },
  { id: "host-b", label: "Host B", role: "VLAN 10", x: 80, y: 185 },
  { id: "switch", label: "Switch", role: "separate VLAN forwarding", x: 390, y: 120 },
  { id: "host-c", label: "Host C", role: "VLAN 20", x: 700, y: 55 },
  { id: "host-d", label: "Host D", role: "changeable membership", x: 700, y: 185 },
] as const;

const links = [
  { id: "switch-host-a", from: "host-a", to: "switch", fromInterface: "Host A eth0", toInterface: "Switch Gi0/1 · access VLAN 10" },
  { id: "switch-host-b", from: "host-b", to: "switch", fromInterface: "Host B eth0", toInterface: "Switch Gi0/2 · access VLAN 10" },
  { id: "switch-host-c", from: "switch", to: "host-c", fromInterface: "Switch Gi0/3 · access VLAN 20", toInterface: "Host C eth0" },
] as const;

const choiceData: readonly { id: Journey; label: string; sourceId: "host-a" | "host-c"; vlan: VlanId; action: VlanAction }[] = [
  { id: "vlan10", label: "VLAN 10 broadcast", sourceId: "host-a", vlan: 10, action: "broadcast" },
  { id: "vlan20", label: "VLAN 20 broadcast", sourceId: "host-c", vlan: 20, action: "broadcast" },
  { id: "same", label: "Same-VLAN unicast", sourceId: "host-a", vlan: 10, action: "same-vlan-unicast" },
  { id: "cross", label: "Cross-VLAN destination", sourceId: "host-a", vlan: 10, action: "cross-vlan-unicast" },
];

export function VlanMembershipPlayer() {
  const [journey, setJourney] = useState<Journey>("vlan10");
  const [moveHostD, setMoveHostD] = useState(false);
  const scenario = useMemo(() => {
    const selected = choiceData.find(({ id }) => id === journey)!;
    const memberships = { "host-a": 10, "host-b": 10, "host-c": 20, "host-d": moveHostD ? 10 : 20 } as const;
    const result = evaluateVlanDelivery({ sourceId: selected.sourceId, sourceVlan: selected.vlan, action: selected.action, memberships });
    const dynamicLinks = [...links, {
      id: "switch-host-d", from: "switch", to: "host-d",
      fromInterface: `Switch Gi0/4 · access VLAN ${memberships["host-d"]}`,
      toInterface: "Host D eth0",
    }];
    const egressLinks = result.eligibleHostIds.map((id) => `switch-${id}`);
    return parsePacketFlowScenario({
      id: `vlan-membership-${journey}-${memberships["host-d"]}`,
      title: `${selected.label} delivery`,
      description: "Watch the switch classify ingress traffic and forward it only inside the selected VLAN.",
      defaultSpeed: 1, devices, links: dynamicLinks,
      steps: [
        {
          id: "classify", title: "1. Classify the ingress frame", durationMs: 2800,
          explanation: `The access port assigns the untagged endpoint frame to VLAN ${selected.vlan}. ${result.blockedReason ?? "That VLAN now defines the eligible Layer 2 scope."}`,
          activeDeviceIds: [selected.sourceId, "switch"], activeLinkIds: [`switch-${selected.sourceId}`],
          packet: { kind: "frame", label: `VLAN ${selected.vlan} frame`, from: selected.sourceId, to: "switch", broadcast: selected.action === "broadcast" },
          summaryFields: [{ label: "Ingress", value: result.ingressInterface, layer: "context" }, { label: "VLAN", value: String(selected.vlan), layer: "context", changed: true }],
          detailFields: [{ label: "Boundary", value: result.blockedReason ?? `Remain inside VLAN ${selected.vlan}`, layer: "context" }],
        },
        {
          id: "forward", title: result.blockedReason ? "2. Stop at the VLAN boundary" : "2. Forward only inside the VLAN", durationMs: 3000,
          explanation: result.blockedReason ?? `The switch uses only ${result.eligibleEgressInterfaces.join(", ") || "no other port"}; other VLANs receive no copy.`,
          activeDeviceIds: ["switch", ...result.eligibleHostIds], activeLinkIds: egressLinks,
          ...(egressLinks.length ? { packet: { kind: "frame" as const, label: `${selected.label} frame`, from: "switch", to: result.eligibleHostIds[0], broadcast: selected.action === "broadcast", fanOut: selected.action === "broadcast" } } : {}),
          summaryFields: [{ label: "Eligible egress", value: result.eligibleEgressInterfaces.join(", ") || "None", layer: "context" }],
          detailFields: [{ label: "Result", value: result.blockedReason ?? `Delivered only in VLAN ${selected.vlan}`, layer: "context" }],
        },
      ],
    });
  }, [journey, moveHostD]);

  return <section className="vlan-membership-player" aria-labelledby="vlan-membership-title">
    <h3 id="vlan-membership-title">Build the VLAN broadcast domains</h3>
    <p>Choose a journey, then move Host D to see how access-port membership changes delivery scope.</p>
    <fieldset className="vlan-membership-player__choices"><legend>Choose a VLAN journey</legend>
      {choiceData.map(({ id, label }) => <label key={id}><input type="radio" name="vlan-journey" checked={journey === id} onChange={() => setJourney(id)} />{label}</label>)}
    </fieldset>
    <label className="vlan-membership-player__move"><input type="checkbox" checked={moveHostD} onChange={(event) => setMoveHostD(event.target.checked)} />Move Host D to VLAN 10</label>
    <PacketFlowPlayer autoplay inspectionDepthControl key={`${journey}-${moveHostD}`} scenario={scenario} suppressHeading />
  </section>;
}
