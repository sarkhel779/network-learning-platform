import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ grantSubscriptionAction: vi.fn(), revokeSubscriptionAction: vi.fn() }));
vi.mock("@/app/admin/billing/actions", () => ({
  grantSubscriptionAction: mocks.grantSubscriptionAction,
  revokeSubscriptionAction: mocks.revokeSubscriptionAction,
}));

import { BillingManager } from "./billing-manager";
import type { BillingPlan, SubscriptionRow } from "./admin.types";

const plans: BillingPlan[] = [
  { id: "pro_monthly", name: "Pro Monthly", billingInterval: "monthly", priceCents: null, currency: "INR" },
  { id: "pro_annual", name: "Pro Annual", billingInterval: "annual", priceCents: null, currency: "INR" },
];

const activeSubscription: SubscriptionRow = {
  id: 1, learnerId: "learner-1", learnerEmail: "ada@example.test", planId: "pro_monthly",
  status: "active", source: "manual", currentPeriodEnd: null, createdAt: "2026-09-17T00:00:00Z", canceledAt: null,
};

afterEach(cleanup);

beforeEach(() => {
  mocks.grantSubscriptionAction.mockReset();
  mocks.revokeSubscriptionAction.mockReset();
});

describe("BillingManager", () => {
  it("shows placeholder pricing and a note that no gateway is connected", () => {
    render(<BillingManager plans={plans} subscriptions={[]} />);
    expect(screen.getByText(/No payment gateway is connected yet/)).toBeVisible();
    expect(screen.getAllByText(/placeholder/i).length).toBeGreaterThan(0);
    expect(screen.getByText("No subscriptions yet.")).toBeVisible();
  });

  it("submits an email and plan to grant access", async () => {
    mocks.grantSubscriptionAction.mockResolvedValue({ ok: true, message: "ada@example.test now has pro monthly access." });
    render(<BillingManager plans={plans} subscriptions={[]} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.test" } });
    fireEvent.change(screen.getByLabelText("Plan"), { target: { value: "pro_annual" } });
    fireEvent.click(screen.getByRole("button", { name: "Grant access" }));
    expect(await screen.findByRole("status")).toHaveTextContent("now has pro monthly access");
    const formData = mocks.grantSubscriptionAction.mock.calls[0][0] as FormData;
    expect(formData.get("email")).toBe("ada@example.test");
    expect(formData.get("planId")).toBe("pro_annual");
  });

  it("lists an active subscription with a revoke action", async () => {
    mocks.revokeSubscriptionAction.mockResolvedValue({ ok: true, message: "Pro access revoked." });
    render(<BillingManager plans={plans} subscriptions={[activeSubscription]} />);
    expect(screen.getByText("ada@example.test")).toBeVisible();
    expect(screen.getByText("Active")).toBeVisible();
    expect(screen.getByText("Manually granted")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Revoke" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Pro access revoked");
    const formData = mocks.revokeSubscriptionAction.mock.calls[0][0] as FormData;
    expect(formData.get("subscriptionId")).toBe("1");
  });

  it("does not offer a revoke action for a canceled subscription", () => {
    render(<BillingManager plans={plans} subscriptions={[{ ...activeSubscription, status: "canceled", canceledAt: "2026-09-17T01:00:00Z" }]} />);
    expect(screen.getByText("Canceled")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Revoke" })).not.toBeInTheDocument();
  });

  it("surfaces a failed grant as an alert", async () => {
    mocks.grantSubscriptionAction.mockResolvedValue({ ok: false, message: "No account exists with that email yet." });
    render(<BillingManager plans={plans} subscriptions={[]} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "nobody@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Grant access" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No account exists");
  });
});
