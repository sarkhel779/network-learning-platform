import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { loadAccountDeliveryScenarios } from "./delivery-scope.account-loader";

describe("account delivery loader", () => {
  it("returns seven independently validated protected scenarios", () => {
    const scenarios = loadAccountDeliveryScenarios();
    expect(scenarios).toHaveLength(7);
    expect(scenarios[0].id).toBe("known-unicast-to-local-server");
  });
});
