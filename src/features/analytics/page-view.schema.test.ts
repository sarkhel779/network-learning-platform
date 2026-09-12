import { describe, expect, it } from "vitest";

import { parsePageView } from "./page-view.schema";

const eventId = "00000000-0000-4000-8000-000000000201";

describe("page-view input", () => {
  it.each(["/", "/about", "/pricing", "/paths/networking-foundations", "/learn/networking-foundations/dhcp-and-automatic-address-configuration", "/labs"])('accepts a public path %s', (path) => {
    expect(parsePageView({ path, eventId })).toEqual({ path, eventId });
  });

  it.each(["/admin", "/admin/users", "/api/page-view", "/dashboard", "/_next/static/app.js", "/pricing?plan=pro", "https://example.com/", "/a/../admin", "/" + "a".repeat(201)])('rejects a nonpublic path %s', (path) => {
    expect(() => parsePageView({ path, eventId })).toThrow();
  });

  it("rejects an invalid event identifier", () => {
    expect(() => parsePageView({ path: "/", eventId: "retry" })).toThrow();
  });
});
