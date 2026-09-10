import { describe, expect, it } from "vitest";
import { parseIcmpEvidence, parsePingScenario } from "./icmp.schema";

const devices = [
  { id: "source", label: "Source", role: "workstation", x: 50, y: 100 },
  { id: "router", label: "Router", role: "gateway", x: 350, y: 100 },
  { id: "destination", label: "Destination", role: "server", x: 650, y: 100 },
];
const links = [
  { id: "source-router", from: "source", to: "router" },
  { id: "router-destination", from: "router", to: "destination" },
];

function scenario(response: unknown, outcome = "success") {
  return { id: "test", title: "Test", description: "Evidence", outcome, sourceId: "source",
    destinationId: "destination", requestTtl: 64, devices, links, response,
    conclusion: "A cautious conclusion." };
}

describe("parsePingScenario", () => {
  it.each([
    ["echo-request", 8, 0], ["echo-reply", 0, 0],
    ["destination-unreachable", 3, 0], ["destination-unreachable", 3, 1],
    ["destination-unreachable", 3, 13], ["time-exceeded", 11, 0],
  ])("accepts %s type %i code %i", (kind, type, code) => {
    const reporterId = kind === "echo-reply" ? "destination" : "router";
    const parsed = parseIcmpEvidence({ kind, type, code, reporterId,
      quotedPacket: kind === "destination-unreachable" || kind === "time-exceeded"
        ? { sourceIp: "192.0.2.10", destinationIp: "198.51.100.20", protocol: "ICMP" }
        : undefined });
    expect(parsed.type).toBe(type);
  });

  it("rejects impossible type/code and outcome combinations", () => {
    expect(() => parsePingScenario(scenario({ kind: "echo-reply", type: 0, code: 1, reporterId: "destination" }))).toThrow();
    expect(() => parsePingScenario(scenario({ kind: "time-exceeded", type: 11, code: 0, reporterId: "router" }, "success"))).toThrow();
  });

  it("rejects missing error correlation evidence and unknown topology references", () => {
    expect(() => parsePingScenario(scenario({ kind: "destination-unreachable", type: 3, code: 1, reporterId: "router" }, "host-unreachable"))).toThrow();
    expect(() => parsePingScenario({ ...scenario(null, "timeout"), sourceId: "missing" })).toThrow();
  });

  it("requires timeout to contain no response packet", () => {
    expect(parsePingScenario(scenario(null, "timeout")).response).toBeNull();
    expect(() => parsePingScenario(scenario({ kind: "echo-reply", type: 0, code: 0, reporterId: "destination" }, "timeout"))).toThrow();
  });
});
