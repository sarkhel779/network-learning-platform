import { accountConnectionScenarioInput } from "./connection-media.account.scenarios";
import { publicConnectionMedia } from "./connection-media.data";
import { parseConnectionMediaCatalog, type ConnectionMediaCatalog } from "./connection-media.schema";

// Strict validated exports for data consumers. The account MDX uses the safe
// server loader, then passes its result explicitly to the client composition.
export const connectionMediaCatalog: ConnectionMediaCatalog = parseConnectionMediaCatalog({
  media: publicConnectionMedia,
  scenarios: accountConnectionScenarioInput,
});

export const accountConnectionScenarios = connectionMediaCatalog.scenarios;
