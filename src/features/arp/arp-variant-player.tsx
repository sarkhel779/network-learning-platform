"use client";

import { useState } from "react";

import { PacketFlowPlayer } from "@/features/packet-flow/packet-flow-player";
import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

type ArpVariant = "standard" | "proxy" | "gratuitous" | "rarp" | "inverse";

const broadcastMac = "FF:FF:FF:FF:FF:FF";
const hostAMac = "02:00:00:00:00:0A";
const hostBMac = "02:00:00:00:00:0B";
const gatewayMac = "02:00:00:00:00:01";

const lanDevices = [
  { id: "host-a", label: "Host A", role: "192.0.2.10/24", x: 55, y: 120 },
  { id: "switch", label: "Switch", role: "local Layer 2 domain", x: 315, y: 120 },
  { id: "host-b", label: "Host B", role: "192.0.2.20/24", x: 625, y: 55 },
  { id: "gateway", label: "Gateway", role: "192.0.2.1/24", x: 625, y: 185 },
] as const;

const lanLinks = [
  { id: "switch-host-a", from: "host-a", to: "switch", fromInterface: "Host A eth0", toInterface: "Switch Gi0/1" },
  { id: "switch-host-b", from: "switch", to: "host-b", fromInterface: "Switch Gi0/2", toInterface: "Host B eth0" },
  { id: "switch-gateway", from: "switch", to: "gateway", fromInterface: "Switch Gi0/3", toInterface: "Gateway Gi0/0" },
] as const;

const standard = parsePacketFlowScenario({
  id: "variant-standard-arp",
  title: "Standard ARP resolution",
  description: "A host discovers the MAC address of an IPv4 neighbour on its local Layer 2 network.",
  defaultSpeed: 1,
  devices: lanDevices,
  links: lanLinks,
  steps: [
    {
      id: "cache", title: "1. Check the neighbour cache", durationMs: 2600,
      explanation: "Host A has no usable mapping for 192.0.2.20, so it must ask the local broadcast domain.",
      activeDeviceIds: ["host-a"], activeLinkIds: [],
      summaryFields: [{ label: "Lookup", value: "192.0.2.20 → incomplete", layer: "context", changed: true }],
      detailFields: [{ label: "Next action", value: "Send a local ARP request", layer: "context" }],
    },
    {
      id: "request", title: "2. Broadcast the ARP request", durationMs: 2800,
      explanation: "Host A asks who owns 192.0.2.20. The Ethernet destination is broadcast because the target MAC is still unknown.",
      activeDeviceIds: ["host-a", "switch"], activeLinkIds: ["switch-host-a"],
      packet: { kind: "frame", label: "ARP request", from: "host-a", to: "switch", broadcast: true },
      summaryFields: [{ label: "Ethernet destination", value: broadcastMac, layer: "ethernet" }, { label: "Question", value: "Who has 192.0.2.20?", layer: "application" }],
      detailFields: [{ label: "Ingress", value: "Switch Gi0/1", layer: "context" }],
    },
    {
      id: "flood", title: "3. Flood through eligible interfaces", durationMs: 2800,
      explanation: "The switch sends a separate copy through Gi0/2 and Gi0/3, never back through ingress Gi0/1. Only Host B owns the requested address.",
      activeDeviceIds: ["switch", "host-b", "gateway"], activeLinkIds: ["switch-host-b", "switch-gateway"],
      packet: { kind: "frame", label: "ARP request", from: "switch", to: "host-b", broadcast: true, fanOut: true },
      summaryFields: [{ label: "Egress", value: "Gi0/2 and Gi0/3", layer: "context" }, { label: "Ingress excluded", value: "Gi0/1", layer: "context" }],
      detailFields: [{ label: "Owner", value: "Host B", layer: "context", changed: true }],
    },
    {
      id: "reply", title: "4. Return the mapping by unicast", durationMs: 2800,
      explanation: "Host B replies with its MAC address. Host A can cache the mapping and build the original data frame.",
      activeDeviceIds: ["host-b", "switch"], activeLinkIds: ["switch-host-b"],
      packet: { kind: "frame", label: "ARP reply", from: "host-b", to: "switch" },
      summaryFields: [{ label: "Answer", value: `192.0.2.20 → ${hostBMac}`, layer: "application", changed: true }],
      detailFields: [{ label: "Reply destination", value: hostAMac, layer: "ethernet" }],
    },
  ],
});

