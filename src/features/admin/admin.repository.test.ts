import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createServerSupabaseClient: vi.fn(), rpc: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.createServerSupabaseClient }));

import {
  assignStaffRole,
  getLearnerDetail,
  listAudit,
  listLearners,
  listStaff,
  loadAdminOverview,
  revokeStaffRole,
  setLessonPublished,
  setModuleLessonOrder,
} from "./admin.repository";

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

  it("loads the staff directory through a guarded RPC", async () => {
    const staff = [{ userId: "00000000-0000-4000-8000-000000000301", email: "staff@example.test", role: "support_agent", assignedBy: null, createdAt: "2026-09-17T00:00:00Z" }];
    mocks.rpc.mockResolvedValue({ data: staff, error: null });
    await expect(listStaff()).resolves.toEqual(staff);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_list_staff");
  });

  it("assigns a staff role through a guarded RPC", async () => {
    const member = { userId: "00000000-0000-4000-8000-000000000303", email: "new@example.test", role: "content_editor" };
    mocks.rpc.mockResolvedValue({ data: member, error: null });
    await expect(assignStaffRole("new@example.test", "content_editor")).resolves.toEqual(member);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_assign_staff_role", { p_email: "new@example.test", p_role: "content_editor" });
  });

  it("surfaces an unknown-email assignment failure distinctly", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "staff_account_not_found" } });
    await expect(assignStaffRole("nobody@example.test", "finance")).rejects.toThrow("staff_account_not_found");
  });

  it("revokes a staff role through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null });
    await expect(revokeStaffRole("00000000-0000-4000-8000-000000000301")).resolves.toBeUndefined();
    expect(mocks.rpc).toHaveBeenCalledWith("admin_revoke_staff_role", { p_user_id: "00000000-0000-4000-8000-000000000301" });
  });

  it("surfaces a self-revocation failure distinctly", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "cannot_revoke_self" } });
    await expect(revokeStaffRole("00000000-0000-4000-8000-000000000301")).rejects.toThrow("cannot_revoke_self");
  });

  it("updates a lesson's publication state through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { lessonId: "lesson_how_networks_communicate", published: false }, error: null });
    await expect(setLessonPublished("lesson_how_networks_communicate", false)).resolves.toEqual({
      lessonId: "lesson_how_networks_communicate", published: false,
    });
    expect(mocks.rpc).toHaveBeenCalledWith("admin_set_lesson_published", { p_lesson_id: "lesson_how_networks_communicate", p_published: false });
  });

  it("surfaces a lesson publication failure", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "invalid_lesson_id" } });
    await expect(setLessonPublished("lesson_missing", true)).rejects.toThrow("Lesson publication could not be updated");
  });

  it("updates a module's lesson order through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { moduleId: "module_network_and_device_essentials", lessonOrder: ["lesson_b", "lesson_a"] }, error: null });
    await expect(setModuleLessonOrder("module_network_and_device_essentials", ["lesson_b", "lesson_a"])).resolves.toEqual({
      moduleId: "module_network_and_device_essentials", lessonOrder: ["lesson_b", "lesson_a"],
    });
    expect(mocks.rpc).toHaveBeenCalledWith("admin_set_module_lesson_order", { p_module_id: "module_network_and_device_essentials", p_lesson_ids: ["lesson_b", "lesson_a"] });
  });

  it("surfaces a lesson order failure", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "duplicate_lesson_in_order" } });
    await expect(setModuleLessonOrder("module_network_and_device_essentials", ["lesson_a", "lesson_a"])).rejects.toThrow("Lesson order could not be updated");
  });

  it("paginates the read-only audit log through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { total: 1, rows: [{ id: 8, action: "learner_profile_updated", actorId: "staff", targetId: "learner", createdAt: "2026-09-12T00:00:00Z", beforeValue: null, afterValue: null }] }, error: null });
    const result = await listAudit({ offset: 0, limit: 20 });
    expect(result.total).toBe(1);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_list_audit", { p_offset: 0, p_limit: 20 });
  });
});
