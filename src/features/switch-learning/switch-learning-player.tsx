"use client";

import { useState } from "react";

import { PacketFlowPlayer } from "@/features/packet-flow/packet-flow-player";
import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

type LearningCase = "known" | "unknown" | "broadcast" | "moved";

const knownDevices = [
  { id: "sender", label: "Host A", role: "sending workstation", x: 70, y: 120 },
  { id: "switch", label: "Switch", role: "Layer 2 forwarding device", x: 330, y: 120 },
  { id: "host-b", label: "Host B", role: "known destination", x: 620, y: 55 },
  { id: "host-c", label: "Host C", role: "other LAN host", x: 620, y: 185 },
] as const;

const knownLinks = [
  { id: "sender-switch", from: "sender", to: "switch", fromInterface: "Host A eth0", toInterface: "Switch Gi0/1" },
  { id: "switch-b", from: "switch", to: "host-b", fromInterface: "Switch Gi0/2", toInterface: "Host B eth0" },
  { id: "switch-c", from: "switch", to: "host-c", fromInterface: "Switch Gi0/3", toInterface: "Host C eth0" },
] as const;

const sourceMac = "02:00:00:00:00:0A";
const hostBMac = "02:00:00:00:00:0B";

function scenario(
  id: LearningCase,
  title: string,
  destinationMac: string,
  description: string,
  decision: string,
  activeEgressLinks: readonly string[],
  tableBefore: string,
  tableAfter: string,
  broadcast = false,
): PacketFlowScenario {
  const moved = id === "moved";
  const frameSourceMac = moved ? hostBMac : sourceMac;
  const ingressInterface = moved ? "Gi0/3" : "Gi0/1";
  const devices = moved ? [
    { id: "sender", label: "Host B (moved)", role: "source on its new connection", x: 70, y: 120 },
    { id: "switch", label: "Switch", role: "Layer 2 forwarding device", x: 330, y: 120 },
    { id: "host-b", label: "Host A", role: "known destination", x: 620, y: 55 },
    { id: "host-c", label: "Other host", role: "other LAN host", x: 620, y: 185 },
  ] : knownDevices;
  const links = moved ? [
    { id: "sender-switch", from: "sender", to: "switch", fromInterface: "Host B (moved) eth0", toInterface: "Switch Gi0/3 ingress" },
    { id: "switch-b", from: "switch", to: "host-b", fromInterface: "Switch Gi0/1 egress", toInterface: "Host A eth0" },
    { id: "switch-c", from: "switch", to: "host-c", fromInterface: "Switch Gi0/2", toInterface: "Other host eth0" },
  ] : knownLinks;
  return parsePacketFlowScenario({
    id: `switch-learning-${id}`,
    title,
    description,
    defaultSpeed: 1,
    devices,
    links,
    steps: [
      {
        id: "receive-frame", title: `Frame arrives on ${ingressInterface}`,
        explanation: `${moved ? "Host B" : "Host A"} transmits one Ethernet frame. The switch receives it on ${ingressInterface} before making any forwarding decision.`,
        durationMs: 2200, activeDeviceIds: ["sender", "switch"], activeLinkIds: ["sender-switch"],
        packet: { kind: "frame", label: `${title} Ethernet frame`, from: "sender", to: "switch", broadcast },
        summaryFields: [{ label: "Source MAC", value: frameSourceMac, layer: "ethernet" }, { label: "Destination MAC", value: destinationMac, layer: "ethernet" }],
        detailFields: [{ label: "Ingress interface", value: ingressInterface, layer: "context" }, { label: "MAC table before", value: tableBefore, layer: "context" }],
      },
      {
        id: "learn-source", title: "1. Learn the source",
        explanation: id === "moved" ? "Source learning refreshes Host B from Gi0/2 to Gi0/3. The newest valid source frame updates its location." : "The switch learns or refreshes the source MAC on the ingress interface. It never learns a location from the destination field.",
        durationMs: 2500, activeDeviceIds: ["switch"], activeLinkIds: [],
        summaryFields: [{ label: "Learned source", value: `${frameSourceMac} → ${ingressInterface}`, layer: "context", changed: true }, { label: "MAC table now", value: tableAfter, layer: "context", changed: true }],
        detailFields: [{ label: "Evidence", value: `The frame physically arrived on ${ingressInterface}`, layer: "context" }],
      },
      {
        id: "lookup-destination", title: "2. Look up the destination",
        explanation: id === "unknown" ? "The destination entry is absent, but the destination MAC is still unicast." : broadcast ? "The all-ones destination identifies an Ethernet broadcast; a unicast table lookup cannot narrow it to one port." : "The switch searches the current table for the destination MAC after updating the source entry.",
        durationMs: 2600, activeDeviceIds: ["switch"], activeLinkIds: [],
        summaryFields: [{ label: "Destination lookup", value: destinationMac, layer: "ethernet" }, { label: "Lookup result", value: id === "known" ? "Gi0/2" : id === "unknown" ? "No entry" : id === "broadcast" ? "Broadcast address" : "Updated to Gi0/3", layer: "context" }],
        detailFields: [{ label: "Decision order", value: "Learn source first; look up destination second", layer: "context" }],
      },
      {
        id: "select-egress", title: "3. Select eligible egress interfaces",
        explanation: decision,
        durationMs: 2700, activeDeviceIds: ["switch"], activeLinkIds: [...activeEgressLinks],
        summaryFields: [{ label: "Switch action", value: decision, layer: "context" }, { label: "Ingress excluded", value: ingressInterface, layer: "context" }],
        detailFields: [{ label: "Eligible egress", value: activeEgressLinks.length ? activeEgressLinks.map((link) => link === "switch-b" ? (moved ? "Gi0/1" : "Gi0/2") : "Gi0/3").join(", ") : "None", layer: "context" }],
      },
      {
        id: "transmit-frame", title: "4. Transmit without changing the frame addresses",
        explanation: "The switch sends the original Ethernet frame on the selected interface or interfaces. Receiving a flooded copy does not mean every host accepts it: receipt is not acceptance.",
        durationMs: 2600, activeDeviceIds: ["switch", ...(activeEgressLinks.includes("switch-b") ? ["host-b"] : []), ...(activeEgressLinks.includes("switch-c") ? ["host-c"] : [])], activeLinkIds: [...activeEgressLinks],
        ...(activeEgressLinks[0] ? { packet: { kind: "frame" as const, label: `${title} Ethernet frame`, from: "switch", to: activeEgressLinks[0] === "switch-b" ? "host-b" : "host-c", broadcast, fanOut: activeEgressLinks.length > 1 } } : {}),
        summaryFields: [{ label: "Source MAC", value: frameSourceMac, layer: "ethernet" }, { label: "Destination MAC", value: destinationMac, layer: "ethernet" }],
        detailFields: [{ label: "Layer 2 boundary", value: "No router is involved in this LAN decision", layer: "context" }],
      },
    ],
  });
}

