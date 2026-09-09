"use client";

import { useState } from "react";

import { PacketFlowPlayer } from "@/features/packet-flow/packet-flow-player";
import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

type ArpCase = "local" | "remote" | "cached" | "unanswered" | "proxy" | "gratuitous";

const hostAMac = "02:00:00:00:00:0A";
const hostBMac = "02:00:00:00:00:0B";
const gatewayMac = "02:00:00:00:00:01";
const broadcastMac = "FF:FF:FF:FF:FF:FF";

const devices = [
  { id: "source", label: "Host A", role: "192.0.2.10/24", x: 70, y: 120 },
  { id: "switch", label: "Switch", role: "local Layer 2 forwarding", x: 330, y: 120 },
  { id: "target", label: "Host B", role: "192.0.2.20/24", x: 620, y: 55 },
  { id: "gateway", label: "Gateway", role: "192.0.2.1/24", x: 620, y: 185 },
] as const;

const links = [
  { id: "source-switch", from: "source", to: "switch", fromInterface: "Host A eth0", toInterface: "Switch Gi0/1" },
  { id: "switch-target", from: "switch", to: "target", fromInterface: "Switch Gi0/2", toInterface: "Host B eth0" },
  { id: "switch-gateway", from: "switch", to: "gateway", fromInterface: "Switch Gi0/3", toInterface: "Gateway Gi0/0" },
] as const;

