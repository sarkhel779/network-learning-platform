import { parsePacketJourney } from "@/features/packet-journey/packet-journey.schema";
import type { PacketJourney, PacketJourneyStage, PacketLayer } from "@/features/packet-journey/packet-journey.types";

import type { EvaluatedRouteDecision } from "./evaluate-route-decision";
import type { RouteDecisionScenario } from "./route-decision.schema";

const routerWanMac = "02:00:00:00:51:01";
const remoteServerMac = "02:00:00:00:51:20";

function applicationLayer(): PacketLayer {
  return { kind: "application", label: "Application data", fields: [{ label: "Message", value: "Hello server" }] };
}

function ipLayer(scenario: RouteDecisionScenario, ttl: 64 | 63, changed = false): PacketLayer {
  return {
    kind: "ip",
    label: "IP packet",
    fields: [
      { label: "Source IP", value: scenario.sourceIp },
      { label: "Destination IP", value: scenario.destinationIp },
      { label: "TTL", value: String(ttl), changed },
    ],
  };
}

function ethernetLayer(sourceMac: string, destinationMac: string, changed = false): PacketLayer {
  return {
    kind: "ethernet",
    label: "Ethernet frame",
    fields: [
      { label: "Source MAC", value: sourceMac, changed },
      { label: "Destination MAC", value: destinationMac, changed },
    ],
  };
}

function sourceLayers(scenario: RouteDecisionScenario, destinationMac: string) {
  return [applicationLayer(), ipLayer(scenario, 64), ethernetLayer(scenario.interfaces[0].mac, destinationMac)] as const;
}

function devices() {
  return [
    { id: "source", label: "Source host", kind: "host" as const, interfaces: ["Host eth0"] },
    { id: "router", label: "Router", kind: "router" as const, interfaces: ["Router LAN", "Router WAN"] },
    { id: "destination", label: "Destination server", kind: "server" as const, interfaces: ["Destination eth0"] },
  ];
}

function buildStage(scenario: RouteDecisionScenario, destinationMac: string): PacketJourneyStage {
  return {
    id: "build-at-source",
    title: "Build the packet at the source",
    explanation: "The application data is wrapped in an IP packet and then an Ethernet frame.",
    activeDeviceId: "source",
    activeInterfaceId: "Host eth0",
    position: "at-device",
    layers: sourceLayers(scenario, destinationMac),
  };
}

function buildRemoteJourney(scenario: RouteDecisionScenario): PacketJourneyStage[] {
  const firstFrame = sourceLayers(scenario, scenario.nextHopMac!);
  const opened = [applicationLayer(), ipLayer(scenario, 64)] as const;
  const routed = [applicationLayer(), ipLayer(scenario, 63, true)] as const;
  const reframed = [...routed, ethernetLayer(routerWanMac, remoteServerMac, true)] as const;

  return [
    buildStage(scenario, scenario.nextHopMac!),
    { id: "leave-source-eth0", title: "Leave Host eth0", explanation: "The first Ethernet frame travels to the default gateway.", activeDeviceId: "source", activeInterfaceId: "Host eth0", activeLinkId: "source-router", position: "on-link", layers: firstFrame },
    { id: "open-at-router-lan", title: "Open the frame at Router LAN", explanation: "The router removes the incoming Ethernet frame and examines the IP packet.", activeDeviceId: "router", activeInterfaceId: "Router LAN", activeLinkId: "source-router", position: "at-device", layers: opened },
    { id: "choose-router-wan", title: "Choose Router WAN", explanation: "The router selects its outgoing interface and decreases TTL from 64 to 63.", technicalDetail: "A router makes the forwarding decision from the destination IP address and its routing table.", activeDeviceId: "router", activeInterfaceId: "Router WAN", activeLinkId: "router-destination", position: "at-device", layers: routed },
    { id: "reframe-for-next-link", title: "Build a new Ethernet frame", explanation: "The MAC addresses change for the next link. The source and destination IP addresses stay the same because this example does not use NAT.", activeDeviceId: "router", activeInterfaceId: "Router WAN", activeLinkId: "router-destination", position: "on-link", layers: reframed },
    { id: "deliver-to-destination", title: "Deliver to Destination eth0", explanation: "The destination opens the Ethernet frame and IP packet, then gives the data to the application.", activeDeviceId: "destination", activeInterfaceId: "Destination eth0", activeLinkId: "router-destination", position: "at-device", layers: [applicationLayer()] },
  ];
}

