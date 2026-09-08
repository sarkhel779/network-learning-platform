import "server-only";
import { accountDeliveryScenarios } from "./delivery-scope.account.scenarios";
import { parseDeliveryCatalog, type DeliveryScenario } from "./delivery-scope.schema";

export function loadAccountDeliveryScenarios(): DeliveryScenario[] {
  try {
    return parseDeliveryCatalog(accountDeliveryScenarios);
  } catch (error) {
    throw new Error("DELIVERY_SCOPE_AUTHORING_ERROR: protected scenarios are invalid", { cause: error });
  }
}