const localScenario = parsePacketFlowScenario({
  id: "arp-local-delivery",
  title: "ARP for a local IPv4 destination",
  description: "Host A resolves Host B's IPv4 address before it can build the Ethernet frame that carries the original packet.",
  defaultSpeed: 1,
  devices,
  links,
  steps: [
    {
      id: "choose-next-hop",
      title: "1. Choose the local next hop",
      explanation: "Host A applies /24 to 192.0.2.20 and identifies an on-link destination. The next hop is Host B itself, not the gateway.",
      durationMs: 2600,
      activeDeviceIds: ["source"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Source", value: "192.0.2.10/24", layer: "ip" },
        { label: "Destination", value: "192.0.2.20", layer: "ip" },
        { label: "Next-hop IP", value: "192.0.2.20", layer: "context", changed: true },
      ],
      detailFields: [{ label: "Decision", value: "On-link: resolve the destination host", layer: "context" }],
    },
    {
      id: "check-cache",
      title: "2. Check the neighbour cache",
      explanation: "No usable entry exists for 192.0.2.20, so Host A must ask the local broadcast domain for the matching MAC address.",
      durationMs: 2400,
      activeDeviceIds: ["source"],
      activeLinkIds: [],
      summaryFields: [{ label: "Neighbour entry", value: "192.0.2.20 → incomplete", layer: "context", changed: true }],
      detailFields: [{ label: "Important", value: "ARP resolves only the local next hop", layer: "context" }],
    },
    {
      id: "send-request",
      title: "3. Send the ARP request",
      explanation: "Host A encapsulates the ARP request in an Ethernet broadcast so the switch and every eligible local receiver can deliver a copy.",
      durationMs: 2700,
      activeDeviceIds: ["source", "switch"],
      activeLinkIds: ["source-switch"],
      packet: { kind: "frame", label: "ARP request", from: "source", to: "switch", broadcast: true },
      summaryFields: [
        { label: "Ethernet source", value: hostAMac, layer: "ethernet" },
        { label: "Ethernet destination", value: broadcastMac, layer: "ethernet" },
        { label: "ARP question", value: "Who has 192.0.2.20? Tell 192.0.2.10", layer: "application" },
      ],
      detailFields: [
        { label: "Sender protocol address", value: "192.0.2.10", layer: "application" },
        { label: "Target hardware address", value: "00:00:00:00:00:00 (unknown)", layer: "application" },
      ],
    },
    {
      id: "flood-request",
      title: "4. Switch floods the request",
      explanation: "The switch floods separate copies through Gi0/2 and Gi0/3, excluding ingress Gi0/1. Both devices inspect the broadcast, but only the owner of 192.0.2.20 answers.",
      durationMs: 2900,
      activeDeviceIds: ["switch", "target", "gateway"],
      activeLinkIds: ["switch-target", "switch-gateway"],
      packet: { kind: "frame", label: "ARP request", from: "switch", to: "target", broadcast: true, fanOut: true },
      summaryFields: [
        { label: "Eligible egress", value: "Gi0/2, Gi0/3", layer: "context" },
        { label: "Ingress excluded", value: "Gi0/1", layer: "context" },
      ],
      detailFields: [{ label: "Receiver decision", value: "Host B owns 192.0.2.20; the gateway does not", layer: "context" }],
    },
    {
      id: "owner-replies",
      title: "5. Owner replies by unicast",
      explanation: "Host B sends its mapping directly back toward Host A. The ARP reply is normally unicast because Host B learned Host A's addresses from the request.",
      durationMs: 2700,
      activeDeviceIds: ["target", "switch"],
      activeLinkIds: ["switch-target"],
      packet: { kind: "frame", label: "ARP reply", from: "target", to: "switch" },
      summaryFields: [
        { label: "Answer", value: `192.0.2.20 is at ${hostBMac}`, layer: "application", changed: true },
        { label: "Ethernet destination", value: hostAMac, layer: "ethernet" },
      ],
      detailFields: [{ label: "Reply type", value: "Unicast ARP reply", layer: "context" }],
    },
    {
      id: "reply-reaches-source",
      title: "6. Reply reaches Host A",
      explanation: "The switch forwards the reply through Gi0/1. Host A now has evidence tying the local next-hop IPv4 address to Host B's MAC address.",
      durationMs: 2500,
      activeDeviceIds: ["switch", "source"],
      activeLinkIds: ["source-switch"],
      packet: { kind: "frame", label: "ARP reply", from: "switch", to: "source" },
      summaryFields: [{ label: "Learned mapping", value: `192.0.2.20 → ${hostBMac}`, layer: "context", changed: true }],
      detailFields: [{ label: "Scope", value: "Host A's neighbour cache", layer: "context" }],
    },
    {
      id: "cache-mapping",
      title: "7. Cache the mapping",
      explanation: "Host A records a reachable neighbour entry for later packets. The entry is temporary evidence, not a permanent identity certificate.",
      durationMs: 2300,
      activeDeviceIds: ["source"],
      activeLinkIds: [],
      summaryFields: [{ label: "Neighbour cache", value: `192.0.2.20 → ${hostBMac} (reachable)`, layer: "context", changed: true }],
      detailFields: [{ label: "Lifecycle", value: "Validated, used, aged, then refreshed or resolved again", layer: "context" }],
    },
    {
      id: "send-data",
      title: "8. Send the original data frame",
      explanation: "Only now can Host A place the original IPv4 packet inside an Ethernet frame addressed to Host B's MAC and transmit it toward the switch.",
      durationMs: 2700,
      activeDeviceIds: ["source", "switch"],
      activeLinkIds: ["source-switch"],
      packet: { kind: "frame", label: "IPv4 data frame", from: "source", to: "switch" },
      summaryFields: [
        { label: "IP destination", value: "192.0.2.20", layer: "ip" },
        { label: "Ethernet destination", value: hostBMac, layer: "ethernet" },
      ],
      detailFields: [{ label: "Key distinction", value: "The IP target and Ethernet next hop happen to be the same host for local delivery", layer: "context" }],
    },
    {
      id: "deliver-data",
      title: "9. Switch delivers the data frame",
      explanation: "The switch uses Host B's learned MAC location and forwards the original data frame through Gi0/2. Host B now receives the IPv4 packet.",
      durationMs: 2700,
      activeDeviceIds: ["switch", "target"],
      activeLinkIds: ["switch-target"],
      packet: { kind: "frame", label: "IPv4 data frame", from: "switch", to: "target" },
      summaryFields: [
        { label: "Switch egress", value: "Gi0/2", layer: "context", changed: true },
        { label: "Ethernet destination", value: hostBMac, layer: "ethernet" },
      ],
      detailFields: [{ label: "Delivery result", value: "Host B receives the original IPv4 packet", layer: "context" }],
    },
  ],
});

function compactScenario(
  id: Exclude<ArpCase, "local">,
  title: string,
  description: string,
  firstTitle: string,
  firstExplanation: string,
  steps: PacketFlowScenario["steps"],
): PacketFlowScenario {
  return parsePacketFlowScenario({ id: `arp-${id}`, title, description, defaultSpeed: 1, devices, links, steps: [
    {
      id: "explain-case", title: firstTitle, explanation: firstExplanation, durationMs: 2800,
      activeDeviceIds: ["source"], activeLinkIds: [],
      summaryFields: [{ label: "Case", value: title, layer: "context" }],
      detailFields: [{ label: "Rule", value: description, layer: "context" }],
    },
    ...steps,
  ] });
}

