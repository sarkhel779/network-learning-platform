import "server-only";

import { accountConnectionScenarioInput } from "./connection-media.account.scenarios";
import { publicConnectionMedia } from "./connection-media.data";
import { safeParseConnectionMediaCatalog } from "./connection-media.schema";

// Called only by authorized server content. Invalid authored data reaches the
// client as unavailable, without throwing while the account module is imported.
export function loadAccountConnectionScenarios() {
  const catalog = safeParseConnectionMediaCatalog({
    media: publicConnectionMedia,
    scenarios: accountConnectionScenarioInput,
  });
  return catalog.success ? catalog.data.scenarios : undefined;
}
