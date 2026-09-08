import { parseRouteDecisionCatalog } from "./route-decision.schema";

const networkInterface = { id: "eth0", label: "Ethernet 0", ip: "192.0.2.10", prefixLength: 24, mac: "02:00:00:00:02:10" };
const connectedRoute = { id: "local-192-0-2", destination: "192.0.2.0", prefixLength: 24, interfaceId: "eth0", kind: "connected" as const };
const defaultRoute = { id: "default-via-router", destination: "0.0.0.0", prefixLength: 0, nextHop: "192.0.2.1", interfaceId: "eth0", kind: "default" as const };

const feedback = {
  scope: "Apply the host's configured prefix to decide whether the destination is on-link.",
  interface: "Use the interface named by the selected route.",
  nextHop: "ARP resolves only the next IPv4 hop on the local link.",
  boundary: "A router forwards eligible unicast packets but stops an ordinary Layer 2 broadcast.",
};

export const publicRouteDecisionScenarios = parseRouteDecisionCatalog([
  {
    id: "same-subnet-destination", difficulty: "foundational", title: "A neighbour on the local subnet",
    sourceIp: "192.0.2.10", sourcePrefixLength: 24, destinationIp: "192.0.2.44",
    interfaces: [networkInterface], routes: [connectedRoute, defaultRoute], destinationMac: "02:00:00:00:02:44", destinationKind: "unicast",
    expected: { scope: "on-link", routeId: "local-192-0-2", interfaceId: "eth0", nextHopIp: "192.0.2.44", firstHopRecipient: "destination", boundaryAction: "direct-delivery" },
    plainExplanation: "The destination is on the same local network, so the host sends directly to it.",
    technicalExplanation: "The connected /24 route matches, so ARP resolves the destination address itself and the first frame targets the destination MAC.", wrongAnswerExplanations: feedback,
  },
  {
    id: "remote-through-default-gateway", difficulty: "foundational", title: "A server beyond the local network",
    sourceIp: "192.0.2.10", sourcePrefixLength: 24, destinationIp: "198.51.100.20",
    interfaces: [networkInterface], routes: [connectedRoute, defaultRoute], nextHopMac: "02:00:00:00:02:01", destinationKind: "unicast",
    expected: { scope: "remote-via-gateway", routeId: "default-via-router", interfaceId: "eth0", nextHopIp: "192.0.2.1", firstHopRecipient: "gateway", boundaryAction: "route-unicast" },
    plainExplanation: "The destination is remote, so the first local delivery goes to the default gateway.",
    technicalExplanation: "The default route matches. Without NAT, the packet keeps destination IP 198.51.100.20 while the first Ethernet frame uses the gateway's MAC.", wrongAnswerExplanations: feedback,
  },
  {
    id: "remote-without-route", difficulty: "foundational", title: "A remote network with no usable route",
    sourceIp: "192.0.2.10", sourcePrefixLength: 24, destinationIp: "203.0.113.30",
    interfaces: [networkInterface], routes: [connectedRoute], destinationKind: "unicast",
    expected: { scope: "no-route", firstHopRecipient: "none", boundaryAction: "host-routing-failure" },
    plainExplanation: "The host has no matching route and no default route, so it cannot choose a first hop.",
    technicalExplanation: "Route lookup returns no match; ARP is not a substitute for a route to a remote network.", wrongAnswerExplanations: feedback,
  },
  {
    id: "gateway-own-address", difficulty: "foundational", title: "Contact the gateway itself",
    sourceIp: "192.0.2.10", sourcePrefixLength: 24, destinationIp: "192.0.2.1",
    interfaces: [networkInterface], routes: [connectedRoute, defaultRoute], destinationMac: "02:00:00:00:02:01", destinationKind: "unicast",
    expected: { scope: "on-link", routeId: "local-192-0-2", interfaceId: "eth0", nextHopIp: "192.0.2.1", firstHopRecipient: "destination", boundaryAction: "direct-delivery" },
    plainExplanation: "The gateway's own interface is a local destination, so reaching it is direct delivery.",
    technicalExplanation: "The connected route is more specific than the default route; the host ARPs for 192.0.2.1 and the router receives the packet locally.", wrongAnswerExplanations: feedback,
  },
  {
    id: "local-broadcast-boundary", difficulty: "foundational", title: "A local broadcast reaches the router boundary",
    sourceIp: "192.0.2.10", sourcePrefixLength: 24, destinationIp: "192.0.2.255",
    interfaces: [networkInterface], routes: [connectedRoute, defaultRoute], destinationMac: "FF:FF:FF:FF:FF:FF", destinationKind: "local-broadcast",
    expected: { scope: "local-broadcast", interfaceId: "eth0", firstHopRecipient: "local-broadcast", boundaryAction: "stop-broadcast" },
    plainExplanation: "Devices on the local broadcast domain can receive the frame, but the router does not carry that ordinary broadcast onward.",
    technicalExplanation: "The Ethernet broadcast remains within its Layer 2 broadcast domain; normal router forwarding does not bridge it into another subnet.", wrongAnswerExplanations: feedback,
  },
]);
