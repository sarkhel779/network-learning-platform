import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { accountSwitchingScenarioInput } from "./switching.account.scenarios";
import { safeParseSwitchingCatalog } from "./switching.schema";
import { publicSwitchingComparison } from "./switching.data";

describe("protected switching scenarios", () => {
  it("provides six progressive, internally valid forwarding decisions", () => {
    const parsed = safeParseSwitchingCatalog({ comparison: publicSwitchingComparison, scenarios: accountSwitchingScenarioInput });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.scenarios.map(({ id, expectedDecision, expectedEgressPortIds }) => ({ id, expectedDecision, expectedEgressPortIds }))).toEqual([
      { id: "first-frame-unknown-destination", expectedDecision: "unknown-unicast-flood", expectedEgressPortIds: ["p2", "p3", "p4"] },
      { id: "reply-after-learning", expectedDecision: "known-unicast", expectedEgressPortIds: ["p1"] },
      { id: "known-unicast", expectedDecision: "known-unicast", expectedEgressPortIds: ["p3"] },
      { id: "same-segment-filtering", expectedDecision: "filter", expectedEgressPortIds: [] },
      { id: "broadcast-frame", expectedDecision: "broadcast-flood", expectedEgressPortIds: ["p1", "p3", "p4"] },
      { id: "aged-out-destination", expectedDecision: "unknown-unicast-flood", expectedEgressPortIds: ["p1", "p2", "p4"] },
    ]);
  });

  it("authors complete learning evidence without a universal aging timer", () => {
    for (const scenario of accountSwitchingScenarioInput) {
      expect(scenario.expectedLearnedEntry).toEqual({ mac: scenario.sourceMac, portId: scenario.ingressPortId });
      expect(scenario.evidenceNotes.length).toBeGreaterThan(0);
      expect(Object.keys(scenario.wrongAnswerExplanations)).toHaveLength(4);
      expect(scenario.explanation).toMatch(/source|learn/i);
    }
    expect(JSON.stringify(accountSwitchingScenarioInput)).not.toMatch(/300 seconds|five minutes/i);
    expect(accountSwitchingScenarioInput[3]).toMatchObject({ id: "same-segment-filtering", difficulty: "intermediate" });
  });
});
