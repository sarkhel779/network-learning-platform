import { describe, expect, it } from "vitest";

import { parseDhcpScenario, parseLeaseTimeline, parseRfcCheck } from "./dhcp.schema";

const packet = {
  messageType: "DISCOVER",
  leg: "client-to-server",
  deliveryMode: "broadcast",
  ethernet: { source: "02:00:00:00:00:10", destination: "ff:ff:ff:ff:ff:ff" },
  ipv4: { source: "0.0.0.0", destination: "255.255.255.255" },
  udp: { sourcePort: 68, destinationPort: 67 },
  bootp: {
    op: 1, htype: 1, hlen: 6, hops: 0, xid: "0x3903f326", secs: 0, flags: 0x8000,
    ciaddr: "0.0.0.0", yiaddr: "0.0.0.0", siaddr: "0.0.0.0", giaddr: "0.0.0.0",
    chaddr: "02:00:00:00:00:10", sname: "", file: "", magicCookie: "63:82:53:63",
  },
  options: [{ code: 53, name: "DHCP Message Type", length: 1, value: "1", meaning: "Discover" }],
};

const validDirect = {
  id: "initial-allocation", title: "Initial allocation", description: "Acquire a lease.", mode: "direct",
  steps: [
    { id: "discover", title: "DHCPDISCOVER", explanation: "Client discovers servers.", evidence: "Broadcast", clientState: "SELECTING", serverState: "LISTENING", packet, terminal: false },
    { id: "ack", title: "DHCPACK", explanation: "Server confirms lease.", evidence: "Address assigned", clientState: "BOUND", serverState: "LEASED", packet: { ...packet, messageType: "ACK", leg: "server-to-client", udp: { sourcePort: 67, destinationPort: 68 }, bootp: { ...packet.bootp, op: 2, yiaddr: "192.0.2.10" } }, terminal: true },
  ],
  conclusion: "The client is bound.",
};

describe("DHCP scenario contracts", () => {
  it("accepts a consistent direct exchange", () => {
    expect(parseDhcpScenario(validDirect).steps[0].packet.udp).toEqual({ sourcePort: 68, destinationPort: 67 });
  });

  it("rejects duplicate steps and mismatched transaction ids", () => {
    expect(() => parseDhcpScenario({ ...validDirect, steps: [validDirect.steps[0], validDirect.steps[0]] })).toThrow(/unique/i);
    const differentXid = { ...validDirect.steps[1], packet: { ...validDirect.steps[1].packet, bootp: { ...validDirect.steps[1].packet.bootp, xid: "0x11111111" } } };
    expect(() => parseDhcpScenario({ ...validDirect, steps: [validDirect.steps[0], differentXid] })).toThrow(/transaction/i);
  });

  it("rejects invalid ports, direct leg directions, and relays without giaddr", () => {
    const invalidPort = { ...validDirect.steps[0], packet: { ...packet, udp: { sourcePort: 67, destinationPort: 67 } } };
    expect(() => parseDhcpScenario({ ...validDirect, steps: [invalidPort] })).toThrow(/68.*67/i);
    const relayPacket = { ...packet, leg: "relay-to-server", deliveryMode: "relay-forwarded", udp: { sourcePort: 67, destinationPort: 67 } };
    expect(() => parseDhcpScenario({ ...validDirect, mode: "relay", steps: [{ ...validDirect.steps[0], packet: relayPacket, terminal: true }] })).toThrow(/giaddr/i);
  });

  it("rejects ACK without yiaddr during initial allocation", () => {
    const ack = { ...validDirect.steps[1], packet: { ...validDirect.steps[1].packet, bootp: { ...validDirect.steps[1].packet.bootp, yiaddr: "0.0.0.0" } } };
    expect(() => parseDhcpScenario({ ...validDirect, steps: [validDirect.steps[0], ack] })).toThrow(/yiaddr/i);
  });

  it("validates lease timers and RFC references", () => {
    expect(() => parseLeaseTimeline({ id: "bad", title: "Bad", leaseSeconds: 3600, t1Seconds: 3000, t2Seconds: 2000, events: [{ id: "start", seconds: 0, state: "BOUND", deliveryMode: "unicast", leaseValid: true, explanation: "Starts" }] })).toThrow(/T1/i);
    expect(() => parseRfcCheck({ id: "bad", question: "Valid?", options: ["Yes", "No"], correctIndex: 0, rule: "Rule", evidence: "Evidence", consequence: "Consequence", referenceLabel: "RFC 2131", referenceUrl: "https://example.com" })).toThrow(/rfc-editor/i);
  });
});