function buildDirectJourney(scenario: RouteDecisionScenario, gatewaySelf: boolean): PacketJourneyStage[] {
  const destinationMac = scenario.destinationMac!;
  if (gatewaySelf) {
    return [
      buildStage(scenario, destinationMac),
      { id: "leave-source-eth0", title: "Leave Host eth0", explanation: "The frame travels directly to the gateway's local interface.", activeDeviceId: "source", activeInterfaceId: "Host eth0", activeLinkId: "source-router", position: "on-link", layers: sourceLayers(scenario, destinationMac) },
      { id: "receive-at-router-lan", title: "Receive at Router LAN", explanation: "The router receives the packet as its own local traffic; it does not route it onward.", activeDeviceId: "router", activeInterfaceId: "Router LAN", activeLinkId: "source-router", position: "at-device", layers: [applicationLayer()] },
    ];
  }
  return [
    buildStage(scenario, destinationMac),
    { id: "direct-on-local-link", title: "Send directly on the local link", explanation: "The destination is on-link, so the router is bypassed.", activeDeviceId: "source", activeInterfaceId: "Host eth0", activeLinkId: "source-destination", position: "on-link", layers: sourceLayers(scenario, destinationMac) },
    { id: "deliver-to-destination", title: "Deliver directly to Destination eth0", explanation: "The destination receives and opens the frame.", activeDeviceId: "destination", activeInterfaceId: "Destination eth0", activeLinkId: "source-destination", position: "at-device", layers: [applicationLayer()] },
  ];
}

function buildNoRouteJourney(scenario: RouteDecisionScenario): PacketJourneyStage[] {
  const layers = [applicationLayer(), ipLayer(scenario, 64)] as const;
  return [
    { id: "build-at-source", title: "Build the IP packet", explanation: "The host creates the packet and checks its routing table.", activeDeviceId: "source", activeInterfaceId: "Host eth0", position: "at-device", layers },
    { id: "stop-no-route", title: "Stop: no usable route", explanation: "No outgoing interface or next hop can be selected, so no Ethernet frame leaves the source.", activeDeviceId: "source", activeInterfaceId: "Host eth0", position: "at-boundary", layers },
  ];
}

function buildBroadcastJourney(scenario: RouteDecisionScenario): PacketJourneyStage[] {
  const layers = sourceLayers(scenario, "FF:FF:FF:FF:FF:FF");
  return [
    { ...buildStage(scenario, "FF:FF:FF:FF:FF:FF"), id: "build-broadcast-frame", title: "Build a local broadcast frame" },
    { id: "broadcast-on-local-link", title: "Broadcast on the local link", explanation: "Every interface in this local broadcast domain can receive the frame.", activeDeviceId: "source", activeInterfaceId: "Host eth0", activeLinkId: "source-router", position: "on-link", layers },
    { id: "stop-at-router-boundary", title: "Stop at the router boundary", explanation: "The router does not forward this ordinary Layer 2 broadcast into another network.", activeDeviceId: "router", activeInterfaceId: "Router LAN", activeLinkId: "source-router", position: "at-boundary", layers },
  ];
}

export function createRouteJourney(scenario: RouteDecisionScenario, outcome: EvaluatedRouteDecision): PacketJourney {
  const isGatewayDestination = scenario.routes.some(({ nextHop }) => nextHop === scenario.destinationIp);
  const stages = outcome.scope === "remote-via-gateway"
    ? buildRemoteJourney(scenario)
    : outcome.scope === "no-route"
      ? buildNoRouteJourney(scenario)
      : outcome.scope === "local-broadcast"
        ? buildBroadcastJourney(scenario)
        : buildDirectJourney(scenario, isGatewayDestination);

  return parsePacketJourney({
    id: `route-${scenario.id}`,
    accessibleName: `Packet journey for ${scenario.title}`,
    devices: devices(),
    stages,
  });
}
