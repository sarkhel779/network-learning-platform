import { accountConnectionScenarioInput } from "./connection-media.account.scenarios";
import { publicConnectionMedia } from "./connection-media.data";
import { parseConnectionMediaCatalog, type ConnectionMediaCatalog } from "./connection-media.schema";

// Strict validated exports for data consumers. The account UI uses the authored
// input directly and safely validates it inside its composition boundary.
export const connectionMediaCatalog: ConnectionMediaCatalog = parseConnectionMediaCatalog({
  media: publicConnectionMedia,
  scenarios: accountConnectionScenarioInput,
});

export const accountConnectionScenarios = connectionMediaCatalog.scenarios;
