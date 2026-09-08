import "server-only";

import { accountSwitchingScenarioInput } from "./switching.account.scenarios";
import { publicSwitchingComparison } from "./switching.data";
import { safeParseSwitchingCatalog } from "./switching.schema";

export function loadAccountSwitchingScenarios() {
  const catalog = safeParseSwitchingCatalog({
    comparison: publicSwitchingComparison,
    scenarios: accountSwitchingScenarioInput,
  });
  return catalog.success ? catalog.data.scenarios : undefined;
}
