export type LabConfiguration = "local" | "remote" | "no-gateway";
export type LabDevice = "pc" | "switch" | "router" | "server";
export type LabQuiz = {
  question: string;
  options: { id: string; label: string }[];
  correctId: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
};
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
  ttl: number | null;
  outcome?: "delivered" | "blocked";
};

export type PacketField = { label: string; value: string; changed: boolean };
export type PacketLayer = { id: string; label: string; fields: PacketField[] };

const pcIp = "192.0.2.10";
const pcMac = "02:00:00:00:00:10";
const routerLanMac = "02:00:00:00:00:01";
const routerWanMac = "02:00:00:00:01:01";
const localServerMac = "02:00:00:00:00:20";
const remoteServerMac = "02:00:00:00:01:20";

function hop(from: LabDevice, to: LabDevice, title: string, explanation: string, packetKind: LabHop["packetKind"], sourceIp: string, destinationIp: string, sourceMac: string, destinationMac: string, ttl: number | null, outcome?: LabHop["outcome"]): LabHop {
  return { from, to, title, explanation, packetKind, sourceIp, destinationIp, sourceMac, destinationMac, ttl, outcome };
}

export function buildLabJourney(configuration: LabConfiguration): readonly LabHop[] {
  const local = configuration === "local";
  const destinationIp = local ? "192.0.2.20" : "198.51.100.20";

  if (configuration === "no-gateway") return [{
    from: "pc", to: null, title: "The packet cannot leave the PC",
    explanation: "The destination is outside 192.0.2.0/24, but the PC has no default gateway. It cannot choose a next hop, so no Ethernet frame is sent.",
    packetKind: "Not sent", sourceIp: pcIp, destinationIp, sourceMac: pcMac, destinationMac: "—", ttl: null, outcome: "blocked",
  }];

  if (local) return [
    hop("pc", "switch", "PC sends on the local LAN", "The destination is on the same subnet. With its MAC already learned, the PC sends an Ethernet frame to the switch.", "ICMP echo request", pcIp, destinationIp, pcMac, localServerMac, 64),
    hop("switch", "server", "Switch forwards to the server", "The switch uses the destination MAC to forward the frame; the IP addresses and TTL stay the same — a switch never touches Layer 3.", "ICMP echo request", pcIp, destinationIp, pcMac, localServerMac, 64),
    hop("server", "switch", "Server replies on the LAN", "The local server answers directly toward the PC with a fresh packet of its own; no router is needed.", "ICMP echo reply", destinationIp, pcIp, localServerMac, pcMac, 64),
    hop("switch", "pc", "PC receives the reply", "The switch delivers the reply to the PC, completing the local round trip.", "ICMP echo reply", destinationIp, pcIp, localServerMac, pcMac, 64, "delivered"),
  ];

  return [
    hop("pc", "switch", "PC sends toward its gateway", "The server is on another network. Assuming the gateway MAC is already known, the PC addresses the Ethernet frame to the router.", "ICMP echo request", pcIp, destinationIp, pcMac, routerLanMac, 64),
    hop("switch", "router", "Switch forwards to the router", "The switch follows the gateway MAC. It does not change the IP packet or its TTL.", "ICMP echo request", pcIp, destinationIp, pcMac, routerLanMac, 64),
    hop("router", "server", "Router creates a new frame", "The router forwards the same IP conversation over its outgoing network with a new Ethernet source and destination MAC — and decrements the TTL by 1, since it's the first Layer 3 hop.", "ICMP echo request", pcIp, destinationIp, routerWanMac, remoteServerMac, 63),
    hop("server", "router", "Remote server sends a reply", "The reply IP endpoints reverse; the server originates a brand-new packet with its own fresh TTL.", "ICMP echo reply", destinationIp, pcIp, remoteServerMac, routerWanMac, 64),
    hop("router", "switch", "Router forwards the reply on the LAN", "The router rebuilds the Ethernet frame for the PC-side network and decrements the TTL again before forwarding.", "ICMP echo reply", destinationIp, pcIp, routerLanMac, pcMac, 63),
    hop("switch", "pc", "PC receives the reply", "The switch delivers the return frame to the PC unchanged.", "ICMP echo reply", destinationIp, pcIp, routerLanMac, pcMac, 63, "delivered"),
  ];
}

