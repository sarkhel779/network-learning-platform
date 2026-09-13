import { describe, expect, it } from "vitest";

import { safeReturnPath } from "./return-path";

describe("safeReturnPath", () => {
  it.each([
    "/",
    "/dashboard",
    "/paths/networking-foundations",
    "/learn/networking-foundations/vlans-access-ports-and-trunks",
  ])("allows the known public destination %s", (path) => {
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
    "/learn/networking-foundations/vlans-access-ports-and-trunks#private",
    ["/", "https://attacker.example"],
  ])("falls back to home for an unsafe destination", (path) => {
    expect(safeReturnPath(path)).toBe("/");
  });
});
