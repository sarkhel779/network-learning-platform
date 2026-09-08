import { describe, expect, it } from "vitest";
import { evaluateRouteDecision } from "./evaluate-route-decision";
import { accountRouteDecisionScenarioInput } from "./route-decision.account.scenarios";
import { safeParseRouteDecisionCatalog } from "./route-decision.schema";

describe("account route-decision data", () => {
  it("provides the seven approved practice categories", () => {
    expect(accountRouteDecisionScenarioInput.map(({ id }) => id)).toEqual([
      "correct-local-delivery", "correct-default-gateway", "missing-default-route", "gateway-not-on-link", "wrong-prefix", "more-specific-route", "router-onward-no-route",
    ]);
    expect(accountRouteDecisionScenarioInput.filter(({ difficulty }) => difficulty === "intermediate").length).toBeGreaterThanOrEqual(2);
  });

  it("is valid and agrees with independently derived outcomes", () => {
    const parsed = safeParseRouteDecisionCatalog(accountRouteDecisionScenarioInput);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    for (const scenario of parsed.data) {
      const outcome = evaluateRouteDecision(scenario);
      expect(outcome.scope).toBe(scenario.expected.scope);
      expect(outcome.boundaryAction).toBe(scenario.expected.boundaryAction);
    }
  });
});
