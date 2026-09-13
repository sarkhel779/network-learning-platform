export type LabConfiguration = "local" | "remote" | "no-gateway";
export type LabDevice = "pc" | "switch" | "router" | "server";
export type LabHop = {
  from: LabDevice;
  to: LabDevice | null;
  title: string;
  explanation: string;
  packetKind: "ICMP echo request" | "ICMP echo reply" | "Not sent";
  sourceIp: string;
  destinationIp: string;
  sourceMac: string;
  destinationMac: string;
  outcome?: "delivered" | "blocked";
};

const pcIp = "192.0.2.10";
const pcMac = "02:00:00:00:00:10";
const routerLanMac = "02:00:00:00:00:01";
const routerWanMac = "02:00:00:00:01:01";
const localServerMac = "02:00:00:00:00:20";
const remoteServerMac = "02:00:00:00:01:20";

function hop(from: LabDevice, to: LabDevice, title: string, explanation: string, packetKind: LabHop["packetKind"], sourceIp: string, destinationIp: string, sourceMac: string, destinationMac: string, outcome?: LabHop["outcome"]): LabHop {
  return { from, to, title, explanation, packetKind, sourceIp, destinationIp, sourceMac, destinationMac, outcome };
}

export function buildLabJourney(configuration: LabConfiguration): readonly LabHop[] {
  const local = configuration === "local";
  const destinationIp = local ? "192.0.2.20" : "198.51.100.20";

  if (configuration === "no-gateway") return [{
    from: "pc", to: null, title: "The packet cannot leave the PC",
    explanation: "The destination is outside 192.0.2.0/24, but the PC has no default gateway. It cannot choose a next hop, so no Ethernet frame is sent.",
    packetKind: "Not sent", sourceIp: pcIp, destinationIp, sourceMac: pcMac, destinationMac: "—", outcome: "blocked",
  }];

  if (local) return [
    hop("pc", "switch", "PC sends on the local LAN", "The destination is on the same subnet. With its MAC already learned, the PC sends an Ethernet frame to the switch.", "ICMP echo request", pcIp, destinationIp, pcMac, localServerMac),
    hop("switch", "server", "Switch forwards to the server", "The switch uses the destination MAC to forward the frame; the IP addresses stay the same.", "ICMP echo request", pcIp, destinationIp, pcMac, localServerMac),
    hop("server", "switch", "Server replies on the LAN", "The local server answers directly toward the PC; no router is needed.", "ICMP echo reply", destinationIp, pcIp, localServerMac, pcMac),
    hop("switch", "pc", "PC receives the reply", "The switch delivers the reply to the PC, completing the local round trip.", "ICMP echo reply", destinationIp, pcIp, localServerMac, pcMac, "delivered"),
  ];

  return [
    hop("pc", "switch", "PC sends toward its gateway", "The server is on another network. Assuming the gateway MAC is already known, the PC addresses the Ethernet frame to the router.", "ICMP echo request", pcIp, destinationIp, pcMac, routerLanMac),
    hop("switch", "router", "Switch forwards to the router", "The switch follows the gateway MAC. It does not change the IP packet.", "ICMP echo request", pcIp, destinationIp, pcMac, routerLanMac),
    hop("router", "server", "Router creates a new frame", "The router forwards the same IP conversation over its outgoing network with a new Ethernet source and destination MAC.", "ICMP echo request", pcIp, destinationIp, routerWanMac, remoteServerMac),
    hop("server", "router", "Remote server sends a reply", "The reply IP endpoints reverse; its frame goes back toward the router.", "ICMP echo reply", destinationIp, pcIp, remoteServerMac, routerWanMac),
    hop("router", "switch", "Router forwards the reply on the LAN", "The router rebuilds the Ethernet frame for the PC-side network. The reply IP endpoints stay server to PC.", "ICMP echo reply", destinationIp, pcIp, routerLanMac, pcMac),
    hop("switch", "pc", "PC receives the reply", "The switch delivers the return frame to the PC.", "ICMP echo reply", destinationIp, pcIp, routerLanMac, pcMac, "delivered"),
  ];
}
