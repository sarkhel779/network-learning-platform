import { parseDeliveryCatalog, type DeliveryKind, type DeliveryScenario, type RouterAction } from "./delivery-scope.schema";

const nodes = [
  { id: "sender", label: "Sender", kind: "host" as const, acceptsUnicast: false, multicastGroups: [] },
  { id: "host-b", label: "Host B — subscriber", kind: "host" as const, acceptsUnicast: true, multicastGroups: ["239.1.1.1"] },
  { id: "host-c", label: "Host C — non-subscriber", kind: "host" as const, acceptsUnicast: false, multicastGroups: [] },
  { id: "host-d", label: "Host D — subscriber", kind: "host" as const, acceptsUnicast: false, multicastGroups: ["239.1.1.1"] },
  { id: "router", label: "Router", kind: "router" as const, acceptsUnicast: false, multicastGroups: [] },
];
const ports = [
  { id: "p1", label: "P1", connectedNodeId: "sender", eligible: true },
  { id: "p2", label: "P2", connectedNodeId: "host-b", eligible: true },
  { id: "p3", label: "P3", connectedNodeId: "host-c", eligible: true },
  { id: "p4", label: "P4", connectedNodeId: "host-d", eligible: true },
  { id: "p5", label: "P5", connectedNodeId: "router", eligible: true },
];

function demonstration(input: {
  id: string; title: string; kind: DeliveryKind; destinationLabel: string;
  egress: string[]; receivers: string[]; accepters: string[]; routerAction: RouterAction;
  destinationNodeId?: string; learnedDestinationPortId?: string; multicastGroup?: string; knownGroup?: boolean;
  explanation: string;
}): DeliveryScenario {
  return {
    id: input.id, difficulty: "foundational", title: input.title, deliveryKind: input.kind,
    destinationLabel: input.destinationLabel, destinationNodeId: input.destinationNodeId,
    multicastGroup: input.multicastGroup, multicastGroupKnownToSwitch: input.knownGroup ?? false,
    ingressPortId: "p1", nodes, ports, learnedDestinationPortId: input.learnedDestinationPortId,
    routerAction: input.routerAction, expectedEgressPortIds: input.egress,
    expectedReceivingNodeIds: input.receivers, expectedAcceptingNodeIds: input.accepters,
    explanation: input.explanation,
    evidenceNotes: ["Compare the switch egress ports with the interfaces that receive and accept the frame."],
    wrongAnswerExplanations: { forwarded: "Trace eligible egress ports.", received: "Follow each egress link.", accepted: "Check destination or group membership.", router: "Apply the local router boundary." },
  };
}

export const publicDeliveryDemonstrations = parseDeliveryCatalog([
  demonstration({ id: "public-known-unicast", title: "Known HTTPS unicast", kind: "known-unicast", destinationLabel: "Unicast destination: Host B", destinationNodeId: "host-b", learnedDestinationPortId: "p2", egress: ["p2"], receivers: ["host-b"], accepters: ["host-b"], routerAction: "not-in-path", explanation: "The learned unicast destination uses only P2." }),
  demonstration({ id: "public-unknown-unicast", title: "Unknown unicast flood", kind: "unknown-unicast", destinationLabel: "Unicast destination: Host B", destinationNodeId: "host-b", egress: ["p2", "p3", "p4", "p5"], receivers: ["host-b", "host-c", "host-d", "router"], accepters: ["host-b"], routerAction: "receive-local-only", explanation: "The switch floods an unknown unicast, but only its unicast destination accepts it." }),
  demonstration({ id: "public-arp-broadcast", title: "ARP local broadcast", kind: "broadcast", destinationLabel: "Local broadcast", egress: ["p2", "p3", "p4", "p5"], receivers: ["host-b", "host-c", "host-d", "router"], accepters: ["host-b", "host-c", "host-d", "router"], routerAction: "receive-local-only", explanation: "Every local interface receives the ARP broadcast; the router does not forward it onward." }),
  demonstration({ id: "public-known-multicast", title: "Known multicast subscribers", kind: "multicast", destinationLabel: "Video group 239.1.1.1", multicastGroup: "239.1.1.1", knownGroup: true, egress: ["p2", "p4"], receivers: ["host-b", "host-d"], accepters: ["host-b", "host-d"], routerAction: "not-in-path", explanation: "Group-aware switching selects the subscribed receiver ports." }),
  demonstration({ id: "public-unknown-multicast", title: "Multicast without group-aware state", kind: "multicast", destinationLabel: "Video group 239.1.1.1", multicastGroup: "239.1.1.1", egress: ["p2", "p3", "p4", "p5"], receivers: ["host-b", "host-c", "host-d", "router"], accepters: ["host-b", "host-d"], routerAction: "multicast-disabled", explanation: "Without group-aware state the switch floods locally; only subscribers accept the multicast." }),
]);
