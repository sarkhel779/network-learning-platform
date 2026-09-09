import type { AddressFamily } from "./routing.schema";

export type ForwardingTerminal = Readonly<{
  kind: "delivered" | "discarded" | "preview";
  reason: "delivered" | "no-route" | "ttl-expired" | "hop-limit-expired" | "unresolved-next-hop";
  deviceId: string;
  icmpNote?: string;
}>;

export type ForwardingStep = Readonly<{
  id: string;
  kind: "receive" | "lookup" | "forward" | "delivered" | "discarded" | "preview";
  title: string;
  explanation: string;
  selectedRouteId?: string;
  ingressDevice?: string;
  egressDevice?: string;
  activeDeviceIds: readonly string[];
  activeLinkIds: readonly string[];
  sourceIp: string;
  destinationIp: string;
  sourceMac: string;
  destinationMac: string;
  hopLimit: number;
}>;

export type ForwardingJourney = Readonly<{
  id: string;
  title: string;
  description: string;
  family: AddressFamily;
  source: string;
  destination: string;
  initialHopLimit: number;
  devices: readonly Readonly<{ id: string; label: string; role: string; x: number; y: number }>[];
  links: readonly Readonly<{ id: string; from: string; to: string; fromInterface: string; toInterface: string }>[];
  steps: readonly ForwardingStep[];
  terminal: ForwardingTerminal;
}>;

const devices = [
  { id: "host", label: "Source", role: "sending host", x: 55, y: 120 },
  { id: "r1", label: "Router 1", role: "first-hop router", x: 275, y: 120 },
  { id: "r2", label: "Router 2", role: "next router", x: 505, y: 120 },
  { id: "destination", label: "Destination", role: "receiving host", x: 725, y: 120 },
] as const;

const links = [
  { id: "host-r1", from: "host", to: "r1", fromInterface: "Host eth0", toInterface: "R1 Gi0/0" },
  { id: "r1-r2", from: "r1", to: "r2", fromInterface: "R1 Gi0/1", toInterface: "R2 Gi0/0" },
  { id: "r2-destination", from: "r2", to: "destination", fromInterface: "R2 Gi0/1", toInterface: "Destination eth0" },
] as const;

function successfulJourney(family: AddressFamily): ForwardingJourney {
  const ipv4 = family === "ipv4";
  const source = ipv4 ? "192.0.2.10" : "2001:db8:10::10";
  const destination = ipv4 ? "203.0.113.20" : "2001:db8:30::20";
  const label = ipv4 ? "IPv4" : "IPv6";
  const base = { sourceIp: source, destinationIp: destination };
  return {
    id: `${family}-success`, title: `${label} routed delivery`, description: `Follow a ${label} packet across two routers.`,
    family, source, destination, initialHopLimit: 64, devices, links,
    terminal: { kind: "delivered", reason: "delivered", deviceId: "destination" },
    steps: [
      { ...base, id: "receive-r1", kind: "receive", title: "1. Router 1 receives the frame", explanation: "Router 1 removes the incoming Layer 2 header; the IP destination still names the final host.", ingressDevice: "host", egressDevice: "r1", activeDeviceIds: ["host", "r1"], activeLinkIds: ["host-r1"], sourceMac: "00:11:22:33:44:10", destinationMac: "00:11:22:33:44:01", hopLimit: 64 },
      { ...base, id: "lookup-r1", kind: "lookup", title: "2. Router 1 selects a route", explanation: "The longest matching prefix selects the link toward Router 2.", selectedRouteId: "r1-specific", ingressDevice: "r1", egressDevice: "r2", activeDeviceIds: ["r1"], activeLinkIds: [], sourceMac: "00:11:22:33:44:10", destinationMac: "00:11:22:33:44:01", hopLimit: 64 },
      { ...base, id: "forward-r1", kind: "forward", title: "3. Router 1 forwards", explanation: `Router 1 decrements ${ipv4 ? "TTL" : "Hop Limit"} and creates a new Layer 2 header for the next link.`, selectedRouteId: "r1-specific", ingressDevice: "r1", egressDevice: "r2", activeDeviceIds: ["r1", "r2"], activeLinkIds: ["r1-r2"], sourceMac: "00:aa:00:00:01:02", destinationMac: "00:bb:00:00:02:01", hopLimit: 63 },
      { ...base, id: "lookup-r2", kind: "lookup", title: "4. Router 2 performs a fresh lookup", explanation: "Router 2 independently selects its directly connected destination network.", selectedRouteId: "r2-connected", ingressDevice: "r2", egressDevice: "destination", activeDeviceIds: ["r2"], activeLinkIds: [], sourceMac: "00:aa:00:00:01:02", destinationMac: "00:bb:00:00:02:01", hopLimit: 63 },
      { ...base, id: "forward-r2", kind: "forward", title: "5. Router 2 forwards", explanation: `Router 2 decrements ${ipv4 ? "TTL" : "Hop Limit"} once and rewrites Layer 2 for the final link.`, selectedRouteId: "r2-connected", ingressDevice: "r2", egressDevice: "destination", activeDeviceIds: ["r2", "destination"], activeLinkIds: ["r2-destination"], sourceMac: "00:cc:00:00:02:02", destinationMac: "00:dd:00:00:03:20", hopLimit: 62 },
      { ...base, id: "delivered", kind: "delivered", title: "6. Destination receives the packet", explanation: "The final host accepts the new frame and receives the original IP packet.", ingressDevice: "r2", egressDevice: "destination", activeDeviceIds: ["destination"], activeLinkIds: [], sourceMac: "00:cc:00:00:02:02", destinationMac: "00:dd:00:00:03:20", hopLimit: 62 },
    ],
  };
}

