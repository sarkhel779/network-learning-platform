import { describe, expect, it } from "vitest";

import { parseDeliveryCatalog, type DeliveryScenario } from "./delivery-scope.schema";
import { evaluateDelivery, evaluateDeliveryPrediction, safeEvaluateDelivery } from "./evaluate-delivery";

function makeScenario(overrides: Partial<DeliveryScenario> = {}): DeliveryScenario {
  const raw = {
    id: "scenario", difficulty: "foundational", title: "Delivery", deliveryKind: "known-unicast",
    destinationLabel: "Host B", destinationNodeId: "host-b", multicastGroupKnownToSwitch: false,
    ingressPortId: "p1",
    nodes: [
      { id: "host-a", label: "Host A", kind: "host", acceptsUnicast: false, multicastGroups: [] },
      { id: "host-b", label: "Host B", kind: "host", acceptsUnicast: true, multicastGroups: ["239.1.1.1"] },
      { id: "host-c", label: "Host C", kind: "host", acceptsUnicast: false, multicastGroups: [] },
      { id: "router", label: "Router", kind: "router", acceptsUnicast: false, multicastGroups: [] },
    ],
    ports: [
      { id: "p1", label: "Port 1", connectedNodeId: "host-a", eligible: true },
      { id: "p2", label: "Port 2", connectedNodeId: "host-b", eligible: true },
      { id: "p3", label: "Port 3", connectedNodeId: "host-c", eligible: true },
      { id: "p4", label: "Port 4", connectedNodeId: "router", eligible: true },
      { id: "p5", label: "Blocked", connectedNodeId: "host-c", eligible: false },
    ],
    learnedDestinationPortId: "p2", routerAction: "not-in-path",
    expectedEgressPortIds: ["p2"], expectedReceivingNodeIds: ["host-b"], expectedAcceptingNodeIds: ["host-b"],
    explanation: "Computed independently.", evidenceNotes: ["Observe the egress links."],
    wrongAnswerExplanations: { forwarded: "Forwarding differs.", received: "Receipt differs.", accepted: "Acceptance differs.", router: "Router action differs." },
    ...overrides,
  };
  return parseDeliveryCatalog([raw])[0];
}

describe("evaluateDelivery", () => {
  it("forwards known unicast only to the learned destination", () => {
    expect(evaluateDelivery(makeScenario())).toMatchObject({ egressPortIds: ["p2"], receivingNodeIds: ["host-b"], acceptingNodeIds: ["host-b"], routerAction: "not-in-path" });
  });

  it("floods unknown unicast without turning it into broadcast acceptance", () => {
    const input = makeScenario({ deliveryKind: "unknown-unicast", learnedDestinationPortId: undefined, expectedEgressPortIds: ["p2", "p3", "p4"], expectedReceivingNodeIds: ["host-b", "host-c", "router"], expectedAcceptingNodeIds: ["host-b"], routerAction: "route-unicast" });
    expect(evaluateDelivery(input)).toMatchObject({ egressPortIds: ["p2", "p3", "p4"], receivingNodeIds: ["host-b", "host-c", "router"], acceptingNodeIds: ["host-b"] });
  });

  it("floods broadcast locally and stops ordinary onward routing", () => {
    const input = makeScenario({ deliveryKind: "broadcast", destinationNodeId: undefined, learnedDestinationPortId: undefined, destinationLabel: "Local broadcast", expectedEgressPortIds: ["p2", "p3", "p4"], expectedReceivingNodeIds: ["host-b", "host-c", "router"], expectedAcceptingNodeIds: ["host-b", "host-c", "router"], routerAction: "receive-local-only" });
    expect(evaluateDelivery(input)).toMatchObject({ acceptingNodeIds: ["host-b", "host-c", "router"], routerAction: "receive-local-only" });
  });

  it.each([
    [true, ["p2"], ["host-b"]],
    [false, ["p2", "p3", "p4"], ["host-b"]],
  ] as const)("handles multicast switch knowledge=%s", (known, ports, accepters) => {
    const receivers = known ? ["host-b"] : ["host-b", "host-c", "router"];
    const input = makeScenario({ deliveryKind: "multicast", destinationNodeId: undefined, learnedDestinationPortId: undefined, destinationLabel: "239.1.1.1", multicastGroup: "239.1.1.1", multicastGroupKnownToSwitch: known, expectedEgressPortIds: [...ports], expectedReceivingNodeIds: receivers, expectedAcceptingNodeIds: [...accepters], routerAction: known ? "not-in-path" : "multicast-disabled" });
    expect(evaluateDelivery(input)).toMatchObject({ egressPortIds: [...ports], acceptingNodeIds: [...accepters] });
  });

  it("requires exact prediction sets and router action", () => {
    const input = makeScenario();
    expect(evaluateDeliveryPrediction(input, { egressPortIds: ["p2"], receivingNodeIds: ["host-b"], acceptingNodeIds: ["host-b"], routerAction: "not-in-path" }).correct).toBe(true);
    expect(evaluateDeliveryPrediction(input, { egressPortIds: ["p2", "p3"], receivingNodeIds: ["host-b"], acceptingNodeIds: ["host-b"], routerAction: "not-in-path" }).correct).toBe(false);
  });

  it("returns undefined instead of throwing for invalid raw data", () => {
    expect(safeEvaluateDelivery({ deliveryKind: "broadcast" })).toBeUndefined();
  });
});
