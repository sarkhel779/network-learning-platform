import { parseDhcpScenario, type DhcpPacket, type DhcpScenario, type DhcpStep } from "./dhcp.schema";

const CLIENT_MAC = "02:00:00:00:00:10";
const RELAY_CLIENT_MAC = "02:00:00:00:01:01";
const RELAY_SERVER_MAC = "02:00:00:00:02:01";
const SERVER_MAC = "02:00:00:00:00:20";
const GIADDR = "192.0.2.1";
const SERVER_IP = "198.51.100.20";
const OFFERED_IP = "192.0.2.10";
const XID = "0x6d5a2b11";

const option = (code: number, name: string, value: string, meaning: string, length = 1) => ({ code, name, length, value, meaning });
const messageOption = (messageType: DhcpPacket["messageType"]) => option(53, "DHCP Message Type", messageType, `Identifies this message as ${messageType}.`);
const relayOption = () => option(82, "Relay Agent Information", "Circuit-ID=access-7; Remote-ID=edge-a", "Adds trusted access-circuit identity.", 35);

function localClientPacket(messageType: "DISCOVER" | "REQUEST"): DhcpPacket {
  return {
    messageType, leg: "client-to-server", deliveryMode: "broadcast",
    ethernet: { source: CLIENT_MAC, destination: "ff:ff:ff:ff:ff:ff" },
    ipv4: { source: "0.0.0.0", destination: "255.255.255.255" },
    udp: { sourcePort: 68, destinationPort: 67 },
    bootp: { op: 1, htype: 1, hlen: 6, hops: 0, xid: XID, secs: 0, flags: 0x8000, ciaddr: "0.0.0.0", yiaddr: "0.0.0.0", siaddr: "0.0.0.0", giaddr: "0.0.0.0", chaddr: CLIENT_MAC, sname: "", file: "", magicCookie: "63:82:53:63" },
    options: messageType === "REQUEST"
      ? [messageOption(messageType), option(50, "Requested IP Address", OFFERED_IP, "Names the selected address.", 4), option(54, "Server Identifier", SERVER_IP, "Names the selected server.", 4)]
      : [messageOption(messageType), option(55, "Parameter Request List", "1,3,6,51,58,59", "Requests core configuration.", 6)],
  };
}

function forwardedRequest(messageType: "DISCOVER" | "REQUEST"): DhcpPacket {
  const original = localClientPacket(messageType);
  return { ...original, leg: "relay-to-server", deliveryMode: "relay-forwarded", ethernet: { source: RELAY_SERVER_MAC, destination: SERVER_MAC }, ipv4: { source: "198.51.100.1", destination: SERVER_IP }, udp: { sourcePort: 67, destinationPort: 67 }, bootp: { ...original.bootp, hops: 1, giaddr: GIADDR }, options: [...original.options, relayOption()] };
}

function serverReply(messageType: "OFFER" | "ACK"): DhcpPacket {
  return {
    messageType, leg: "server-to-relay", deliveryMode: "relay-forwarded",
    ethernet: { source: SERVER_MAC, destination: RELAY_SERVER_MAC }, ipv4: { source: SERVER_IP, destination: GIADDR },
    udp: { sourcePort: 67, destinationPort: 67 },
    bootp: { op: 2, htype: 1, hlen: 6, hops: 1, xid: XID, secs: 0, flags: 0x8000, ciaddr: "0.0.0.0", yiaddr: OFFERED_IP, siaddr: "0.0.0.0", giaddr: GIADDR, chaddr: CLIENT_MAC, sname: "", file: "", magicCookie: "63:82:53:63" },
    options: [messageOption(messageType), option(54, "Server Identifier", SERVER_IP, "Identifies the remote server.", 4), ...(messageType === "ACK" ? [option(1, "Subnet Mask", "255.255.255.0", "Matches the giaddr-selected pool.", 4), option(3, "Router", GIADDR, "Supplies the client gateway.", 4), option(51, "IP Address Lease Time", "3600", "Sets lease expiry.", 4)] : []), relayOption()],
  };
}

