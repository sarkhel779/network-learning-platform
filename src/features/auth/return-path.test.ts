import { describe, expect, it } from "vitest";

import { safeReturnPath } from "./return-path";

describe("safeReturnPath", () => {
  it.each([
    "/",
    "/dashboard",
    "/support",
    "/paths/networking-foundations",
    "/learn/networking-foundations/vlans-access-ports-and-trunks",
  ])("allows the known public destination %s", (path) => {
    expect(safeReturnPath(path)).toBe(path);
  });

  it("allows an exact published lesson quiz anchor after sign-in", () => {
    const path = "/learn/networking-foundations/first-packet-journey-through-a-small-network#knowledge-check-summary";
    expect(safeReturnPath(path)).toBe(path);
  });

  it("returns to an exact locked topic in an ordinary lesson", () => {
    const path = "/learn/networking-foundations/cables-fibre-wireless-and-network-connections#design-a-connection";
    expect(safeReturnPath(path)).toBe(path);
  });

  it.each([
    undefined,
    "",
    "https://attacker.example",
    "//attacker.example",
    "/\\attacker.example",
    "javascript:alert(1)",
    "/learn/networking-foundations/not-a-lesson",
    "/support/1",
    "/learn/networking-foundations/vlans-access-ports-and-trunks#private",
    ["/", "https://attacker.example"],
  ])("falls back to home for an unsafe destination", (path) => {
    expect(safeReturnPath(path)).toBe("/");
  });
});