const scenarios: Record<ArpCase, PacketFlowScenario> = {
  local: localScenario,
  remote: compactScenario(
    "remote", "Remote via gateway", "For a remote IP destination, Ethernet delivery still targets a local next hop: the default gateway.",
    "1. Choose the gateway as next hop", "Host A keeps the remote IP destination in the packet but must resolve 192.0.2.1, not the remote server, for the first Ethernet frame.",
    [
      {
        id: "request-gateway", title: "2. Resolve the gateway", explanation: "Host A broadcasts: Who has 192.0.2.1? The request never asks for the remote server's MAC address.", durationMs: 2800,
        activeDeviceIds: ["source", "switch"], activeLinkIds: ["source-switch"], packet: { kind: "frame", label: "ARP request", from: "source", to: "switch", broadcast: true },
        summaryFields: [{ label: "Target IP", value: "192.0.2.1", layer: "application" }, { label: "Ethernet destination", value: broadcastMac, layer: "ethernet" }], detailFields: [{ label: "Final IP destination", value: "198.51.100.50 (unchanged)", layer: "ip" }],
      },
      {
        id: "flood-gateway-request", title: "3. Switch floods the request", explanation: "The switch copies the broadcast to Gi0/2 and Gi0/3, excluding the ingress port. Host B ignores the question; the gateway recognizes 192.0.2.1 as its own address.", durationMs: 2800,
        activeDeviceIds: ["switch", "target", "gateway"], activeLinkIds: ["switch-target", "switch-gateway"], packet: { kind: "frame", label: "ARP request", from: "switch", to: "gateway", broadcast: true, fanOut: true },
        summaryFields: [{ label: "Eligible egress", value: "Gi0/2, Gi0/3", layer: "context" }, { label: "Owner", value: "Gateway 192.0.2.1", layer: "context", changed: true }], detailFields: [{ label: "Ingress excluded", value: "Gi0/1", layer: "context" }],
      },
      {
        id: "gateway-reply", title: "4. Gateway supplies its MAC", explanation: "The gateway owns 192.0.2.1 and returns its interface MAC. That MAC is valid only for this first local link.", durationMs: 2700,
        activeDeviceIds: ["gateway", "switch"], activeLinkIds: ["switch-gateway"], packet: { kind: "frame", label: "ARP reply", from: "gateway", to: "switch" },
        summaryFields: [{ label: "Gateway mapping", value: `192.0.2.1 → ${gatewayMac}`, layer: "context", changed: true }], detailFields: [{ label: "Routing boundary", value: "The router builds a different Layer 2 frame on its next link", layer: "context" }],
      },
      {
        id: "gateway-reply-source", title: "5. Host A learns the gateway mapping", explanation: "The switch forwards the unicast reply through Gi0/1. Host A can now address the first Ethernet frame to the gateway while preserving the remote IP destination.", durationMs: 2700,
        activeDeviceIds: ["switch", "source"], activeLinkIds: ["source-switch"], packet: { kind: "frame", label: "ARP reply", from: "switch", to: "source" },
        summaryFields: [{ label: "Cached next hop", value: `192.0.2.1 → ${gatewayMac}`, layer: "context", changed: true }], detailFields: [{ label: "Final IP destination", value: "198.51.100.50 (unchanged)", layer: "ip" }],
      },
    ],
  ),
  cached: compactScenario(
    "cached", "Warm cache", "A usable neighbour entry lets data transmission begin without another ARP broadcast.",
    "1. Reuse validated evidence", `A cached mapping avoids a new ARP exchange: 192.0.2.20 already maps to ${hostBMac}.`,
    [
      { id: "cached-data", title: "2. Send immediately", explanation: "Host A builds the data frame with the cached destination MAC while normal cache ageing continues.", durationMs: 2700, activeDeviceIds: ["source", "switch"], activeLinkIds: ["source-switch"], packet: { kind: "frame", label: "IPv4 data frame", from: "source", to: "switch" }, summaryFields: [{ label: "Cache hit", value: `192.0.2.20 → ${hostBMac}`, layer: "context" }], detailFields: [{ label: "ARP traffic", value: "None required for this transmission", layer: "context" }] },
      { id: "cached-delivery", title: "3. Switch delivers the cached data frame", explanation: "The switch forwards the frame through Gi0/2 to Host B. Reusing the neighbour entry removed only the ARP exchange, not normal Ethernet forwarding.", durationMs: 2700, activeDeviceIds: ["switch", "target"], activeLinkIds: ["switch-target"], packet: { kind: "frame", label: "IPv4 data frame", from: "switch", to: "target" }, summaryFields: [{ label: "Delivery", value: "Host B via Gi0/2", layer: "context", changed: true }], detailFields: [{ label: "Destination MAC", value: hostBMac, layer: "ethernet" }] },
    ],
  ),
  unanswered: compactScenario(
    "unanswered", "No reply", "An unanswered request provides no destination MAC, so the original data frame cannot be sent on that Ethernet link.",
    "1. Resolution cannot complete", "Host A broadcasts requests, receives no valid reply, and the neighbour entry remains incomplete until retry and timeout policy ends the attempt.",
    [
      { id: "failed-request", title: "2. Host A sends the request", explanation: "Host A sends the broadcast request to the switch, but no reply has been learned yet.", durationMs: 2800, activeDeviceIds: ["source", "switch"], activeLinkIds: ["source-switch"], packet: { kind: "frame", label: "ARP request", from: "source", to: "switch", broadcast: true }, summaryFields: [{ label: "Target", value: "Unanswered local IPv4 address", layer: "application" }], detailFields: [{ label: "Neighbour state", value: "Incomplete", layer: "context" }] },
      { id: "failed-flood", title: "3. Switch floods the unanswered request", explanation: "The switch floods copies through Gi0/2 and Gi0/3, excluding ingress Gi0/1. Flooding succeeds, but neither receiver owns the requested address, so no reply returns.", durationMs: 2800, activeDeviceIds: ["switch", "target", "gateway"], activeLinkIds: ["switch-target", "switch-gateway"], packet: { kind: "frame", label: "ARP request", from: "switch", to: "target", broadcast: true, fanOut: true }, summaryFields: [{ label: "Result", value: "No ARP reply", layer: "context", changed: true }], detailFields: [{ label: "Do not assume", value: "A successful broadcast does not prove the target exists", layer: "context" }] },
    ],
  ),
  proxy: compactScenario(
    "proxy", "Proxy ARP", "A router may answer with its own MAC on behalf of another IPv4 destination.",
    "1. Router answers for another IP", `The gateway answers on behalf of 192.0.2.99 using ${gatewayMac}; this can provide reachability while concealing a host addressing or mask error.`,
    [{ id: "proxy-reply", title: "2. Cache the proxy mapping", explanation: "Host A associates the target IP with the router's local MAC, then sends the frame to the router for forwarding.", durationMs: 2700, activeDeviceIds: ["gateway", "switch"], activeLinkIds: ["switch-gateway"], packet: { kind: "frame", label: "ARP reply", from: "gateway", to: "switch" }, summaryFields: [{ label: "Proxy mapping", value: `192.0.2.99 → ${gatewayMac}`, layer: "context", changed: true }], detailFields: [{ label: "Troubleshooting risk", value: "Reachability can hide an incorrect prefix or gateway design", layer: "context" }] }],
  ),
  gratuitous: compactScenario(
    "gratuitous", "Gratuitous ARP", "A host announces or probes its own IPv4-to-MAC mapping without first receiving a normal request.",
    "1. Announce the sender's own mapping", `Host B announces its own mapping—192.0.2.20 is at ${hostBMac}—to detect conflicts or refresh neighbours after an ownership change.`,
    [{ id: "gratuitous-broadcast", title: "2. Local devices inspect the announcement", explanation: "The switch floods the broadcast within the Layer 2 domain. Receivers may update caches or report conflicting ownership according to their implementation and policy.", durationMs: 2900, activeDeviceIds: ["switch", "source", "gateway"], activeLinkIds: ["source-switch", "switch-gateway"], packet: { kind: "frame", label: "ARP announcement", from: "switch", to: "source", broadcast: true, fanOut: true }, summaryFields: [{ label: "Sender IP", value: "192.0.2.20", layer: "application" }, { label: "Target IP", value: "192.0.2.20", layer: "application" }], detailFields: [{ label: "Common uses", value: "Duplicate detection, cache update, gateway failover", layer: "context" }] }],
  ),
};

