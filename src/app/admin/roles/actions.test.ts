import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { assignStaffRoleAction, revokeStaffRoleAction } from "./actions";

beforeEach(() => {
  mocks.requireStaff.mockReset();
  mocks.createServerSupabaseClient.mockReset();
  mocks.rpc.mockReset();
  mocks.revalidatePath.mockReset();
});

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("assign staff role action", () => {
  it("rejects invalid input without calling the database", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "super_admin" });
    const result = await assignStaffRoleAction(form({ email: "not-an-email", role: "finance" }));
    expect(result.ok).toBe(false);
    expect(mocks.createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("reauthorizes and assigns the role through the atomic RPC", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "super_admin" });
    mocks.rpc.mockResolvedValue({ data: { userId: "00000000-0000-4000-8000-000000000303", email: "new@example.test", role: "content_editor" }, error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
    const result = await assignStaffRoleAction(form({ email: " New@Example.test ", role: "content_editor" }));
    expect(result.ok).toBe(true);
    expect(mocks.requireStaff).toHaveBeenCalledWith("roles");
    expect(mocks.rpc).toHaveBeenCalledWith("admin_assign_staff_role", { p_email: "new@example.test", p_role: "content_editor" });
  });

  it("gives a clear message when the email has no account yet", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "super_admin" });
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "staff_account_not_found" } });
    mocks.createServerSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
    const result = await assignStaffRoleAction(form({ email: "nobody@example.test", role: "finance" }));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/sign up first/i);
  });
});

describe("revoke staff role action", () => {
  it("rejects an invalid user id without calling the database", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "super_admin" });
    const result = await revokeStaffRoleAction(form({ userId: "bad" }));
    expect(result.ok).toBe(false);
    expect(mocks.createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("revokes through the atomic RPC", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "super_admin" });
    mocks.rpc.mockResolvedValue({ data: null, error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
    const result = await revokeStaffRoleAction(form({ userId: "00000000-0000-4000-8000-000000000302" }));
    expect(result.ok).toBe(true);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_revoke_staff_role", { p_user_id: "00000000-0000-4000-8000-000000000302" });
  });

  it("gives a clear message when revoking your own access", async () => {
    mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "super_admin" });
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "cannot_revoke_self" } });
    mocks.createServerSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
    const result = await revokeStaffRoleAction(form({ userId: "00000000-0000-4000-8000-000000000301" }));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/cannot revoke your own/i);
  });
});
