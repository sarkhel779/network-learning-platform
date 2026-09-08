import "server-only";
import { accountRouteDecisionScenarioInput } from "./route-decision.account.scenarios";
import { parseRouteDecisionCatalog } from "./route-decision.schema";

export function loadAccountRouteDecisionScenarios(input: unknown = accountRouteDecisionScenarioInput) {
  try {
    return parseRouteDecisionCatalog(input);
  } catch (cause) {
    throw new Error("ROUTE_DECISION_AUTHORING_ERROR: protected route-decision scenarios are invalid", { cause });
  }
}
