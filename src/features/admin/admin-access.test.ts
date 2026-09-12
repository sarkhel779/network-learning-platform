import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getViewer: vi.fn(),
  createServerSupabaseClient: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`redirect:${path}`); }),
  notFound: vi.fn(() => { throw new Error("not-found"); }),
}));

vi.mock("@/lib/supabase/session", () => ({ getViewer: mocks.getViewer }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.createServerSupabaseClient }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect, notFound: mocks.notFound }));
vi.mock("server-only", () => ({}));

import { canStaff, requireStaff } from "./admin-access";

describe("admin access", () => {
  it("allows support to manage learners but never billing or roles", () => {
    expect(canStaff("support_agent", "users_write")).toBe(true);
    expect(canStaff("support_agent", "billing")).toBe(false);
    expect(canStaff("support_agent", "roles")).toBe(false);
    expect(canStaff("super_admin", "roles")).toBe(true);
  });

  it("sends an anonymous visitor to sign in", async () => {
    mocks.getViewer.mockResolvedValueOnce(null);
    await expect(requireStaff("overview")).rejects.toThrow("redirect:/sign-in?returnTo=%2Fadmin");
    expect(mocks.createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("denies a signed-in nonstaff viewer", async () => {
    mocks.getViewer.mockResolvedValueOnce({ id: "learner-1", displayName: null, avatarUrl: null });
    mocks.createServerSupabaseClient.mockResolvedValueOnce({ rpc: vi.fn().mockResolvedValue({ data: null, error: null }) });
    await expect(requireStaff("overview")).rejects.toThrow("not-found");
  });

  it("does not trust a staff role for a section outside its permissions", async () => {
    mocks.getViewer.mockResolvedValueOnce({ id: "staff-1", displayName: null, avatarUrl: null });
    mocks.createServerSupabaseClient.mockResolvedValueOnce({ rpc: vi.fn().mockResolvedValue({ data: "support_agent", error: null }) });
    await expect(requireStaff("billing")).rejects.toThrow("not-found");
  });
});
