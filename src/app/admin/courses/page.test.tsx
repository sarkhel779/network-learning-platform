import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn(), loadContentOverridesSnapshot: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/features/catalog/content-publication.repository", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/catalog/content-publication.repository")>()),
  loadContentOverridesSnapshot: mocks.loadContentOverridesSnapshot,
}));

import CoursesPage from "./page";

describe("admin courses page", () => {
  it("shows the real catalog and publication controls for an authorized viewer", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "super_admin" });
    mocks.loadContentOverridesSnapshot.mockResolvedValue({ publications: {}, orders: {} });
    const html = renderToStaticMarkup(await CoursesPage());
    expect(mocks.requireStaff).toHaveBeenCalledWith("courses");
    expect(html).toContain("Courses and labs");
    expect(html).toContain("Introduction to Computer Networks and Network Devices");
    expect(html).toContain("Published");
    expect(html).not.toContain("not connected yet");
  });

  it("reflects a live database override in the rendered publication state", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "super_admin" });
    mocks.loadContentOverridesSnapshot.mockResolvedValue({
      publications: { lesson_how_networks_communicate: false },
      orders: {},
    });
    const html = renderToStaticMarkup(await CoursesPage());
    expect(html).toContain("Draft");
  });
});