const scenarios: Record<LearningCase, PacketFlowScenario> = {
  known: scenario("known", "Known destination", hostBMac, "The destination entry identifies Gi0/2, so one copy leaves that interface.", "Known unicast: forward only through Gi0/2.", ["switch-b"], `${hostBMac} → Gi0/2`, `${hostBMac} → Gi0/2; ${sourceMac} → Gi0/1`),
  unknown: scenario("unknown", "Unknown destination", "02:00:00:00:00:99", "The destination entry is absent, so this unicast frame is temporarily flooded.", "Unknown unicast: flood every eligible interface except ingress.", ["switch-b", "switch-c"], "No matching destination", `${sourceMac} → Gi0/1`),
  broadcast: scenario("broadcast", "Broadcast", "FF:FF:FF:FF:FF:FF", "A broadcast is intended for the local Layer 2 domain and is flooded through eligible interfaces.", "Broadcast flood: use every eligible interface except ingress.", ["switch-b", "switch-c"], `${hostBMac} → Gi0/2`, `${hostBMac} → Gi0/2; ${sourceMac} → Gi0/1`, true),
  moved: scenario("moved", "Host moved", sourceMac, "A new source frame refreshes Host B from Gi0/2 to Gi0/3; the newest observation wins.", "Known unicast: forward to Host A on Gi0/1 while retaining Host B's refreshed Gi0/3 source location.", ["switch-b"], `${hostBMac} → Gi0/2; ${sourceMac} → Gi0/1`, `${hostBMac} → Gi0/3; ${sourceMac} → Gi0/1`),
};

export function SwitchLearningPlayer({ progressItemId }: { progressItemId?: string }) {
  const [learningCase, setLearningCase] = useState<LearningCase>("known");
  return (
    <section className="switch-learning-player" aria-labelledby="switch-learning-title">
      <h3 id="switch-learning-title">Watch the switch make one decision</h3>
      <p>Change the evidence, then replay the same receive → learn → look up → forward sequence.</p>
      <fieldset className="switch-learning-player__choices">
        <legend>Choose the forwarding evidence</legend>
        {(Object.keys(scenarios) as LearningCase[]).map((id) => (
          <label key={id}><input checked={learningCase === id} name="switch-learning-case" onChange={() => setLearningCase(id)} type="radio" />{scenarios[id].title}</label>
        ))}
      </fieldset>
      <PacketFlowPlayer autoplay inspectionDepthControl key={learningCase} progressItemId={progressItemId} scenario={scenarios[learningCase]} suppressHeading />
    </section>
  );
}
