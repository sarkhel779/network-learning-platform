import "server-only";
import { parseDeliveryCatalog, type DeliveryKind, type RouterAction } from "./delivery-scope.schema";

const nodes = [
  { id: "client", label: "Client", kind: "host" as const, acceptsUnicast: false, multicastGroups: [] },
  { id: "server", label: "Local server", kind: "host" as const, acceptsUnicast: true, multicastGroups: ["239.1.1.1"] },
  { id: "observer", label: "Observer", kind: "host" as const, acceptsUnicast: false, multicastGroups: [] },
  { id: "subscriber", label: "Subscriber", kind: "host" as const, acceptsUnicast: false, multicastGroups: ["239.1.1.1"] },
  { id: "router", label: "Default gateway", kind: "router" as const, acceptsUnicast: true, multicastGroups: [] },
];
const ports = [
  { id: "p1", label: "P1 client", connectedNodeId: "client", eligible: true },
  { id: "p2", label: "P2 server", connectedNodeId: "server", eligible: true },
  { id: "p3", label: "P3 observer", connectedNodeId: "observer", eligible: true },
  { id: "p4", label: "P4 subscriber", connectedNodeId: "subscriber", eligible: true },
  { id: "p5", label: "P5 gateway", connectedNodeId: "router", eligible: true },
];

function authored(input: {
  id: string; title: string; kind: DeliveryKind; difficulty?: "foundational" | "intermediate";
  destinationLabel: string; destinationNodeId?: string; learned?: string; group?: string; groupKnown?: boolean;
  egress: string[]; receivers: string[]; accepters: string[]; routerAction: RouterAction; explanation: string;
}) {
  return {
    id: input.id, difficulty: input.difficulty ?? "foundational", title: input.title,
    deliveryKind: input.kind, destinationLabel: input.destinationLabel,
    destinationNodeId: input.destinationNodeId, multicastGroup: input.group,
    multicastGroupKnownToSwitch: input.groupKnown ?? false, ingressPortId: "p1", nodes, ports,
    learnedDestinationPortId: input.learned, routerAction: input.routerAction,
    expectedEgressPortIds: input.egress, expectedReceivingNodeIds: input.receivers,
    expectedAcceptingNodeIds: input.accepters, explanation: input.explanation,
    evidenceNotes: ["Inspect destination addressing.", "Compare switch egress, interface capture, and host processing."],
    wrongAnswerExplanations: {
      forwarded: "Recheck the switch table and eligible non-ingress ports.",
      received: "An interface receives only when its connected port forwards the frame.",
      accepted: "Receipt does not guarantee acceptance; check destination identity or group membership.",
      router: "Separate local receipt from routing into another broadcast domain.",
    },
  };
}

export const accountDeliveryScenarios = parseDeliveryCatalog([
  authored({ id: "known-unicast-to-local-server", title: "Known unicast to a local server", kind: "known-unicast", destinationLabel: "Local server", destinationNodeId: "server", learned: "p2", egress: ["p2"], receivers: ["server"], accepters: ["server"], routerAction: "not-in-path", explanation: "The learned server MAC selects P2 only." }),
  authored({ id: "unknown-unicast-temporary-flood", title: "Unknown unicast during learning", kind: "unknown-unicast", destinationLabel: "Local server", destinationNodeId: "server", egress: ["p2", "p3", "p4", "p5"], receivers: ["server", "observer", "subscriber", "router"], accepters: ["server"], routerAction: "receive-local-only", explanation: "The unknown unicast floods temporarily, yet only the server accepts its unicast destination." }),
  authored({ id: "arp-request-local-broadcast", title: "ARP request in one LAN", kind: "broadcast", destinationLabel: "Local ARP broadcast", egress: ["p2", "p3", "p4", "p5"], receivers: ["server", "observer", "subscriber", "router"], accepters: ["server", "observer", "subscriber", "router"], routerAction: "receive-local-only", explanation: "The ARP request reaches the local domain and stops at the router boundary." }),
  authored({ id: "dhcp-relay-boundary", title: "DHCP broadcast at a relay boundary", kind: "broadcast", destinationLabel: "Local DHCP discovery", egress: ["p2", "p3", "p4", "p5"], receivers: ["server", "observer", "subscriber", "router"], accepters: ["server", "observer", "subscriber", "router"], routerAction: "receive-local-only", explanation: "The local broadcast stops; a configured relay creates a separate forwarded request rather than extending the broadcast." }),
  authored({ id: "multicast-known-subscribers", title: "Multicast with known subscribers", kind: "multicast", destinationLabel: "239.1.1.1", group: "239.1.1.1", groupKnown: true, egress: ["p2", "p4"], receivers: ["server", "subscriber"], accepters: ["server", "subscriber"], routerAction: "not-in-path", explanation: "Known group state selects only subscriber ports." }),
  authored({ id: "multicast-without-group-state", title: "Multicast without group-aware switch state", kind: "multicast", difficulty: "intermediate", destinationLabel: "239.1.1.1", group: "239.1.1.1", egress: ["p2", "p3", "p4", "p5"], receivers: ["server", "observer", "subscriber", "router"], accepters: ["server", "subscriber"], routerAction: "multicast-disabled", explanation: "The switch floods locally; non-subscribers receive but reject the multicast and the router does not route it onward." }),
  authored({ id: "remote-unicast-through-router", title: "Remote unicast through the default gateway", kind: "known-unicast", difficulty: "intermediate", destinationLabel: "Remote server via gateway", destinationNodeId: "router", learned: "p5", egress: ["p5"], receivers: ["router"], accepters: ["router"], routerAction: "route-unicast", explanation: "The local Ethernet frame targets the gateway MAC; the router accepts it and makes the next routed-hop decision." }),
]);
