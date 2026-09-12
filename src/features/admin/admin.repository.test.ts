import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createServerSupabaseClient: vi.fn(), rpc: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.createServerSupabaseClient }));

import { listLearners, loadAdminOverview } from "./admin.repository";

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

  it("clamps pagination and trims learner search before calling the database", async () => {
    mocks.rpc.mockResolvedValue({ data: { total: 0, rows: [] }, error: null });
    await expect(listLearners({ query: "  subnet  ", offset: -2, limit: 999 })).resolves.toEqual({ rows: [], total: 0 });
    expect(mocks.rpc).toHaveBeenCalledWith("admin_list_learners", {
      p_query: "subnet", p_offset: 0, p_limit: 50,
    });
  });
});
