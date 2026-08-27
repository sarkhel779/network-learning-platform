const expectedCatalogErrors = new Set(["PATHWAY_NOT_FOUND", "LESSON_NOT_FOUND"]);

export function isExpectedCatalogError(error: unknown): boolean {
  return error instanceof Error && expectedCatalogErrors.has(error.message);
}
