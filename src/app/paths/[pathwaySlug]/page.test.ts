import { describe, expect, it } from "vitest";

import * as pathwayPage from "./page";

type StaticPathwayPage = {
  dynamicParams?: boolean;
  generateStaticParams?: () => Array<{ pathwaySlug: string }>;
};

const staticPathwayPage = pathwayPage as StaticPathwayPage;

describe("pathway route generation", () => {
  it("emits every validated pathway slug", () => {
    expect(staticPathwayPage.generateStaticParams?.()).toEqual([
      { pathwaySlug: "networking-foundations" },
    ]);
  });

  it("rejects pathway slugs outside the generated catalogue", () => {
    expect(staticPathwayPage.dynamicParams).toBe(false);
  });
});