function localReply(messageType: "OFFER" | "ACK"): DhcpPacket {
  const upstream = serverReply(messageType);
  return { ...upstream, leg: "server-to-client", deliveryMode: "broadcast", ethernet: { source: RELAY_CLIENT_MAC, destination: "ff:ff:ff:ff:ff:ff" }, ipv4: { source: GIADDR, destination: "255.255.255.255" }, udp: { sourcePort: 67, destinationPort: 68 }, options: upstream.options.filter(({ code }) => code !== 82) };
}

function step(id: string, title: string, packet: DhcpPacket, terminal = false, explanation = `${title} crosses the active DHCP path.`): DhcpStep {
  return { id, title, packet, terminal, explanation, clientState: messageState(packet.messageType), serverState: terminal ? "LEASED" : "PROCESSING", evidence: `${packet.udp.sourcePort} → ${packet.udp.destinationPort}; giaddr ${packet.bootp.giaddr}.` };
}

function messageState(messageType: DhcpPacket["messageType"]) {
  if (messageType === "DISCOVER" || messageType === "OFFER") return "SELECTING";
  if (messageType === "REQUEST") return "REQUESTING";
  return "BOUND";
}

const remoteAllocation = parseDhcpScenario({
  id: "remote-allocation", title: "Remote server through a relay", description: "Trace both DORA round trips through an IP helper.", mode: "relay",
  steps: [
    step("discover-local", "Client broadcasts Discover", localClientPacket("DISCOVER")),
    step("discover-forwarded", "Relay forwards Discover", forwardedRequest("DISCOVER")),
    step("offer-to-relay", "Server returns Offer", serverReply("OFFER")),
    step("offer-to-client", "Relay delivers Offer", localReply("OFFER")),
    step("request-local", "Client broadcasts Request", localClientPacket("REQUEST")),
    step("request-forwarded", "Relay forwards Request", forwardedRequest("REQUEST")),
    { ...step("ack-to-relay", "Server returns ACK", serverReply("ACK")), evidence: "giaddr 192.0.2.1 selects the 192.0.2.0/24 pool." },
    step("ack-to-client", "Relay delivers ACK", localReply("ACK"), true),
  ], conclusion: "The relay connects broadcast-bound clients to a routed DHCP server without forwarding the original broadcast unchanged.",
});

const firstDiscover = () => step("discover-local", "Client broadcasts Discover", localClientPacket("DISCOVER"));
const missingHelper = parseDhcpScenario({ id: "missing-helper", title: "Missing helper address", description: "The router receives the broadcast but has no relay target.", mode: "relay", steps: [{ ...firstDiscover(), terminal: true, explanation: "No helper address is configured, so the router does not create an upstream 67 → 67 packet." }], conclusion: "The capture ends in the client broadcast domain." });
const wrongScope = parseDhcpScenario({ id: "wrong-scope", title: "No matching remote scope", description: "The relay works but the server cannot match giaddr to an address pool.", mode: "relay", steps: [firstDiscover(), { ...step("forwarded-no-scope", "Server inspects giaddr", forwardedRequest("DISCOVER"), true), explanation: "The server has no scope for giaddr 192.0.2.1." }], conclusion: "Relay reachability succeeds, but pool selection fails." });
const blockedUpstream = parseDhcpScenario({ id: "blocked-upstream", title: "UDP 67 blocked upstream", description: "The relay creates the packet but policy drops it.", mode: "relay", steps: [firstDiscover(), { ...step("forwarded-blocked", "Forwarded Discover is blocked", { ...forwardedRequest("DISCOVER"), deliveryMode: "silence" }, true), explanation: "No server reply is observed after the relay sends UDP 67 → 67." }], conclusion: "Inspect relay counters, policy, routing, and the return path." });

export const relayScenarios = [remoteAllocation, missingHelper, wrongScope, blockedUpstream] as const;

export function buildRelayJourney(scenario: DhcpScenario): readonly DhcpStep[] {
  if (scenario.mode !== "relay") throw new Error("A relay journey requires a relay scenario.");
  return parseDhcpScenario(scenario).steps;
}
