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
    const html = renderToStaticMarkup(await AdminOverviewPage({ searchParams: Promise.resolve({}) }));
    expect(mocks.requireStaff).toHaveBeenCalledWith("overview");
    expect(html).toContain("Registered accounts");
    expect(html).toContain("Founding Pro waitlist");
    expect(html).toContain("Total page views");
    expect(html).toContain("Unavailable");
    expect(html).toContain("12");
    expect(mocks.loadAdminOverview).toHaveBeenCalledWith(30);
  });

  it("links the account and waitlist metrics to their dedicated admin pages", async () => {
    mocks.requireStaff.mockResolvedValueOnce({ viewer: { id: "admin-1" }, role: "super_admin" });
    mocks.loadAdminOverview.mockResolvedValueOnce({ accounts: 10, joinedWaitlist: 1, pageViews: 12 });
    const html = renderToStaticMarkup(await AdminOverviewPage({ searchParams: Promise.resolve({}) }));
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const usersLinks = Array.from(parsed.querySelectorAll('a[href="/admin/users"]'));
    const waitlistLinks = Array.from(parsed.querySelectorAll('a[href="/admin/waitlist"]'));
    expect(usersLinks.some((link) => link.textContent?.includes("Registered accounts"))).toBe(true);
    expect(waitlistLinks.some((link) => link.textContent?.includes("Founding Pro waitlist"))).toBe(true);
  });
});
