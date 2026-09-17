import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireStaff: vi.fn(), listBillingPlans: vi.fn(), listSubscriptions: vi.fn() }));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/features/admin/admin.repository", () => ({
  listBillingPlans: mocks.listBillingPlans,
  listSubscriptions: mocks.listSubscriptions,
}));

import BillingPage from "./page";

describe("admin billing page", () => {
  it("shows placeholder plans and the subscriptions ledger for an authorized viewer", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "finance" });
    mocks.listBillingPlans.mockResolvedValue([
      { id: "pro_monthly", name: "Pro Monthly", billingInterval: "monthly", priceCents: null, currency: "INR" },
      { id: "pro_annual", name: "Pro Annual", billingInterval: "annual", priceCents: null, currency: "INR" },
    ]);
    mocks.listSubscriptions.mockResolvedValue({ total: 0, rows: [] });
    const html = renderToStaticMarkup(await BillingPage());
    expect(mocks.requireStaff).toHaveBeenCalledWith("billing");
    expect(html).toContain("Billing");
    expect(html).toContain("Pro Monthly");
    expect(html).toContain("placeholder");
    expect(html).not.toContain("not connected yet");
    expect(html).not.toContain("₹4.2L");
  });

  it("does not claim an unavailable ledger is empty", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "finance" });
    mocks.listBillingPlans.mockRejectedValueOnce(new Error("offline"));
    mocks.listSubscriptions.mockResolvedValue({ total: 0, rows: [] });
    const html = renderToStaticMarkup(await BillingPage());
    expect(html).toContain("temporarily unavailable");
    expect(html).not.toContain("No subscriptions yet");
  });
});