const proxy = parsePacketFlowScenario({
  id: "variant-proxy-arp", title: "Proxy ARP", defaultSpeed: 1,
  description: "A router answers locally on behalf of an IPv4 address reached beyond it.", devices: lanDevices, links: lanLinks,
  steps: [
    {
      id: "wrong-local-assumption", title: "1. Host A treats the destination as local", durationMs: 2700,
      explanation: "Because of its addressing or mask, Host A attempts to resolve 192.0.2.99 directly. A configured router answers for 192.0.2.99 using its own local MAC instead of allowing resolution to fail.",
      activeDeviceIds: ["host-a"], activeLinkIds: [],
      summaryFields: [{ label: "ARP target", value: "192.0.2.99", layer: "application" }],
      detailFields: [{ label: "Risk", value: "Proxy ARP can conceal a faulty subnet design", layer: "context" }],
    },
    {
      id: "proxy-request", title: "2. Flood the local request", durationMs: 2800,
      explanation: "The request reaches every eligible local interface. The gateway is configured to proxy for the destination.",
      activeDeviceIds: ["switch", "host-b", "gateway"], activeLinkIds: ["switch-host-b", "switch-gateway"],
      packet: { kind: "frame", label: "ARP request", from: "switch", to: "gateway", broadcast: true, fanOut: true },
      summaryFields: [{ label: "Question", value: "Who has 192.0.2.99?", layer: "application" }],
      detailFields: [{ label: "Proxy", value: "Gateway Gi0/0", layer: "context" }],
    },
    {
      id: "proxy-reply", title: "3. Gateway supplies a proxy mapping", durationMs: 2800,
      explanation: "The router answers for 192.0.2.99 using its own local MAC. Host A therefore sends the frame to the router for onward forwarding.",
      activeDeviceIds: ["gateway", "switch"], activeLinkIds: ["switch-gateway"],
      packet: { kind: "frame", label: "Proxy ARP reply", from: "gateway", to: "switch" },
      summaryFields: [{ label: "Proxy mapping", value: `192.0.2.99 → ${gatewayMac}`, layer: "context", changed: true }],
      detailFields: [{ label: "Replying interface", value: "Gateway Gi0/0", layer: "context" }],
    },
  ],
});

const gratuitousLinks = [
  ...lanLinks,
] as const;

const gratuitous = parsePacketFlowScenario({
  id: "variant-gratuitous-arp", title: "Gratuitous ARP", defaultSpeed: 1,
  description: "A device announces or probes its own IPv4-to-MAC mapping without waiting for a normal ARP request.", devices: lanDevices, links: gratuitousLinks,
  steps: [
    {
      id: "announce", title: "1. Announce the owned address", durationMs: 2800,
      explanation: "A new active gateway announces the shared virtual IP after failover so local neighbours can refresh stale cache entries.",
      activeDeviceIds: ["gateway", "switch"], activeLinkIds: ["switch-gateway"],
      packet: { kind: "frame", label: "Gratuitous ARP", from: "gateway", to: "switch", broadcast: true },
      summaryFields: [{ label: "Announcement", value: `192.0.2.1 is at ${gatewayMac}`, layer: "application", changed: true }],
      detailFields: [{ label: "Ethernet destination", value: broadcastMac, layer: "ethernet" }],
    },
    {
      id: "garp-flood", title: "2. Flood the announcement locally", durationMs: 2900,
      explanation: "The switch floods copies to Host A and Host B, excluding the gateway's ingress interface. Each host may refresh its neighbour cache.",
      activeDeviceIds: ["switch", "host-a", "host-b"], activeLinkIds: ["switch-host-a", "switch-host-b"],
      packet: { kind: "frame", label: "Gratuitous ARP", from: "switch", to: "host-a", broadcast: true, fanOut: true },
      summaryFields: [{ label: "Recipients", value: "Host A and Host B", layer: "context" }, { label: "Ingress excluded", value: "Gi0/3", layer: "context" }],
      detailFields: [{ label: "Typical use", value: "Failover, duplicate detection or cache refresh", layer: "context" }],
    },
  ],
});

const rarp = parsePacketFlowScenario({
  id: "variant-rarp", title: "Reverse ARP (RARP)", defaultSpeed: 1,
  description: "A legacy diskless client asks a RARP server for an IPv4 address that corresponds to its known MAC address.",
  devices: [
    { id: "client", label: "Diskless client", role: "knows only its MAC", x: 75, y: 120 },
    { id: "lan", label: "Ethernet LAN", role: "broadcast domain", x: 340, y: 120 },
    { id: "server", label: "RARP server", role: "MAC-to-IPv4 table", x: 625, y: 120 },
  ],
  links: [
    { id: "client-lan", from: "client", to: "lan", fromInterface: "Diskless client eth0", toInterface: "LAN segment" },
    { id: "lan-server", from: "lan", to: "server", fromInterface: "LAN segment", toInterface: "RARP server eth0" },
  ],
  steps: [
    {
      id: "rarp-request", title: "1. Ask for the client's IPv4 address", durationMs: 2900,
      explanation: "The client knows its MAC but not its IPv4 address, so it broadcasts a RARP request on the local Ethernet network.",
      activeDeviceIds: ["client", "lan"], activeLinkIds: ["client-lan"],
      packet: { kind: "frame", label: "RARP request", from: "client", to: "lan", broadcast: true },
      summaryFields: [{ label: "Known", value: "Client MAC", layer: "ethernet" }, { label: "Unknown", value: "Client IPv4 address", layer: "ip", changed: true }],
      detailFields: [{ label: "Boundary", value: "Local broadcast domain", layer: "context" }],
    },
    {
      id: "rarp-reply", title: "2. Server returns the legacy mapping", durationMs: 2800,
      explanation: "The RARP server looks up the MAC-to-IPv4 entry and sends the assigned address back to the client. DHCP later replaced this limited approach.",
      activeDeviceIds: ["server", "lan"], activeLinkIds: ["lan-server"],
      packet: { kind: "frame", label: "RARP reply", from: "server", to: "lan" },
      summaryFields: [{ label: "Assigned IPv4", value: "192.0.2.50", layer: "ip", changed: true }],
      detailFields: [{ label: "Historical limitation", value: "RARP supplied an address, not full host configuration", layer: "context" }],
    },
  ],
});

