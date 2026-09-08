"use client";

import { useState } from "react";

import { PacketFlowPlayer } from "@/features/packet-flow/packet-flow-player";
import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

type DeliveryKind = "known" | "broadcast" | "multicast" | "unknown";

const devices = [
  { id: "sender", label: "Sender", role: "Ethernet host", x: 80, y: 120 },
  { id: "switch", label: "Switch", role: "Layer 2 switch", x: 330, y: 120 },
  { id: "host-b", label: "Host B", role: "intended receiver", x: 620, y: 55 },
  { id: "host-c", label: "Host C", role: "other LAN host", x: 620, y: 185 },
] as const;

const links = [
  { id: "sender-switch", from: "sender", to: "switch", fromInterface: "eth0", toInterface: "Gi0/1" },
  { id: "switch-b", from: "switch", to: "host-b", fromInterface: "Gi0/2", toInterface: "eth0" },
  { id: "switch-c", from: "switch", to: "host-c", fromInterface: "Gi0/3", toInterface: "eth0" },
] as const;

function createScenario(kind: DeliveryKind, title: string, destination: string, behavior: string, broadcast = false): PacketFlowScenario {
  const floods = kind === "broadcast" || kind === "unknown";
  return parsePacketFlowScenario({
    id: `ethernet-${kind}`,
    title,
    description: behavior,
    defaultSpeed: 1,
    devices,
    links,
    steps: [
      {
        id: "sender-builds-frame",
        title: "The sender builds an Ethernet frame",
        explanation: `The destination field is ${destination}. The source field identifies the sender's interface.`,
        durationMs: 2400,
        activeDeviceIds: ["sender"], activeLinkIds: [],
        summaryFields: [
          { label: "Destination MAC", value: destination, layer: "ethernet" },
          { label: "Source MAC", value: "02:00:00:00:00:0A", layer: "ethernet" },
          { label: "EtherType", value: "0x0800 (IPv4)", layer: "ethernet" },
        ],
        detailFields: [
          { label: "Payload", value: "IPv4 packet (46–1500 bytes without VLAN tagging)", layer: "ethernet" },
          { label: "FCS", value: "CRC-based error detection", layer: "ethernet" },
        ],
      },
      {
        id: "frame-reaches-switch",
        title: "The switch receives the frame",
        explanation: "The switch learns the source MAC on the ingress port, then looks up the destination MAC.",
        durationMs: 1800,
        activeDeviceIds: ["sender", "switch"], activeLinkIds: ["sender-switch"],
        packet: { kind: "frame", label: `${title} frame`, from: "sender", to: "switch", broadcast },
        summaryFields: [
          { label: "Destination MAC", value: destination, layer: "ethernet" },
          { label: "Source MAC", value: "02:00:00:00:00:0A", layer: "ethernet" },
        ],
        detailFields: [{ label: "Ingress port", value: "Gi0/1", layer: "context" }],
      },
      {
        id: "switch-delivers-frame",
        title: "The switch applies the delivery rule",
        explanation: behavior,
        durationMs: 2600,
        activeDeviceIds: floods ? ["switch", "host-b", "host-c"] : ["switch", "host-b"],
        activeLinkIds: floods ? ["switch-b", "switch-c"] : ["switch-b"],
        packet: { kind: "frame", label: `${title} frame`, from: "switch", to: "host-b", broadcast },
        summaryFields: [
          { label: "Destination MAC", value: destination, layer: "ethernet" },
          { label: "Delivery", value: floods ? "Multiple eligible egress ports" : "One known egress port", layer: "context" },
        ],
        detailFields: [{ label: "Switch action", value: behavior, layer: "context" }],
      },
    ],
  });
}

const scenarios: Record<DeliveryKind, PacketFlowScenario> = {
  known: createScenario("known", "Known unicast", "02:00:00:00:00:0B", "The switch forwards one copy on Host B's known port. Only the intended destination accepts the frame."),
  broadcast: createScenario("broadcast", "Broadcast", "FF:FF:FF:FF:FF:FF", "The switch floods the frame through every switch port in this VLAN except the ingress port. Every attached NIC examines it.", true),
  multicast: createScenario("multicast", "Multicast", "01:00:5E:00:00:FB", "The frame targets an interested receiver group. Here the group-aware switch forwards to subscribed Host B, not non-member Host C."),
  unknown: createScenario("unknown", "Unknown unicast", "02:00:00:00:00:99", "The destination is still a unicast destination, but the switch has not learned its port, so it floods the frame within the VLAN."),
};

const frameFields = [
  ["Preamble + SFD", "Synchronizes the receiver and marks the frame start."],
  ["Destination MAC", "Names the local-link destination or delivery group."],
  ["Source MAC", "Names the sending Ethernet interface."],
  ["EtherType / length", "Identifies the carried protocol in Ethernet II, or length in IEEE 802.3."],
  ["Payload", "Carries upper-layer data; padding supplies the minimum when needed."],
  ["Frame check sequence", "Helps the receiver detect transmission corruption."],
] as const;

export function EthernetFrameExplorer() {
  const [kind, setKind] = useState<DeliveryKind>("known");
  return (
    <section className="ethernet-explorer" aria-labelledby="ethernet-explorer-title">
      <h3 id="ethernet-explorer-title">Open the Ethernet frame</h3>
      <ol className="ethernet-frame" aria-label="Ethernet frame fields">
        {frameFields.map(([name, description]) => <li key={name}><strong>{name}</strong><span>{description}</span></li>)}
      </ol>
      <fieldset className="ethernet-explorer__choices">
        <legend>Choose a delivery address</legend>
        {(Object.keys(scenarios) as DeliveryKind[]).map((value) => (
          <label key={value}><input checked={kind === value} name="ethernet-delivery" onChange={() => setKind(value)} type="radio" />{scenarios[value].title}</label>
        ))}
      </fieldset>
      <PacketFlowPlayer autoplay inspectionDepthControl key={kind} scenario={scenarios[kind]} suppressHeading />
    </section>
  );
}
