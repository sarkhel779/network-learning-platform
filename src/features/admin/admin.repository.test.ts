import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createServerSupabaseClient: vi.fn(), rpc: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.createServerSupabaseClient }));

import { getLearnerDetail, listAudit, listLearners, loadAdminOverview } from "./admin.repository";

beforeEach(() => {
  mocks.rpc.mockReset();
  mocks.createServerSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
});

describe("admin repository", () => {
  it("keeps unavailable metrics distinct from real zeroes", async () => {
    mocks.rpc.mockImplementation(async (name: string) => {
      if (name === "admin_account_count") return { data: 0, error: null };
      if (name === "admin_joined_waitlist_count") return { data: null, error: { message: "offline" } };
      return { data: 12, error: null };
    });
    await expect(loadAdminOverview()).resolves.toMatchObject({ accounts: 0, joinedWaitlist: null, pageViews: 12 });
  });

  it("uses a validated page-view range without changing account totals", async () => {
    mocks.rpc.mockResolvedValue({ data: 5, error: null });
    await loadAdminOverview(7);
    const range = mocks.rpc.mock.calls.find(([name]) => name === "admin_page_view_count")?.[1];
    expect(new Date(range.p_to).getTime() - new Date(range.p_from).getTime()).toBe(7 * 86400000);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_account_count");
    expect(mocks.rpc).toHaveBeenCalledWith("admin_joined_waitlist_count");
  });

  it("clamps pagination and trims learner search before calling the database", async () => {
    mocks.rpc.mockResolvedValue({ data: { total: 0, rows: [] }, error: null });
    await expect(listLearners({ query: "  subnet  ", offset: -2, limit: 999 })).resolves.toEqual({ rows: [], total: 0 });
    expect(mocks.rpc).toHaveBeenCalledWith("admin_list_learners", {
      p_query: "subnet", p_offset: 0, p_limit: 50,
    });
  });

  it("loads one authorized learner detail through a narrow RPC", async () => {
    const learner = { id: "00000000-0000-4000-8000-000000000102", email: "learner@example.test", displayName: "Ada", learningLevel: "beginner", notes: [] };
    mocks.rpc.mockResolvedValue({ data: learner, error: null });
    await expect(getLearnerDetail(learner.id)).resolves.toEqual(learner);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_get_learner", { p_target_id: learner.id });
  });

  it("paginates the read-only audit log through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { total: 1, rows: [{ id: 8, action: "learner_profile_updated", actorId: "staff", targetId: "learner", createdAt: "2026-09-12T00:00:00Z", beforeValue: null, afterValue: null }] }, error: null });
    const result = await listAudit({ offset: 0, limit: 20 });
    expect(result.total).toBe(1);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_list_audit", { p_offset: 0, p_limit: 20 });
  });
});