function exceptionalJourney(id: "no-route" | "hop-limit-expired" | "unresolved-next-hop"): ForwardingJourney {
  const reason = id === "no-route" ? "no-route" : id === "hop-limit-expired" ? "hop-limit-expired" : "unresolved-next-hop";
  const kind = id === "unresolved-next-hop" ? "preview" : "discarded";
  const title = id === "no-route" ? "No usable route" : id === "hop-limit-expired" ? "Hop Limit expires" : "Next hop unresolved";
  const explanation = id === "no-route" ? "Router 1 has no matching prefix or default route, so it discards the packet." : id === "hop-limit-expired" ? "The Hop Limit reaches zero at Router 1, so forwarding stops." : "The route is selected, but next-hop resolution is incomplete; recursive lookup is deferred to the later routing section.";
  const destination = "2001:db8:ffff::20";
  return { id, title, description: explanation, family: "ipv6", source: "2001:db8:10::10", destination, initialHopLimit: id === "hop-limit-expired" ? 1 : 64, devices, links, terminal: { kind, reason, deviceId: "r1", ...(kind === "discarded" ? { icmpNote: "An ICMP error may be generated when policy and reachability permit." } : {}) }, steps: [
    { id: "receive", kind: "receive", title: "1. Router 1 receives the packet", explanation: "Router 1 removes the incoming frame before making a forwarding decision.", ingressDevice: "host", egressDevice: "r1", activeDeviceIds: ["host", "r1"], activeLinkIds: ["host-r1"], sourceIp: "2001:db8:10::10", destinationIp: destination, sourceMac: "00:11:22:33:44:10", destinationMac: "00:11:22:33:44:01", hopLimit: id === "hop-limit-expired" ? 1 : 64 },
    { id: "terminal", kind, title: `2. ${title}`, explanation, selectedRouteId: id === "unresolved-next-hop" ? "r1-static" : undefined, ingressDevice: "r1", egressDevice: "r1", activeDeviceIds: ["r1"], activeLinkIds: [], sourceIp: "2001:db8:10::10", destinationIp: destination, sourceMac: "Not forwarded", destinationMac: "Not forwarded", hopLimit: id === "hop-limit-expired" ? 0 : 64 },
  ] };
}

export const forwardingJourneys: readonly ForwardingJourney[] = [
  successfulJourney("ipv4"), successfulJourney("ipv6"), exceptionalJourney("no-route"), exceptionalJourney("hop-limit-expired"), exceptionalJourney("unresolved-next-hop"),
];
