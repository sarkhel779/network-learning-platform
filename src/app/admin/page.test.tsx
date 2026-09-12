import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn(), loadAdminOverview: vi.fn() }));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/features/admin/admin.repository", () => ({ loadAdminOverview: mocks.loadAdminOverview }));

import AdminOverviewPage from "./page";

describe("admin overview", () => {
  it("shows live zero separately from an unavailable waitlist metric", async () => {
    mocks.requireStaff.mockResolvedValueOnce({ viewer: { id: "admin-1" }, role: "super_admin" });
    mocks.loadAdminOverview.mockResolvedValueOnce({ accounts: 0, joinedWaitlist: null, pageViews: 12 });
    const html = renderToStaticMarkup(await AdminOverviewPage());
    expect(mocks.requireStaff).toHaveBeenCalledWith("overview");
    expect(html).toContain("Registered accounts");
    expect(html).toContain("Founding Pro waitlist");
    expect(html).toContain("Total page views");
    expect(html).toContain("Unavailable");
    expect(html).toContain("12");
  });
});
