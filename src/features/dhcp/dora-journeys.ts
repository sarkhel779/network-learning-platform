import { parseDhcpScenario, type DhcpPacket, type DhcpScenario, type DhcpStep } from "./dhcp.schema";

const CLIENT_MAC = "02:00:00:00:00:10";
const SERVER_MAC = "02:00:00:00:00:01";
const SERVER_IP = "192.0.2.1";
const OFFERED_IP = "192.0.2.10";
const XID = "0x3903f326";

const option = (code: number, name: string, value: string, meaning: string, length = 1) => ({ code, name, length, value, meaning });

function packet(messageType: DhcpPacket["messageType"], overrides: Partial<DhcpPacket> = {}): DhcpPacket {
  const fromClient = ["DISCOVER", "REQUEST", "DECLINE", "RELEASE"].includes(messageType);
  return {
    messageType,
    leg: fromClient ? "client-to-server" : "server-to-client",
    deliveryMode: fromClient ? "broadcast" : "unicast",
    ethernet: { source: fromClient ? CLIENT_MAC : SERVER_MAC, destination: fromClient ? "ff:ff:ff:ff:ff:ff" : CLIENT_MAC },
    ipv4: { source: fromClient ? "0.0.0.0" : SERVER_IP, destination: fromClient ? "255.255.255.255" : OFFERED_IP },
    udp: { sourcePort: fromClient ? 68 : 67, destinationPort: fromClient ? 67 : 68 },
    bootp: {
      op: fromClient ? 1 : 2, htype: 1, hlen: 6, hops: 0, xid: XID, secs: 0,
      flags: fromClient ? 0x8000 : 0, ciaddr: "0.0.0.0",
      yiaddr: messageType === "OFFER" || messageType === "ACK" ? OFFERED_IP : "0.0.0.0",
      siaddr: "0.0.0.0", giaddr: "0.0.0.0", chaddr: CLIENT_MAC, sname: "", file: "", magicCookie: "63:82:53:63",
    },
    options: [option(53, "DHCP Message Type", messageType, `Identifies this message as ${messageType}.`)],
    ...overrides,
  };
}

function step(id: string, title: string, packetValue: DhcpPacket, clientState: string, serverState: string, terminal = false): DhcpStep {
  return { id, title, packet: packetValue, clientState, serverState, terminal, explanation: `${title} advances the address-allocation exchange.`, evidence: `${packetValue.udp.sourcePort} → ${packetValue.udp.destinationPort}; ${packetValue.deliveryMode}.` };
}

const discover = () => step("discover", "DHCPDISCOVER", packet("DISCOVER", {
  options: [
    option(53, "DHCP Message Type", "DISCOVER", "The client is looking for DHCP servers."),
    option(61, "Client Identifier", CLIENT_MAC, "Keeps the client identity stable.", 7),
    option(55, "Parameter Request List", "1,3,6,51,58,59", "Requests mask, router, DNS, and lease timers.", 6),
  ],
}), "SELECTING", "LISTENING");

const offer = (id = "offer", serverIp = SERVER_IP) => step(id, "DHCPOFFER", packet("OFFER", {
  ipv4: { source: serverIp, destination: OFFERED_IP },
  options: [
    option(53, "DHCP Message Type", "OFFER", "The server proposes a lease."),
    option(54, "Server Identifier", serverIp, "Identifies the offering server.", 4),
    option(51, "IP Address Lease Time", "3600", "Offers a one-hour lease.", 4),
  ],
}), "SELECTING", "OFFERED");

const request = () => step("request", "DHCPREQUEST", packet("REQUEST", {
  options: [
    option(53, "DHCP Message Type", "REQUEST", "The client selects an offer."),
    option(50, "Requested IP Address", OFFERED_IP, "Names the selected address.", 4),
    option(54, "Server Identifier", SERVER_IP, "Names the selected server.", 4),
  ],
}), "REQUESTING", "COMMITTING");

const ack = () => step("ack", "DHCPACK", packet("ACK", {
  options: [
    option(53, "DHCP Message Type", "ACK", "The server confirms the lease."),
    option(1, "Subnet Mask", "255.255.255.0", "Defines the on-link prefix.", 4),
    option(3, "Router", SERVER_IP, "Supplies the default gateway.", 4),
    option(6, "Domain Name Server", "192.0.2.53", "Supplies the DNS resolver.", 4),
    option(51, "IP Address Lease Time", "3600", "Sets lease expiry.", 4),
    option(58, "Renewal Time Value", "1800", "Sets T1 renewal.", 4),
    option(59, "Rebinding Time Value", "3150", "Sets T2 rebinding.", 4),
  ],
}), "BOUND", "LEASED", true);

const initial = parseDhcpScenario({ id: "initial-allocation", title: "Initial address allocation", description: "Trace a successful DORA exchange.", mode: "direct", steps: [discover(), offer(), request(), ack()], conclusion: "The client may use 192.0.2.10 for the confirmed lease." });
const multiple = parseDhcpScenario({ id: "multiple-offers", title: "Multiple server offers", description: "See how a broadcast Request identifies the selected offer.", mode: "direct", steps: [discover(), offer("offer-a"), offer("offer-b", "192.0.2.2"), request(), ack()], conclusion: "The Request tells every offering server which offer won." });
const nak = parseDhcpScenario({ id: "request-nak", title: "Requested address rejected", description: "The server rejects an unusable requested address.", mode: "direct", steps: [discover(), offer(), request(), step("nak", "DHCPNAK", packet("NAK", { deliveryMode: "broadcast", ethernet: { source: SERVER_MAC, destination: "ff:ff:ff:ff:ff:ff" }, ipv4: { source: SERVER_IP, destination: "255.255.255.255" } }), "INIT", "LISTENING", true)], conclusion: "The client returns to INIT and must start allocation again." });
const silence = parseDhcpScenario({ id: "server-silence", title: "No server offer", description: "A Discover receives no observed reply.", mode: "direct", steps: [{ ...discover(), id: "discover-timeout", packet: { ...discover().packet, deliveryMode: "silence" }, terminal: true, explanation: "The Discover is sent, but no Offer is observed.", evidence: "Only outbound UDP 68 → 67 traffic is captured." }], conclusion: "Silence does not identify whether the server, path, policy, or pool caused the failure." });

export const doraScenarios = [initial, multiple, nak, silence] as const;

export function buildDoraJourney(scenario: DhcpScenario): readonly DhcpStep[] {
  if (scenario.mode !== "direct") throw new Error("A direct DORA journey requires a direct scenario.");
  return parseDhcpScenario(scenario).steps;
}
