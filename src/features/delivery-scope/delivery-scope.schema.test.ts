import { describe, expect, it } from "vitest";

import { parseDeliveryCatalog, safeParseDeliveryCatalog } from "./delivery-scope.schema";

function scenario(overrides: Record<string, unknown> = {}) {
  return {
    id: "known-unicast-demo", difficulty: "foundational", title: "Known unicast",
    deliveryKind: "known-unicast", destinationLabel: "Host B", destinationNodeId: "host-b",
    multicastGroupKnownToSwitch: false, ingressPortId: "p1",
    nodes: [
      { id: "host-a", label: "Host A", kind: "host", acceptsUnicast: false, multicastGroups: [] },
      { id: "host-b", label: "Host B", kind: "host", acceptsUnicast: true, multicastGroups: [] },
      { id: "router", label: "Router", kind: "router", acceptsUnicast: false, multicastGroups: [] },
    ],
    ports: [
      { id: "p1", label: "Port 1", connectedNodeId: "host-a", eligible: true },
      { id: "p2", label: "Port 2", connectedNodeId: "host-b", eligible: true },
      { id: "p3", label: "Port 3", connectedNodeId: "router", eligible: true },
    ],
    learnedDestinationPortId: "p2", routerAction: "not-in-path",
    expectedEgressPortIds: ["p2"], expectedReceivingNodeIds: ["host-b"], expectedAcceptingNodeIds: ["host-b"],
    explanation: "The switch knows the destination port.", evidenceNotes: ["Only port 2 carries the frame."],
    wrongAnswerExplanations: { forwarded: "Check forwarding.", received: "Trace interfaces.", accepted: "Check identity.", router: "Check the boundary." },
    ...overrides,
  };
}

describe("delivery scope schema", () => {
  it("parses a valid catalog", () => expect(parseDeliveryCatalog([scenario()])).toHaveLength(1));

  it.each([
    ["duplicate node IDs", { nodes: [
      { id: "host-a", label: "Host A", kind: "host", acceptsUnicast: false, multicastGroups: [] },
      { id: "host-a", label: "Host B", kind: "host", acceptsUnicast: true, multicastGroups: [] },
    ] }],
    ["unknown connected nodes", { ports: [{ id: "p1", label: "Port 1", connectedNodeId: "missing", eligible: true }] }],
    ["missing ingress ports", { ingressPortId: "missing" }],
    ["ineligible expected ports", { ports: [
      { id: "p1", label: "Port 1", connectedNodeId: "host-a", eligible: true },
      { id: "p2", label: "Port 2", connectedNodeId: "host-b", eligible: false },
      { id: "p3", label: "Port 3", connectedNodeId: "router", eligible: true },
    ] }],
    ["known unicast without a learned port", { learnedDestinationPortId: undefined }],
    ["known unicast learned on ingress", { learnedDestinationPortId: "p1", expectedEgressPortIds: [], expectedReceivingNodeIds: [], expectedAcceptingNodeIds: [] }],
    ["known unicast learned toward another node", { learnedDestinationPortId: "p3", expectedEgressPortIds: ["p3"], expectedReceivingNodeIds: ["router"], expectedAcceptingNodeIds: [] , routerAction: "receive-local-only"}],
    ["broadcast with a learned unicast port", { deliveryKind: "broadcast", destinationNodeId: undefined }],
    ["multicast without a group", { deliveryKind: "multicast", destinationNodeId: undefined, learnedDestinationPortId: undefined }],
    ["receivers inconsistent with egress ports", { expectedReceivingNodeIds: ["router"] }],
    ["accepting nodes that did not receive", { expectedAcceptingNodeIds: ["router"] }],
  ])("rejects %s", (_label, overrides) => {
    expect(safeParseDeliveryCatalog([scenario(overrides)])).toBeUndefined();
  });

  it("rejects unicast without a destination", () => {
    expect(safeParseDeliveryCatalog([scenario({ destinationNodeId: undefined })])).toBeUndefined();
  });

  it("requires receive-local-only routers to receive the frame", () => {
    expect(safeParseDeliveryCatalog([scenario({ routerAction: "receive-local-only" })])).toBeUndefined();
  });

  it("rejects routing merely because a router receives a flooded unknown unicast", () => {
    expect(safeParseDeliveryCatalog([scenario({ deliveryKind: "unknown-unicast", learnedDestinationPortId: undefined, expectedEgressPortIds: ["p2", "p3"], expectedReceivingNodeIds: ["host-b", "router"], routerAction: "route-unicast" })])).toBeUndefined();
  });
});
