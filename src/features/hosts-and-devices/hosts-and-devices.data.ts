import type { PacketFlowScenario, PacketFlowStep } from "@/features/packet-flow/packet-flow.schema";

import { parseHostsAndDevicesLab } from "./hosts-and-devices.schema";

const addresses = {
  wiredPcIp: "192.168.10.10",
  wiredPcMac: "02:00:00:00:10:10",
  laptopIp: "192.168.10.20",
  laptopMac: "02:00:00:00:10:20",
  gatewayIp: "192.168.10.1",
  gatewayMac: "02:00:00:00:10:01",
  firewallMac: "02:00:00:00:20:01",
  localServerIp: "192.168.10.50",
  localServerMac: "02:00:00:00:10:50",
  remoteServerIp: "203.0.113.50",
  remoteServerMac: "02:00:00:00:71:50",
} as const;

const devices = [
  { id: "wired-pc", label: "Wired PC", role: "host", x: 70, y: 70 },
  { id: "wireless-laptop", label: "Wireless laptop", role: "host", x: 70, y: 190 },
  { id: "access-point", label: "Access point", role: "wireless bridge", x: 205, y: 190 },
  { id: "switch", label: "Layer 2 switch", role: "LAN forwarding", x: 330, y: 120 },
  { id: "gateway", label: "Gateway", role: "router", x: 475, y: 75 },
  { id: "firewall", label: "Firewall", role: "security boundary", x: 610, y: 75 },
  { id: "local-server", label: "Local server", role: "LAN host", x: 475, y: 190 },
  { id: "remote-server", label: "Remote server", role: "remote host", x: 745, y: 75 },
] as const;

const links = [
  { id: "wired-switch", from: "wired-pc", to: "switch" },
  { id: "wireless-ap", from: "wireless-laptop", to: "access-point" },
  { id: "ap-switch", from: "access-point", to: "switch" },
  { id: "switch-local", from: "switch", to: "local-server" },
  { id: "switch-gateway", from: "switch", to: "gateway" },
  { id: "gateway-firewall", from: "gateway", to: "firewall" },
  { id: "firewall-remote", from: "firewall", to: "remote-server" },
] as const;

const linkId = (from: string, to: string) => {
  const link = links.find(
    (candidate) =>
      (candidate.from === from && candidate.to === to) ||
      (candidate.from === to && candidate.to === from),
  );
  if (!link) throw new Error(`Missing topology link from ${from} to ${to}`);
  return link.id;
};

type JourneyOptions = Readonly<{
  id: "wired-local" | "wireless-local" | "wired-remote" | "wireless-remote";
  sourceId: "wired-pc" | "wireless-laptop";
  sourceIp: string;
  sourceMac: string;
  remote: boolean;
}>;

function fields(
  protocol: string,
  sourceIp: string,
  destinationIp: string,
  sourceMac: string,
  destinationMac: string,
  nextHop: string,
  changed = false,
): Pick<PacketFlowStep, "summaryFields" | "detailFields"> {
  return {
    summaryFields: [
      { label: "Protocol", value: protocol },
      { label: "Destination IP", value: destinationIp },
      { label: "Next hop", value: nextHop },
    ],
    detailFields: [
      { label: "Source IP", value: sourceIp },
      { label: "Destination IP", value: destinationIp },
      { label: "Source MAC", value: sourceMac, changed },
      { label: "Destination MAC", value: destinationMac, changed },
    ],
  };
}

