import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createServerSupabaseClient: vi.fn(), rpc: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.createServerSupabaseClient }));

import {
  assignStaffRole,
  deleteFeatureFlag,
  getLearnerDetail,
  getSupportTicket,
  grantSubscription,
  listAudit,
  listBillingPlans,
  listFeatureFlags,
  listLearners,
  listStaff,
  listSubscriptions,
  listSupportTickets,
  listWaitlist,
  loadAdminOverview,
  replySupportTicket,
  revokeStaffRole,
  revokeSubscription,
  setLessonPublished,
  setModuleLessonOrder,
  setSupportTicketStatus,
  upsertFeatureFlag,
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
    await expect(loadAdminOverview()).resolves.toMatchObject({ accounts: 0, joinedWaitlist: null, pageViews: 12, uniqueVisitors: 12 });
  });

  it("uses a validated page-view range without changing account totals", async () => {
    mocks.rpc.mockResolvedValue({ data: 5, error: null });
    await loadAdminOverview(7);
    const range = mocks.rpc.mock.calls.find(([name]) => name === "admin_page_view_count")?.[1];
    expect(new Date(range.p_to).getTime() - new Date(range.p_from).getTime()).toBe(7 * 86400000);
    const uniqueRange = mocks.rpc.mock.calls.find(([name]) => name === "admin_unique_visitor_count")?.[1];
    expect(uniqueRange).toEqual(range);
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

  it("clamps pagination when listing the joined waitlist through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { total: 0, rows: [] }, error: null });
    await expect(listWaitlist({ offset: -2, limit: 999 })).resolves.toEqual({ rows: [], total: 0 });
    expect(mocks.rpc).toHaveBeenCalledWith("admin_list_waitlist", { p_offset: 0, p_limit: 50 });
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

  it("clamps pagination and passes an unset status filter as null", async () => {
    mocks.rpc.mockResolvedValue({ data: { total: 0, rows: [] }, error: null });
    await expect(listSupportTickets({ offset: -2, limit: 999 })).resolves.toEqual({ rows: [], total: 0 });
    expect(mocks.rpc).toHaveBeenCalledWith("admin_list_support_tickets", { p_status: null, p_offset: 0, p_limit: 50 });
  });

  it("passes a status filter through to the queue RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { total: 1, rows: [{ id: 1, subject: "Login issue", status: "open", learnerId: "learner-1", learnerEmail: "learner@example.test", createdAt: "2026-09-17T00:00:00Z", updatedAt: "2026-09-17T00:00:00Z" }] }, error: null });
    await listSupportTickets({ status: "open" });
    expect(mocks.rpc).toHaveBeenCalledWith("admin_list_support_tickets", { p_status: "open", p_offset: 0, p_limit: 20 });
  });

  it("loads one support ticket with its full thread through a guarded RPC", async () => {
    const ticket = { id: 1, subject: "Login issue", status: "open", learnerId: "learner-1", learnerEmail: "learner@example.test", createdAt: "2026-09-17T00:00:00Z", updatedAt: "2026-09-17T00:00:00Z", messages: [] };
    mocks.rpc.mockResolvedValue({ data: ticket, error: null });
    await expect(getSupportTicket(1)).resolves.toEqual(ticket);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_get_support_ticket", { p_ticket_id: 1 });
  });

  it("returns null for a missing support ticket instead of throwing", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "ticket_not_found" } });
    await expect(getSupportTicket(999)).resolves.toBeNull();
  });

  it("replies to a support ticket through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { ticketId: 1 }, error: null });
    await expect(replySupportTicket(1, "We are looking into this.")).resolves.toBeUndefined();
    expect(mocks.rpc).toHaveBeenCalledWith("admin_reply_support_ticket", { p_ticket_id: 1, p_body: "We are looking into this." });
  });

  it("surfaces a support ticket reply failure", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "ticket_not_found" } });
    await expect(replySupportTicket(999, "Hello")).rejects.toThrow("ticket_not_found");
  });

  it("changes a support ticket's status through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { id: 1, status: "resolved" }, error: null });
    await expect(setSupportTicketStatus(1, "resolved")).resolves.toBeUndefined();
    expect(mocks.rpc).toHaveBeenCalledWith("admin_set_support_ticket_status", { p_ticket_id: 1, p_status: "resolved" });
  });

  it("surfaces a support ticket status failure", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "ticket_not_found" } });
    await expect(setSupportTicketStatus(999, "resolved")).rejects.toThrow("ticket_not_found");
  });

  it("loads the seeded placeholder plans through a guarded RPC", async () => {
    const plans = [{ id: "pro_monthly", name: "Pro Monthly", billingInterval: "monthly", priceCents: null, currency: "INR" }];
    mocks.rpc.mockResolvedValue({ data: plans, error: null });
    await expect(listBillingPlans()).resolves.toEqual(plans);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_list_billing_plans");
  });

  it("clamps pagination and passes an unset status filter as null", async () => {
    mocks.rpc.mockResolvedValue({ data: { total: 0, rows: [] }, error: null });
    await expect(listSubscriptions({ offset: -2, limit: 999 })).resolves.toEqual({ rows: [], total: 0 });
    expect(mocks.rpc).toHaveBeenCalledWith("admin_list_subscriptions", { p_status: null, p_offset: 0, p_limit: 50 });
  });

  it("passes a status filter through to the subscriptions RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { total: 1, rows: [{ id: 1, learnerId: "learner-1", learnerEmail: "ada@example.test", planId: "pro_monthly", status: "active", source: "manual", currentPeriodEnd: null, createdAt: "2026-09-17T00:00:00Z", canceledAt: null }] }, error: null });
    await listSubscriptions({ status: "active" });
    expect(mocks.rpc).toHaveBeenCalledWith("admin_list_subscriptions", { p_status: "active", p_offset: 0, p_limit: 20 });
  });

  it("grants a subscription through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { id: 1, learnerId: "learner-1", planId: "pro_monthly", status: "active" }, error: null });
    await expect(grantSubscription("ada@example.test", "pro_monthly")).resolves.toBeUndefined();
    expect(mocks.rpc).toHaveBeenCalledWith("admin_grant_subscription", { p_email: "ada@example.test", p_plan_id: "pro_monthly" });
  });

  it("surfaces an unknown-email grant failure distinctly", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "learner_account_not_found" } });
    await expect(grantSubscription("nobody@example.test", "pro_monthly")).rejects.toThrow("learner_account_not_found");
  });

  it("revokes a subscription through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { id: 1, status: "canceled" }, error: null });
    await expect(revokeSubscription(1)).resolves.toBeUndefined();
    expect(mocks.rpc).toHaveBeenCalledWith("admin_revoke_subscription", { p_subscription_id: 1 });
  });

  it("surfaces a not-found revoke failure distinctly", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "subscription_not_found" } });
    await expect(revokeSubscription(999)).rejects.toThrow("subscription_not_found");
  });

  it("paginates the read-only audit log through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { total: 1, rows: [{ id: 8, action: "learner_profile_updated", actorId: "staff", targetId: "learner", createdAt: "2026-09-12T00:00:00Z", beforeValue: null, afterValue: null }] }, error: null });
    const result = await listAudit({ offset: 0, limit: 20 });
    expect(result.total).toBe(1);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_list_audit", { p_offset: 0, p_limit: 20 });
  });

  it("lists feature flags through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: [{ key: "new_lesson_ui", enabled: true, description: null, updatedAt: "2026-09-17T00:00:00Z" }], error: null });
    const result = await listFeatureFlags();
    expect(result).toHaveLength(1);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_list_feature_flags");
  });

  it("upserts a feature flag through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { key: "new_lesson_ui", enabled: true, description: "Testing" }, error: null });
    await expect(upsertFeatureFlag("new_lesson_ui", true, "Testing")).resolves.toBeUndefined();
    expect(mocks.rpc).toHaveBeenCalledWith("admin_upsert_feature_flag", { p_key: "new_lesson_ui", p_enabled: true, p_description: "Testing" });
  });

  it("surfaces an invalid-key upsert failure distinctly", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "invalid_flag_key" } });
    await expect(upsertFeatureFlag("Not Valid", true, null)).rejects.toThrow("invalid_flag_key");
  });

  it("deletes a feature flag through a guarded RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null });
    await expect(deleteFeatureFlag("new_lesson_ui")).resolves.toBeUndefined();
    expect(mocks.rpc).toHaveBeenCalledWith("admin_delete_feature_flag", { p_key: "new_lesson_ui" });
  });

  it("surfaces a not-found delete failure distinctly", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "feature_flag_not_found" } });
    await expect(deleteFeatureFlag("does_not_exist")).rejects.toThrow("feature_flag_not_found");
  });
});
