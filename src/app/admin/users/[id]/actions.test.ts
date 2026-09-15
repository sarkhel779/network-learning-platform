import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireStaff: vi.fn(),
  createServerSupabaseClient: vi.fn(),
  rpc: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.createServerSupabaseClient }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { saveLearnerEdit } from "./actions";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("save learner edit", () => {
  it("rejects invalid input without calling the database", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "support_agent" });
    const result = await saveLearnerEdit(form({ targetId: "bad", displayName: "Ada", learningLevel: "beginner" }));
    expect(result.ok).toBe(false);
    expect(mocks.createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("reauthorizes and sends only permitted fields to the atomic RPC", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "support_agent" });
    mocks.rpc.mockResolvedValue({ data: { id: "00000000-0000-4000-8000-000000000102" }, error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
    const result = await saveLearnerEdit(form({ targetId: "00000000-0000-4000-8000-000000000102", displayName: " Ada ", learningLevel: "beginner", note: " Helped " }));
    expect(result.ok).toBe(true);
    expect(mocks.requireStaff).toHaveBeenCalledWith("users_write");
    expect(mocks.rpc).toHaveBeenCalledWith("admin_update_learner", {
      p_target_id: "00000000-0000-4000-8000-000000000102",
      p_display_name: "Ada", p_learning_level: "beginner", p_note: "Helped",
    });
  });
});