function travelSteps(
  journeyId: string,
  phase: "arp-request" | "arp-reply" | "outbound" | "return",
  path: readonly string[],
  protocol: string,
  sourceIp: string,
  destinationIp: string,
  firstSourceMac: string,
  firstDestinationMac: string,
): PacketFlowStep[] {
  return path.slice(0, -1).map((from, index) => {
    const to = path[index + 1];
    const routedLink = from === "gateway" || to === "gateway" || from === "firewall" || to === "firewall";
    const remotePath = path.includes("firewall");
    let sourceMac = firstSourceMac;
    let destinationMac = firstDestinationMac;

    if (remotePath && phase === "outbound") {
      if (from === "gateway") {
        sourceMac = addresses.gatewayMac;
        destinationMac = addresses.firewallMac;
      } else if (from === "firewall") {
        sourceMac = addresses.firewallMac;
        destinationMac = addresses.remoteServerMac;
      }
    } else if (remotePath && phase === "return") {
      if (from === "remote-server") {
        sourceMac = addresses.remoteServerMac;
        destinationMac = addresses.firewallMac;
      } else if (from === "firewall") {
        sourceMac = addresses.firewallMac;
        destinationMac = addresses.gatewayMac;
      } else {
        sourceMac = addresses.gatewayMac;
        destinationMac = firstDestinationMac;
      }
    }
    const linkLayerChanged = sourceMac !== firstSourceMac || destinationMac !== firstDestinationMac;
    const direction = phase === "return" || phase === "arp-reply" ? "back toward the sender" : "toward the destination";

    return {
      id: `${journeyId}-${phase}-${index + 1}`,
      title: `${protocol} travels ${direction}`,
      explanation: `${from} sends the current frame to ${to} on this link.`,
      durationMs: 2200,
      activeDeviceIds: [from, to],
      activeLinkIds: [linkId(from, to)],
      packet: {
        kind: "frame",
        label: protocol,
        from,
        to,
        broadcast: phase === "arp-request",
      },
      ...fields(protocol, sourceIp, destinationIp, sourceMac, destinationMac, to, linkLayerChanged),
      stateNote: routedLink && phase === "outbound"
        ? "The router or firewall uses a new link-layer frame; the end-to-end destination IP remains unchanged. NAT is not shown."
        : undefined,
    };
  });
}

function buildScenario(options: JourneyOptions): PacketFlowScenario {
  const wireless = options.sourceId === "wireless-laptop";
  const destinationId = options.remote ? "remote-server" : "local-server";
  const destinationIp = options.remote ? addresses.remoteServerIp : addresses.localServerIp;
  const destinationMac = options.remote ? addresses.gatewayMac : addresses.localServerMac;
  const arpTargetId = options.remote ? "gateway" : "local-server";
  const arpTargetIp = options.remote ? addresses.gatewayIp : addresses.localServerIp;
  const arpTargetMac = options.remote ? addresses.gatewayMac : addresses.localServerMac;
  const sourceAccessPath = wireless
    ? [options.sourceId, "access-point", "switch"]
    : [options.sourceId, "switch"];
  const arpPath = [...sourceAccessPath, arpTargetId];
  const dataPath = options.remote
    ? [...sourceAccessPath, "gateway", "firewall", destinationId]
    : [...sourceAccessPath, destinationId];

  const steps: PacketFlowStep[] = [
    {
      id: `${options.id}-decision`,
      title: options.remote ? "The host chooses its default gateway" : "The host recognizes a local destination",
      explanation: options.remote
        ? `The destination ${destinationIp} is outside 192.168.10.0/24, so the first local receiver is the default gateway.`
        : `The destination ${destinationIp} is inside 192.168.10.0/24, so the host can send directly on the LAN.`,
      durationMs: 2200,
      activeDeviceIds: [options.sourceId],
      activeLinkIds: [],
      summaryFields: [
        { label: "Source network", value: "192.168.10.0/24" },
        { label: "Destination IP", value: destinationIp },
        { label: "Decision", value: options.remote ? "Use default gateway" : "Deliver locally" },
      ],
      detailFields: [
        { label: "Subnet mask", value: "255.255.255.0" },
        { label: "ARP target", value: `${arpTargetIp} (${arpTargetId})` },
      ],
    },
    ...travelSteps(
      options.id,
      "arp-request",
      arpPath,
      "ARP request",
      options.sourceIp,
      arpTargetIp,
      options.sourceMac,
      "ff:ff:ff:ff:ff:ff",
    ),
    ...travelSteps(
      options.id,
      "arp-reply",
      [...arpPath].reverse(),
      "ARP reply",
      arpTargetIp,
      options.sourceIp,
      arpTargetMac,
      options.sourceMac,
    ),
    ...travelSteps(
      options.id,
      "outbound",
      dataPath,
      "ICMP echo request",
      options.sourceIp,
      destinationIp,
      options.sourceMac,
      destinationMac,
    ),
    ...travelSteps(
      options.id,
      "return",
      [...dataPath].reverse(),
      "ICMP echo reply",
      destinationIp,
      options.sourceIp,
      options.remote ? addresses.remoteServerMac : addresses.localServerMac,
      options.sourceMac,
    ),
  ];

  return {
    id: options.id,
    title: `${wireless ? "Wireless" : "Wired"} host to ${options.remote ? "remote" : "local"} server`,
    description: options.remote
      ? "The host keeps the remote server IP but sends its first LAN frame to the default gateway."
      : "The host sends directly to another device on the same IPv4 network.",
    defaultSpeed: 1,
    devices,
    links,
    steps,
  };
}