const inverse = parsePacketFlowScenario({
  id: "variant-inverse-arp", title: "Inverse ARP (InARP)", defaultSpeed: 1,
  description: "A router uses a known Frame Relay virtual circuit to discover the remote router's protocol address.",
  devices: [
    { id: "router-a", label: "Router A", role: "local endpoint", x: 75, y: 120 },
    { id: "frame-relay", label: "Frame Relay cloud", role: "known virtual circuit", x: 340, y: 120 },
    { id: "router-b", label: "Router B", role: "remote endpoint", x: 625, y: 120 },
  ],
  links: [
    { id: "a-cloud", from: "router-a", to: "frame-relay", fromInterface: "DLCI 102", toInterface: "Provider edge" },
    { id: "cloud-b", from: "frame-relay", to: "router-b", fromInterface: "Provider edge", toInterface: "DLCI 201" },
  ],
  steps: [
    {
      id: "inarp-request", title: "1. Ask across the known virtual circuit", durationMs: 2900,
      explanation: "Router A already knows the Frame Relay virtual circuit identified by DLCI 102, but it needs the protocol address at the far end.",
      activeDeviceIds: ["router-a", "frame-relay"], activeLinkIds: ["a-cloud"],
      packet: { kind: "frame", label: "InARP request", from: "router-a", to: "frame-relay" },
      summaryFields: [{ label: "Known", value: "DLCI 102", layer: "context" }, { label: "Unknown", value: "Remote IPv4 address", layer: "ip", changed: true }],
      detailFields: [{ label: "Direction", value: "Layer 2 identifier → Layer 3 address", layer: "context" }],
    },
    {
      id: "inarp-reply", title: "2. Learn the far-end protocol address", durationMs: 2800,
      explanation: "Router B replies across the established circuit, allowing Router A to map the known DLCI to Router B's IPv4 address.",
      activeDeviceIds: ["frame-relay", "router-b"], activeLinkIds: ["cloud-b"],
      packet: { kind: "frame", label: "InARP reply", from: "router-b", to: "frame-relay" },
      summaryFields: [{ label: "Learned mapping", value: "DLCI 102 → 198.51.100.2", layer: "context", changed: true }],
      detailFields: [{ label: "Do not confuse", value: "InARP is not RARP and is not ordinary Ethernet ARP", layer: "context" }],
    },
  ],
});

const scenarios: Record<ArpVariant, PacketFlowScenario> = { standard, proxy, gratuitous, rarp, inverse };
const choices: readonly { id: ArpVariant; label: string }[] = [
  { id: "standard", label: "Standard ARP" },
  { id: "proxy", label: "Proxy ARP" },
  { id: "gratuitous", label: "Gratuitous ARP" },
  { id: "rarp", label: "RARP" },
  { id: "inverse", label: "Inverse ARP" },
];

export function ArpVariantPlayer({ progressItemId }: { progressItemId?: string }) {
  const [variant, setVariant] = useState<ArpVariant>("standard");

  return (
    <section className="arp-variant-player" aria-labelledby="arp-variant-player-title">
      <h3 id="arp-variant-player-title">Explore ARP variants packet by packet</h3>
      <p>Select a journey to see what is already known, what must be discovered and where the exchange is allowed to travel.</p>
      <fieldset className="arp-variant-player__choices">
        <legend>Choose an ARP-family journey</legend>
        {choices.map(({ id, label }) => (
          <label key={id}>
            <input checked={variant === id} name="arp-variant" onChange={() => setVariant(id)} type="radio" />
            {label}
          </label>
        ))}
      </fieldset>
      <PacketFlowPlayer autoplay inspectionDepthControl key={variant} progressItemId={progressItemId} scenario={scenarios[variant]} suppressHeading />
    </section>
  );
}
