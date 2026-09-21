import type { ViewerAccess } from "./lesson-content.types";

/**
 * Pro content is unlocked for every visitor until a real payment gateway is
 * integrated (the admin billing panel's manual "Grant Pro access" tool
 * covers comps/offline payment in the meantime). This flag stays off under
 * NODE_ENV=test (unit tests and the Playwright e2e suite, which sets
 * NODE_ENV=test on its dev server per playwright.config.ts) so the
 * underlying access-tier gating keeps being exercised and works correctly
 * once this flag is removed.
 */
export const PRO_UNLOCKED_FOR_EVERYONE = process.env.NODE_ENV !== "test";

export function resolveViewerAccess(hasViewer: boolean, auditMode: boolean): ViewerAccess {
  if (PRO_UNLOCKED_FOR_EVERYONE) return "pro";
  return auditMode ? "pro" : hasViewer ? "account" : "anonymous";
}
