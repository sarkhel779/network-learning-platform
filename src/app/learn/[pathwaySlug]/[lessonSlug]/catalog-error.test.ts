import { describe, expect, it } from "vitest";

import { isExpectedCatalogError } from "./catalog-error";

describe("isExpectedCatalogError", () => {
  it("recognizes only the catalog not-found errors", () => {
    expect(isExpectedCatalogError(new Error("PATHWAY_NOT_FOUND"))).toBe(true);
    expect(isExpectedCatalogError(new Error("LESSON_NOT_FOUND"))).toBe(true);
  });

  it("does not hide unexpected or malformed failures", () => {
    expect(isExpectedCatalogError(new Error("CATALOG_DATABASE_UNAVAILABLE"))).toBe(false);
    expect(isExpectedCatalogError("LESSON_NOT_FOUND")).toBe(false);
  });
});