const choices: readonly { id: ArpCase; label: string }[] = [
  { id: "local", label: "Local destination" },
  { id: "remote", label: "Remote via gateway" },
  { id: "cached", label: "Warm cache" },
  { id: "unanswered", label: "No reply" },
  { id: "proxy", label: "Proxy ARP" },
  { id: "gratuitous", label: "Gratuitous ARP" },
];

export function ArpLocalDeliveryPlayer({ progressItemId }: { progressItemId?: string }) {
  const [arpCase, setArpCase] = useState<ArpCase>("local");
  return (
    <section className="arp-local-delivery-player" aria-labelledby="arp-local-delivery-title">
      <h3 id="arp-local-delivery-title">Watch ARP resolve the next hop</h3>
      <p>Change the situation, then follow the next-hop decision, ARP evidence, cache state and resulting Ethernet delivery.</p>
      <fieldset className="arp-local-delivery-player__choices">
        <legend>Choose an ARP situation</legend>
        {choices.map(({ id, label }) => (
          <label key={id}>
            <input checked={arpCase === id} name="arp-case" onChange={() => setArpCase(id)} type="radio" />
            {label}
          </label>
        ))}
      </fieldset>
      <PacketFlowPlayer autoplay inspectionDepthControl key={arpCase} progressItemId={progressItemId} scenario={scenarios[arpCase]} suppressHeading />
    </section>
  );
}
