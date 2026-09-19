import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ loadContentOverridesSnapshot: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/features/catalog/content-publication.repository", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/catalog/content-publication.repository")>()),
  loadContentOverridesSnapshot: mocks.loadContentOverridesSnapshot,
}));

import * as pathwayPage from "./page";

type StaticPathwayPage = {
  dynamicParams?: boolean;
  generateStaticParams?: () => Array<{ pathwaySlug: string }>;
};

const staticPathwayPage = pathwayPage as StaticPathwayPage;

beforeEach(() => {
  mocks.loadContentOverridesSnapshot.mockReset();
  mocks.loadContentOverridesSnapshot.mockResolvedValue({ publications: {}, orders: {} });
});

describe("pathway route generation", () => {
  it("emits every validated pathway slug", () => {
    expect(staticPathwayPage.generateStaticParams?.()).toEqual([
      { pathwaySlug: "networking-foundations" },
      { pathwaySlug: "routing-protocols" },
    ]);
  });

  it("renders unpublished catalogue slugs on demand instead of 404ing so publish toggles take effect live", () => {
    expect(staticPathwayPage.dynamicParams).toBe(true);
  });
});
