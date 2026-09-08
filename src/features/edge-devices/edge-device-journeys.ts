export type EdgeDeviceKind = "host" | "access-point" | "router" | "firewall" | "modem" | "ont" | "provider";
export type EdgeDeviceRole = "create-data" | "bridge-access" | "route" | "inspect-policy" | "convert-signal" | "provider-handoff";

export type EdgeDevice = Readonly<{
  id: string;
  label: string;
  kind: EdgeDeviceKind;
  interfaceLabel: string;
}>;

export type EdgeDeviceStage = Readonly<{
  role: EdgeDeviceRole;
  title: string;
  activeDeviceId: string;
  explanation: string;
  packetView: string;
  changesPacketAddressing: boolean;
}>;

export type EdgeDeviceJourney = Readonly<{
  id: string;
  title: string;
  devices: readonly EdgeDevice[];
  stages: readonly EdgeDeviceStage[];
}>;

const roleCopy: Record<EdgeDeviceRole, Omit<EdgeDeviceStage, "activeDeviceId">> = {
  "create-data": { role: "create-data", title: "The host creates application data", explanation: "The laptop creates data for a remote service and passes it down to the network stack.", packetView: "Application data → IP packet → local-link frame", changesPacketAddressing: false },
  "bridge-access": { role: "bridge-access", title: "The access point bridges Wi-Fi to Ethernet", explanation: "The access point connects the wireless client to the same local Layer 2 network. It does not choose an Internet route.", packetView: "Same IP packet; local access framing changes", changesPacketAddressing: false },
  route: { role: "route", title: "The router chooses the next network", explanation: "The router removes the incoming local-link frame, reads the destination IP, chooses its WAN interface, and builds framing for the next link.", packetView: "IP endpoints remain; hop framing is replaced", changesPacketAddressing: false },
  "inspect-policy": { role: "inspect-policy", title: "The firewall evaluates the boundary", explanation: "The firewall applies configured policy and session context to permit or deny the flow. Detailed policy and state belong to the Security pathway.", packetView: "Packet and session evidence are inspected", changesPacketAddressing: false },
  "convert-signal": { role: "convert-signal", title: "The access circuit is converted", explanation: "The modem or ONT converts between the customer-facing handoff and the provider's physical access technology. Conversion alone does not make a routing or firewall decision.", packetView: "Network data carried over a different physical signal", changesPacketAddressing: false },
  "provider-handoff": { role: "provider-handoff", title: "The ISP receives the handoff", explanation: "The provider carries the traffic beyond the customer edge toward other networks and the destination service.", packetView: "Traffic enters the provider network", changesPacketAddressing: false },
};

function stages(conversionLabel: string): EdgeDeviceStage[] {
  return [
    { ...roleCopy["create-data"], activeDeviceId: "source" },
    { ...roleCopy["bridge-access"], activeDeviceId: "access" },
    { ...roleCopy.route, activeDeviceId: "routing" },
    { ...roleCopy["inspect-policy"], activeDeviceId: "routing" },
    { ...roleCopy["convert-signal"], activeDeviceId: "conversion", title: `${conversionLabel} converts the access signal` },
    { ...roleCopy["provider-handoff"], activeDeviceId: "provider" },
  ];
}

function journey(id: string, title: string, accessLabel: string, conversionLabel: string, conversionKind: "modem" | "ont", combined = true): EdgeDeviceJourney {
  return {
    id,
    title,
    devices: [
      { id: "source", label: id === "office-wireless" ? "Work laptop" : "Laptop", kind: "host", interfaceLabel: "Client Wi-Fi" },
      { id: "access", label: accessLabel, kind: "access-point", interfaceLabel: "Wireless ↔ LAN bridge" },
      { id: "routing", label: combined ? "Router + firewall" : "Office router/firewall", kind: "firewall", interfaceLabel: "LAN ↔ WAN boundary" },
      { id: "conversion", label: conversionLabel, kind: conversionKind, interfaceLabel: "Customer ↔ provider handoff" },
      { id: "provider", label: "ISP network", kind: "provider", interfaceLabel: "Provider edge" },
    ],
    stages: stages(conversionLabel),
  };
}

export const edgeDeviceJourneys: readonly EdgeDeviceJourney[] = [
  journey("home-fibre", "Home fibre", "Wi-Fi access point", "ONT", "ont"),
  journey("home-cable", "Home cable", "Wi-Fi access point", "Cable modem", "modem"),
  journey("office-wireless", "Office wireless", "Managed access point", "Fibre ONT", "ont", false),
  journey("bridge-only-handoff", "Bridge/modem-only mode", "Wireless bridge", "Bridged modem", "modem", false),
];

export function getEdgeDeviceJourney(id: string): EdgeDeviceJourney {
  return edgeDeviceJourneys.find((item) => item.id === id) ?? edgeDeviceJourneys[0];
}
