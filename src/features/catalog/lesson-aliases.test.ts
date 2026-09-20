import { describe, expect, it } from "vitest";

import { resolveLessonAlias } from "./lesson-aliases";

describe("resolveLessonAlias", () => {
  it("redirects the retired combined device lesson to Hubs", () => {
    expect(resolveLessonAlias("networking-foundations", "hubs-bridges-and-switches")).toBe("hubs");
  });

  it("does not redirect current or relocated lessons", () => {
    expect(resolveLessonAlias("networking-foundations", "hosts-and-network-devices")).toBeUndefined();
    expect(resolveLessonAlias("networking-foundations", "cables-fibre-wireless-and-network-connections")).toBeUndefined();
    expect(resolveLessonAlias("networking-foundations", "first-packet-journey-through-a-small-network")).toBeUndefined();
  });
});
