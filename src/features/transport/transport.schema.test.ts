import { describe, expect, it } from "vitest";

import { parsePortDeliveryScenario, parseTcpScenario } from "./transport.schema";

const tcpStep = {
  id: "send-syn",
  title: "Send SYN",
  explanation: "The client requests a connection.",
  direction: "client-to-server" as const,
  flags: ["SYN"] as const,
  sequenceNumber: 1000,
  acknowledgementNumber: null,
  payloadBytes: 0,
  receiveWindow: 64240,
  clientState: "SYN-SENT" as const,
  serverState: "LISTEN" as const,
  outcome: "Connection requested",
  terminal: false,
};

const tcpScenario = {
  id: "handshake",
  title: "Successful handshake",
  description: "Open a TCP connection.",
  client: { id: "client", label: "Client", ip: "192.0.2.10", port: 49152 },
  server: { id: "server", label: "Server", ip: "198.51.100.20", port: 443 },
  steps: [tcpStep, { ...tcpStep, id: "ready", flags: ["ACK"] as const, acknowledgementNumber: 5001, clientState: "ESTABLISHED" as const, serverState: "ESTABLISHED" as const, terminal: true }],
  conclusion: "Both endpoints established the connection.",
};

const deliveryScenario = {
  id: "tcp-listener",
  title: "TCP listener",
  description: "Deliver to HTTPS.",
  protocol: "TCP" as const,
  sourceIp: "192.0.2.10",
  sourcePort: 49152,
  destinationIp: "198.51.100.20",
  destinationPort: 443,
  headerFields: [{ label: "Flags", value: "SYN" }],
  listener: { protocol: "TCP" as const, port: 443, application: "HTTPS service" },
  outcome: "delivered" as const,
  conclusion: "The TCP tuple matched the listening socket.",
};

describe("transport scenario schemas", () => {
  it("accepts internally consistent TCP and port-delivery scenarios", () => {
    expect(parseTcpScenario(tcpScenario).id).toBe("handshake");
    expect(parsePortDeliveryScenario(deliveryScenario).destinationPort).toBe(443);
  });

  it("rejects duplicate TCP step ids and impossible SYN plus FIN flags", () => {
    expect(() => parseTcpScenario({ ...tcpScenario, steps: [tcpStep, tcpStep] })).toThrow(/unique/i);
    expect(() => parseTcpScenario({ ...tcpScenario, steps: [{ ...tcpStep, flags: ["SYN", "FIN"] }] })).toThrow(/SYN and FIN/i);
  });

  it("requires acknowledgement evidence when ACK is present", () => {
    expect(() => parseTcpScenario({ ...tcpScenario, steps: [{ ...tcpStep, flags: ["ACK"], acknowledgementNumber: null }] })).toThrow(/acknowledgement/i);
  });

  it("rejects invalid ports and delivered outcomes without a listener", () => {
    expect(() => parsePortDeliveryScenario({ ...deliveryScenario, destinationPort: 70000 })).toThrow();
    expect(() => parsePortDeliveryScenario({ ...deliveryScenario, listener: null })).toThrow(/listener/i);
  });

  it("requires no listener for reset and unreachable-or-silent outcomes", () => {
    expect(() => parsePortDeliveryScenario({ ...deliveryScenario, outcome: "reset" })).toThrow(/listener/i);
    expect(() => parsePortDeliveryScenario({ ...deliveryScenario, protocol: "UDP", outcome: "unreachable-or-silent" })).toThrow(/listener/i);
  });
});
