import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireStaff: vi.fn(),
  grantSubscription: vi.fn(),
  revokeSubscription: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/features/admin/admin.repository", () => ({
  grantSubscription: mocks.grantSubscription,
  revokeSubscription: mocks.revokeSubscription,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { grantSubscriptionAction, revokeSubscriptionAction } from "./actions";

beforeEach(() => {
  mocks.requireStaff.mockReset();
  mocks.grantSubscription.mockReset();
  mocks.revokeSubscription.mockReset();
  mocks.revalidatePath.mockReset();
  mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "finance" });
});

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("grant subscription action", () => {
  it("rejects invalid input without calling the database", async () => {
    const result = await grantSubscriptionAction(form({ email: "not-an-email", planId: "pro_monthly" }));
    expect(result.ok).toBe(false);
    expect(mocks.grantSubscription).not.toHaveBeenCalled();
  });

  it("reauthorizes and grants the subscription through the guarded RPC", async () => {
    mocks.grantSubscription.mockResolvedValue(undefined);
    const result = await grantSubscriptionAction(form({ email: " New@Example.test ", planId: "pro_monthly" }));
    expect(result.ok).toBe(true);
    expect(mocks.requireStaff).toHaveBeenCalledWith("billing");
    expect(mocks.grantSubscription).toHaveBeenCalledWith("new@example.test", "pro_monthly");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/billing");
  });

  it("gives a clear message when the email has no account yet", async () => {
    mocks.grantSubscription.mockRejectedValue(new Error("learner_account_not_found"));
    const result = await grantSubscriptionAction(form({ email: "nobody@example.test", planId: "pro_monthly" }));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/sign up first/i);
  });
});

describe("revoke subscription action", () => {
  it("rejects an invalid subscription id without calling the database", async () => {
    const result = await revokeSubscriptionAction(form({ subscriptionId: "0" }));
    expect(result.ok).toBe(false);
    expect(mocks.revokeSubscription).not.toHaveBeenCalled();
  });

  it("revokes through the guarded RPC", async () => {
    mocks.revokeSubscription.mockResolvedValue(undefined);
    const result = await revokeSubscriptionAction(form({ subscriptionId: "1" }));
    expect(result.ok).toBe(true);
    expect(mocks.revokeSubscription).toHaveBeenCalledWith(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/billing");
  });

  it("surfaces a database failure without a false success", async () => {
    mocks.revokeSubscription.mockRejectedValue(new Error("subscription_not_found"));
    const result = await revokeSubscriptionAction(form({ subscriptionId: "999" }));
    expect(result.ok).toBe(false);
  });
});
