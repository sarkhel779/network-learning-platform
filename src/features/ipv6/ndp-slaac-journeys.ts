import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";
import { deriveSolicitedNodeMulticast } from "./ipv6";

const devices = [
  { id: "host", label: "Host", role: "IPv6 client", x: 70, y: 120 },
  { id: "switch", label: "Switch", role: "Layer 2 forwarding", x: 330, y: 120 },
  { id: "router", label: "Router", role: "IPv6 default router", x: 620, y: 55 },
  { id: "peer", label: "Peer", role: "local IPv6 neighbour", x: 620, y: 185 },
] as const;
const links = [
  { id: "host-switch", from: "host", to: "switch", fromInterface: "Host eth0", toInterface: "Switch Gi0/1" },
  { id: "switch-router", from: "switch", to: "router", fromInterface: "Switch Gi0/2", toInterface: "Router Gi0/0" },
  { id: "switch-peer", from: "switch", to: "peer", fromInterface: "Switch Gi0/3", toInterface: "Peer eth0" },
] as const;
const solicited = deriveSolicitedNodeMulticast("fe80::20c:29ff:fe9c:409");

function fields(protocol: string, source: string, destination: string) {
  return {
    summaryFields: [{ label: "ICMPv6", value: protocol, layer: "application" as const }, { label: "IPv6 source", value: source, layer: "ip" as const }, { label: "IPv6 destination", value: destination, layer: "ip" as const }],
    detailFields: [{ label: "Ethernet handling", value: "Multicast is forwarded on eligible VLAN links; only group members accept it.", layer: "ethernet" as const }],
  };
}

const complete = parsePacketFlowScenario({ id: "ipv6-complete-slaac", title: "Complete SLAAC journey", description: "Build an address, prove uniqueness, discover a router, resolve a neighbour, and deliver the packet.", defaultSpeed: 1, devices, links, steps: [
  { id: "link-local", title: "1. Form a link-local address", explanation: "The host forms a tentative fe80::/10 address before it has a globally scoped address.", durationMs: 2200, activeDeviceIds: ["host"], activeLinkIds: [], ...fields("Local address formation", "::", "fe80::20c:29ff:fe9c:409") },
  { id: "dad", title: "2. Duplicate Address Detection", explanation: "The host tests its tentative link-local address using an NS from the unspecified source.", durationMs: 2600, activeDeviceIds: ["host", "switch", "router", "peer"], activeLinkIds: ["host-switch", "switch-router", "switch-peer"], packet: { kind: "packet", label: "DAD Neighbor Solicitation", from: "host", to: "switch", fanOut: true }, ...fields("Neighbor Solicitation (135)", "::", solicited) },
  { id: "rs", title: "3. Router Solicitation", explanation: "The host asks IPv6 routers to advertise configuration information.", durationMs: 2400, activeDeviceIds: ["host", "switch", "router"], activeLinkIds: ["host-switch"], packet: { kind: "packet", label: "Router Solicitation", from: "host", to: "switch" }, ...fields("Router Solicitation (133)", "fe80::20c:29ff:fe9c:409", "ff02::2") },
  { id: "ra", title: "4. Router Advertisement", explanation: "The router advertises 2001:db8:10::/64, its lifetime, and itself as a possible default router.", durationMs: 2700, activeDeviceIds: ["router", "switch", "host"], activeLinkIds: ["switch-router"], packet: { kind: "packet", label: "Router Advertisement", from: "router", to: "switch" }, ...fields("Router Advertisement (134)", "fe80::1", "ff02::1") },
  { id: "global-dad", title: "5. Form the global address and repeat DAD", explanation: "SLAAC combines the advertised prefix with an interface identifier, then tests the tentative result.", durationMs: 2700, activeDeviceIds: ["host", "switch", "peer"], activeLinkIds: ["host-switch", "switch-peer"], packet: { kind: "packet", label: "DAD Neighbor Solicitation", from: "host", to: "switch", fanOut: true }, ...fields("Neighbor Solicitation (135)", "::", "ff02::1:ff9c:409") },
  { id: "ns", title: "6. Neighbor Solicitation", explanation: "The host resolves the local peer's link-layer address through solicited-node multicast.", durationMs: 2500, activeDeviceIds: ["host", "switch", "peer"], activeLinkIds: ["host-switch"], packet: { kind: "packet", label: "Neighbor Solicitation", from: "host", to: "switch" }, ...fields("Neighbor Solicitation (135)", "2001:db8:10::409", "ff02::1:ff00:20") },
  { id: "na", title: "7. Neighbor Advertisement", explanation: "The peer returns its link-layer address to the host.", durationMs: 2500, activeDeviceIds: ["peer", "switch", "host"], activeLinkIds: ["switch-peer"], packet: { kind: "packet", label: "Neighbor Advertisement", from: "peer", to: "switch" }, ...fields("Neighbor Advertisement (136)", "2001:db8:10::20", "2001:db8:10::409") },
  { id: "delivery", title: "8. Deliver locally or through the router", explanation: "The prefix decides whether Ethernet targets the peer or the discovered default router; the IPv6 destination stays unchanged.", durationMs: 2600, activeDeviceIds: ["host", "switch", "router"], activeLinkIds: ["host-switch"], packet: { kind: "packet", label: "IPv6 data", from: "host", to: "switch" }, ...fields("IPv6 data", "2001:db8:10::409", "2001:db8:20::50") },
] });

function compact(id: string, title: string, description: string, first: string, second: string): PacketFlowScenario {
  return parsePacketFlowScenario({ id, title, description, defaultSpeed: 1, devices, links, steps: [
    { id: "observe", title: `1. ${title}`, explanation: first, durationMs: 2400, activeDeviceIds: ["host"], activeLinkIds: [], ...fields(title, "::", solicited) },
    { id: "result", title: "2. Read the result", explanation: second, durationMs: 2500, activeDeviceIds: ["host", "switch", "peer"], activeLinkIds: ["host-switch"], packet: { kind: "packet", label: title, from: "host", to: "switch" }, ...fields(title, "fe80::409", "ff02::1") },
  ] });
}

export const ndpSlaacJourneys = [
  complete,
  compact("ipv6-dad-conflict", "DAD conflict", "A duplicate tentative address blocks assignment.", "A DAD NS receives evidence that another interface already uses the tentative address.", "The tentative address cannot be assigned; the host reports a duplicate instead of silently using it."),
  compact("ipv6-router-discovery", "Router discovery", "RS and RA establish the default-router candidate.", "The host sends an RS to ff02::2.", "The RA supplies a prefix and router lifetime; it is not an ARP reply."),
  compact("ipv6-neighbour-resolution", "Neighbour resolution", "NS and NA resolve the local next hop.", "The host derives the peer's solicited-node multicast group.", "The NA supplies link-layer evidence for the neighbour cache."),
  compact("ipv6-delivery-decision", "Local or default router", "Prefix comparison selects the Ethernet next hop.", "An on-link target is resolved directly; an off-link target uses the router.", "The IPv6 destination remains the final target even when Ethernet addresses the router."),
] as const;
