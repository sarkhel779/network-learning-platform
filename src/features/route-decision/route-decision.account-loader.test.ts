import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { loadAccountRouteDecisionScenarios } from "./route-decision.account-loader";

describe("account route-decision loader", () => {
  it("loads seven validated scenarios on the server", () => {
    expect(loadAccountRouteDecisionScenarios()).toHaveLength(7);
  });

  it("wraps malformed authored content with a stable error", () => {
    expect(() => loadAccountRouteDecisionScenarios([{ id: "broken" }])).toThrow("ROUTE_DECISION_AUTHORING_ERROR");
  });

  it("retains the server-only module guard", () => {
    expect(readFileSync(resolve("src/features/route-decision/route-decision.account-loader.ts"), "utf8").trimStart()).toMatch(/^import "server-only";/);
  });
});