const noteKeys = (
  wiredLocal: string,
  wirelessLocal: string,
  wiredRemote: string,
  wirelessRemote: string,
) => ({
  "wired-local": wiredLocal,
  "wireless-local": wirelessLocal,
  "wired-remote": wiredRemote,
  "wireless-remote": wirelessRemote,
});

export const hostsAndDevicesLab = parseHostsAndDevicesLab({
  id: "hosts-and-network-devices",
  title: "Hosts and network devices",
  description: "Select a journey, play its path, and choose any device to understand its role.",
  journeys: [
    {
      id: "wired-local",
      label: "Wired host to local server",
      shortDescription: "The PC reaches a server on the same LAN.",
      scenario: buildScenario({ id: "wired-local", sourceId: "wired-pc", sourceIp: addresses.wiredPcIp, sourceMac: addresses.wiredPcMac, remote: false }),
    },
    {
      id: "wireless-local",
      label: "Wireless host to local server",
      shortDescription: "The laptop crosses the access point and switched LAN.",
      scenario: buildScenario({ id: "wireless-local", sourceId: "wireless-laptop", sourceIp: addresses.laptopIp, sourceMac: addresses.laptopMac, remote: false }),
    },
    {
      id: "wired-remote",
      label: "Wired host to remote server",
      shortDescription: "The PC uses its gateway and crosses a firewall boundary.",
      scenario: buildScenario({ id: "wired-remote", sourceId: "wired-pc", sourceIp: addresses.wiredPcIp, sourceMac: addresses.wiredPcMac, remote: true }),
    },
    {
      id: "wireless-remote",
      label: "Wireless host to remote server",
      shortDescription: "The laptop crosses wireless, switched, routed, and secured links.",
      scenario: buildScenario({ id: "wireless-remote", sourceId: "wireless-laptop", sourceIp: addresses.laptopIp, sourceMac: addresses.laptopMac, remote: true }),
    },
  ],
  profiles: [
    {
      deviceId: "wired-pc", name: "Wired PC", category: "host",
      summary: "A wired PC is an endpoint that creates requests and accepts replies over an Ethernet connection.",
      purpose: "It represents a user device connected directly to the LAN switch.",
      trafficRole: "It originates traffic and decides whether the destination is local or remote.",
      addressing: "It uses its IP configuration for the subnet decision and MAC addresses for the first LAN frame.",
      packetBehavior: "It creates the IP packet, resolves the required next-hop MAC, and encapsulates the packet in a frame.",
      evidence: "ipconfig shows its address and gateway; Wireshark shows its source IP and source MAC.",
      commonFailure: "A wrong subnet mask or gateway can make the PC choose the wrong delivery path.",
      analogy: "It is the person who addresses a parcel and chooses local delivery or a courier depot.",
      technicalDetails: "The operating system compares the destination IP with the local prefix before consulting ARP and the routing table.",
      journeyNotes: noteKeys("The PC sends directly to the local server through the switch.", "The PC is not active in this laptop journey.", "The PC targets the gateway MAC for the remote server.", "The PC is not active in this laptop journey."),
    },
    {
      deviceId: "wireless-laptop", name: "Wireless laptop", category: "host",
      summary: "A wireless laptop is an endpoint that reaches the LAN through radio and an associated access point.",
      purpose: "It demonstrates that wireless access changes the first medium without changing the IP subnet decision.",
      trafficRole: "It originates and receives traffic while the access point bridges that traffic to the wired LAN.",
      addressing: "It still uses an IP address, subnet mask, gateway, and link-layer addressing for local delivery.",
      packetBehavior: "It creates the same logical IP packet as a wired host and sends it through the wireless access link.",
      evidence: "ipconfig identifies the wireless adapter; a suitable capture shows its IP conversations and local address resolution.",
      commonFailure: "Loss of association, weak signal, or incorrect IP configuration prevents useful communication.",
      analogy: "It is a caller using a wireless handset before the call joins the building's wired system.",
      technicalDetails: "This lesson treats the access point as a bridge and intentionally postpones detailed 802.11 frame addressing.",
      journeyNotes: noteKeys("The laptop is not active in this PC journey.", "The laptop reaches the local server through the access point.", "The laptop is not active in this PC journey.", "The laptop targets the gateway MAC after crossing the access point."),
    },
    {
      deviceId: "access-point", name: "Wireless access point", category: "intermediary",
      summary: "The access point connects an associated wireless host to the wired local network.",
      purpose: "It bridges the laptop's wireless access into the switched LAN.",
      trafficRole: "It forwards local traffic between radio and Ethernet media rather than acting as the destination.",
      addressing: "It handles link-layer forwarding; it does not replace the remote server's destination IP.",
      packetBehavior: "It carries the laptop's traffic onto the LAN while preserving the lesson's end-to-end IP conversation.",
      evidence: "A capture point matters: wireless and wired-side captures can expose different link-layer framing.",
      commonFailure: "A disconnected or unassociated access point isolates the wireless laptop from the LAN.",
      analogy: "It is a doorway that translates access from a wireless room into a wired hallway.",
      technicalDetails: "An AP normally bridges an 802.11 basic service set to a distribution system; detailed wireless headers are out of scope here.",
      journeyNotes: noteKeys("The access point is outside the wired path.", "It bridges every laptop frame to and from the switch.", "The access point is outside the wired path.", "It bridges the laptop before routing and again on the return path."),
    },
    {
      deviceId: "switch", name: "Layer 2 switch", category: "intermediary",
      summary: "A switch connects LAN devices and forwards Ethernet frames using destination MAC information.",
      purpose: "It provides the shared wired path among clients, the local server, the access point, and the gateway.",
      trafficRole: "It forwards frames inside the LAN and floods broadcasts such as an ARP request where appropriate.",
      addressing: "Its principal forwarding decision uses the destination MAC address, not the final remote IP route.",
      packetBehavior: "It normally forwards the frame without becoming the end-to-end source or destination.",
      evidence: "Endpoint captures reveal the frame; switch tables and port counters provide additional operational evidence.",
      commonFailure: "A failed port, cable, or incorrect VLAN placement can break an otherwise correct host configuration.",
      analogy: "It is a mailroom that sends an envelope to the correct office on the same floor.",
      technicalDetails: "The switch learns source MAC locations and consults its forwarding table; MAC learning is taught deeply later.",
      journeyNotes: noteKeys("It forwards between the PC and local server.", "It joins the AP path to the local server.", "It forwards the PC's frame to the gateway.", "It forwards the AP's frame to the gateway."),
    },
    {
      deviceId: "gateway", name: "Router and default gateway", category: "intermediary",
      summary: "The default gateway is the router interface a host uses to reach destinations outside its local network.",
      purpose: "It separates the local subnet from remote networks and chooses the next routed path.",
      trafficRole: "It accepts frames addressed to its LAN MAC, examines the destination IP, and forwards the packet.",
      addressing: "The incoming frame targets the gateway MAC while the packet still targets the remote server IP.",
      packetBehavior: "It removes the incoming link-layer frame and builds a new frame for the next link.",
      evidence: "route print shows the default route; arp -a can show the gateway's LAN MAC mapping.",
      commonFailure: "A missing or incorrect default gateway prevents remote communication while local traffic may still work.",
      analogy: "It is the depot that accepts a locally addressed truck and chooses the road to another city.",
      technicalDetails: "Routing decrements TTL and replaces link-layer encapsulation; this lesson does not demonstrate NAT.",
      journeyNotes: noteKeys("The gateway is outside this local path.", "The gateway is outside this local path.", "It is the PC's first-hop MAC target and routes the packet onward.", "It is the laptop's first-hop MAC target after the AP and switch."),
    },
    {
      deviceId: "firewall", name: "Firewall boundary", category: "security-boundary",
      summary: "A firewall is a security checkpoint that can permit or deny traffic crossing a network boundary.",
      purpose: "It briefly marks where security policy may be applied on the path to a remote network.",
      trafficRole: "It evaluates crossing traffic, but its detailed state and policy logic belong to the firewall module.",
      addressing: "It observes packet and connection information without becoming the final application destination.",
      packetBehavior: "In these allowed examples it forwards the routed packet toward the remote server and back.",
      evidence: "Packet captures show allowed traffic; firewall logs and session tables provide deeper evidence in later lessons.",
      commonFailure: "A deny rule or missing return-state handling can stop traffic at the boundary.",
      analogy: "It is a security desk that checks permission before a visitor crosses into another area.",
      technicalDetails: "Stateful inspection, zones, policy order, NAT, App-ID, and Palo Alto configuration are deliberately deferred.",
      journeyNotes: noteKeys("The firewall is outside this local path.", "The firewall is outside this local path.", "It permits the PC's example request and reply across the boundary.", "It permits the laptop's example request and reply across the boundary."),
    },
    {
      deviceId: "local-server", name: "Local server", category: "host",
      summary: "The local server is a destination host on the same IPv4 subnet as the clients.",
      purpose: "It demonstrates direct LAN delivery without a router in the active path.",
      trafficRole: "It accepts requests addressed to its IP and MAC and creates return traffic.",
      addressing: "Its MAC is the first frame destination when the client recognizes a local destination.",
      packetBehavior: "It decapsulates the received frame, processes the packet, and creates the reply.",
      evidence: "ARP and ICMP captures can show direct client/server MAC and IP pairs.",
      commonFailure: "A wrong server mask, disabled interface, or local host firewall can prevent a response.",
      analogy: "It is another office on the same floor, reachable without leaving the building.",
      technicalDetails: "Because both endpoints share 192.168.10.0/24, the sender resolves the server directly rather than the gateway.",
      journeyNotes: noteKeys("It receives the PC request directly on the LAN and returns a reply.", "It receives the laptop request through the AP and switch.", "It is outside the remote-server path.", "It is outside the remote-server path."),
    },
    {
      deviceId: "remote-server", name: "Remote server", category: "host",
      summary: "The remote server is the final destination host on a different IP network.",
      purpose: "It demonstrates why a local sender needs a default gateway to reach another network.",
      trafficRole: "It accepts the routed request and creates the return packet toward the original client.",
      addressing: "Its IP remains the outbound packet destination, but its MAC is not used on the client's LAN.",
      packetBehavior: "It receives the packet after routed and secured links, then sends an echo reply along the return path.",
      evidence: "A client-side capture shows the remote IP paired with the gateway MAC on the local link.",
      commonFailure: "A routing, security, service, or return-path problem can prevent the remote response.",
      analogy: "It is a recipient in another city: the parcel names them, but the first truck goes to the local depot.",
      technicalDetails: "203.0.113.50 is a documentation address; each routed segment uses its own link-layer addressing.",
      journeyNotes: noteKeys("It is outside the local-server path.", "It is outside the local-server path.", "It receives the PC's routed request and returns a reply.", "It receives the laptop's routed request and returns a reply."),
    },
  ],
});
