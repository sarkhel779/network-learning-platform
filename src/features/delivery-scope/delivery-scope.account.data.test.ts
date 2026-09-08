import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { accountDeliveryScenarios } from "./delivery-scope.account.scenarios";
import { evaluateDelivery } from "./evaluate-delivery";

describe("protected delivery scenarios", () => {
  it("contains the approved seven scenarios in progression order", () => {
    expect(accountDeliveryScenarios.map(({ id }) => id)).toEqual([
      "known-unicast-to-local-server", "unknown-unicast-temporary-flood", "arp-request-local-broadcast",
      "dhcp-relay-boundary", "multicast-known-subscribers", "multicast-without-group-state", "remote-unicast-through-router",
    ]);
    expect(accountDeliveryScenarios.slice(0, 4).every(({ difficulty }) => difficulty === "foundational")).toBe(true);
    expect(accountDeliveryScenarios.find(({ difficulty }) => difficulty === "intermediate")?.id).toBe("multicast-without-group-state");
  });

  it("keeps every authored answer aligned with the evaluator", () => {
    for (const scenario of accountDeliveryScenarios) {
      expect(evaluateDelivery(scenario)).toMatchObject({
        egressPortIds: scenario.expectedEgressPortIds,
        receivingNodeIds: scenario.expectedReceivingNodeIds,
        acceptingNodeIds: scenario.expectedAcceptingNodeIds,
        routerAction: scenario.routerAction,
      });
      expect(scenario.evidenceNotes.length).toBeGreaterThan(0);
      expect(Object.keys(scenario.wrongAnswerExplanations)).toHaveLength(4);
    }
  });
});
