import { describe, expect, it } from "vitest";

import {
  parsePacketFlowScenario,
  safeParsePacketFlowScenario,
  type PacketFlowScenario,
} from "./packet-flow.schema";

const validScenario = {
  id: "scenario_intro",
  title: "A packet crosses the network",
  description: "Follow a packet between two devices.",
  defaultSpeed: 1,
  devices: [
    { id: "client", label: "Client", role: "host", x: 0, y: 0 },
    { id: "router", label: "Router", role: "router", x: 100, y: 0 },
  ],
  links: [{ id: "client-router", from: "client", to: "router" }],
  steps: [
    {
      id: "send-frame",
      title: "Send the frame",
      explanation: "The client sends a frame to the router.",
      durationMs: 500,
      activeDeviceIds: ["client", "router"],
      activeLinkIds: ["client-router"],
      packet: { kind: "frame" as const, label: "Frame", from: "client", to: "router" },
      summaryFields: [{ label: "Source", value: "Client" }],
      detailFields: [{ label: "Destination", value: "Router", changed: true }],
      stateNote: "The link is active.",
    },
  ],
} satisfies PacketFlowScenario;

describe("packet flow scenario schema", () => {
  it("accepts a valid scenario and exposes a strict parser", () => {
    const parsed = parsePacketFlowScenario(validScenario);

    expect(parsed).toEqual(validScenario);
    expect(safeParsePacketFlowScenario(validScenario)).toEqual({ success: true, data: validScenario });
  });

  it.each([
    ["Duplicate device ID", { devices: [{ ...validScenario.devices[0] }, { ...validScenario.devices[1], id: "client" }] }],
    ["Duplicate link ID", { links: [{ ...validScenario.links[0] }, { ...validScenario.links[0] }] }],
    ["Duplicate step ID", { steps: [{ ...validScenario.steps[0] }, { ...validScenario.steps[0] }] }],
    ["Unknown link endpoint", { links: [{ ...validScenario.links[0], to: "missing" }] }],
    ["Unknown active device", { steps: [{ ...validScenario.steps[0], activeDeviceIds: ["missing"] }] }],
    ["Unknown active link", { steps: [{ ...validScenario.steps[0], activeLinkIds: ["missing"] }] }],
    ["Packet path inconsistent with active link endpoints", { steps: [{ ...validScenario.steps[0], packet: { ...validScenario.steps[0].packet!, from: "router", to: "client" }, activeLinkIds: [] }] }],
    ["Empty steps", { steps: [] }],
    ["durationMs: 0", { steps: [{ ...validScenario.steps[0], durationMs: 0 }] }],
    ["defaultSpeed: 3", { defaultSpeed: 3 }],
  ] as const)("rejects %s", (_name, override) => {
    const invalid = { ...validScenario, ...override };

    expect(() => parsePacketFlowScenario(invalid)).toThrow();
    expect(safeParsePacketFlowScenario(invalid).success).toBe(false);
  });
});