export function layersForHop(currentHop: LabHop, previousHop: LabHop | null): PacketLayer[] {
  const changed = {
    sourceMac: previousHop ? previousHop.sourceMac !== currentHop.sourceMac : false,
    destinationMac: previousHop ? previousHop.destinationMac !== currentHop.destinationMac : false,
    sourceIp: previousHop ? previousHop.sourceIp !== currentHop.sourceIp : false,
    destinationIp: previousHop ? previousHop.destinationIp !== currentHop.destinationIp : false,
    ttl: previousHop ? previousHop.ttl !== currentHop.ttl : false,
    packetKind: previousHop ? previousHop.packetKind !== currentHop.packetKind : false,
  };

  return [
    {
      id: "ethernet",
      label: "Ethernet frame (Layer 2)",
      fields: [
        { label: "Source MAC", value: currentHop.sourceMac, changed: changed.sourceMac },
        { label: "Destination MAC", value: currentHop.destinationMac, changed: changed.destinationMac },
      ],
    },
    {
      id: "ip",
      label: "IP packet (Layer 3)",
      fields: [
        { label: "Source IP", value: currentHop.sourceIp, changed: changed.sourceIp },
        { label: "Destination IP", value: currentHop.destinationIp, changed: changed.destinationIp },
        { label: "TTL", value: currentHop.ttl === null ? "—" : String(currentHop.ttl), changed: changed.ttl },
      ],
    },
    {
      id: "icmp",
      label: "ICMP message (Layer 4)",
      fields: [{ label: "Message type", value: currentHop.packetKind, changed: changed.packetKind }],
    },
  ];
}

export function quizFor(configuration: LabConfiguration): LabQuiz {
  if (configuration === "local") return {
    question: "Predict: when the PC pings a server on its own subnet, whose MAC address does the first Ethernet frame target?",
    options: [
      { id: "server", label: "The destination server directly" },
      { id: "router", label: "The router (default gateway)" },
      { id: "switch", label: "The switch" },
    ],
    correctId: "server",
    feedbackCorrect: "Correct. Same-subnet traffic is addressed straight to the destination's MAC; the switch just forwards the frame.",
    feedbackIncorrect: "Not quite. For a local destination the PC addresses the frame directly to the server's MAC — no router is involved.",
  };

  if (configuration === "no-gateway") return {
    question: "Predict: without a default gateway configured, what happens when the PC tries to reach a remote network?",
    options: [
      { id: "no-frame", label: "The PC cannot address an Ethernet frame at all" },
      { id: "switch-drops", label: "The frame is sent to the switch, which drops it" },
      { id: "router-error", label: "The router replies with an error message" },
    ],
    correctId: "no-frame",
    feedbackCorrect: "Correct. With no default gateway, the PC has no next hop to address the frame to, so nothing is sent.",
    feedbackIncorrect: "Not quite. The problem happens before the frame is ever sent: the PC has no next-hop MAC to use as the destination.",
  };

  return {
    question: "Predict: for a remote destination, which device's MAC is the destination of the PC's first Ethernet frame?",
    options: [
      { id: "server", label: "The remote server directly" },
      { id: "router", label: "The router (default gateway)" },
      { id: "switch", label: "The switch" },
    ],
    correctId: "router",
    feedbackCorrect: "Correct. The PC sends to its default gateway's MAC; the switch forwards that frame.",
    feedbackIncorrect: "Not quite. The PC sends the frame toward its default gateway, while the IP destination stays the remote server.",
  };
}
