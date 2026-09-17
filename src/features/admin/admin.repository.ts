import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import type {
  AdminOverview,
  AuditRow,
  BillingPlan,
  LearnerDetail,
  LearnerRow,
  LessonPublicationUpdate,
  ModuleLessonOrderUpdate,
  StaffMember,
  StaffRole,
  SubscriptionRow,
  SubscriptionStatus,
  SupportTicketDetail,
  SupportTicketRow,
  SupportTicketStatus,
  WaitlistMember,
} from "./admin.types";

function countOrNull(data: unknown): number | null {
  const value = typeof data === "number" ? data : typeof data === "string" ? Number(data) : NaN;
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export async function loadAdminOverview(days: 7 | 30 | 90 = 30): Promise<AdminOverview> {
  try {
    const supabase = await createServerSupabaseClient();
    const rangeDays = days === 7 || days === 90 ? days : 30;
    const to = new Date();
    const [accounts, joinedWaitlist, pageViews] = await Promise.all([
      supabase.rpc("admin_account_count"),
      supabase.rpc("admin_joined_waitlist_count"),
      supabase.rpc("admin_page_view_count", {
        p_from: new Date(to.getTime() - rangeDays * 86400000).toISOString(),
        p_to: to.toISOString(),
      }),
    ]);
    return {
      accounts: accounts.error ? null : countOrNull(accounts.data),
      joinedWaitlist: joinedWaitlist.error ? null : countOrNull(joinedWaitlist.data),
      pageViews: pageViews.error ? null : countOrNull(pageViews.data),
    };
  } catch {
    return { accounts: null, joinedWaitlist: null, pageViews: null };
  }
}

type LearnerQuery = { query?: string; offset?: number; limit?: number };

export async function listLearners({ query = "", offset = 0, limit = 20 }: LearnerQuery): Promise<{ rows: LearnerRow[]; total: number }> {
  const p_query = query.trim().slice(0, 100);
  const p_offset = Math.max(0, Math.floor(offset || 0));
  const p_limit = Math.min(50, Math.max(1, Math.floor(limit || 20)));
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("admin_list_learners", { p_query, p_offset, p_limit });
  if (error || !data || typeof data !== "object") throw new Error("Learner directory unavailable");
  const result = data as { total?: unknown; rows?: unknown };
  const total = countOrNull(result.total);
  if (total === null || !Array.isArray(result.rows)) throw new Error("Learner directory unavailable");
  return { rows: result.rows as LearnerRow[], total };
}

type WaitlistQuery = { offset?: number; limit?: number };

export async function listWaitlist({ offset = 0, limit = 20 }: WaitlistQuery = {}): Promise<{ rows: WaitlistMember[]; total: number }> {
  const p_offset = Math.max(0, Math.floor(offset || 0));
  const p_limit = Math.min(50, Math.max(1, Math.floor(limit || 20)));
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("admin_list_waitlist", { p_offset, p_limit });
  if (error || !data || typeof data !== "object") throw new Error("Waitlist unavailable");
  const result = data as { total?: unknown; rows?: unknown };
  const total = countOrNull(result.total);
  if (total === null || !Array.isArray(result.rows)) throw new Error("Waitlist unavailable");
  return { rows: result.rows as WaitlistMember[], total };
}

export async function getLearnerDetail(targetId: string): Promise<LearnerDetail | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("admin_get_learner", { p_target_id: targetId });
  if (error) throw new Error("Learner detail unavailable");
  return data ? data as LearnerDetail : null;
}

export async function listStaff(): Promise<StaffMember[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("admin_list_staff");
  if (error || !Array.isArray(data)) throw new Error("Staff directory unavailable");
  return data as StaffMember[];
}

export async function assignStaffRole(email: string, role: StaffRole): Promise<StaffMember> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("admin_assign_staff_role", { p_email: email, p_role: role });
  if (error || !data) throw new Error(error?.message === "staff_account_not_found" ? "staff_account_not_found" : "Staff role could not be assigned");
  return data as StaffMember;
}

export async function revokeStaffRole(userId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("admin_revoke_staff_role", { p_user_id: userId });
  if (error) throw new Error(error.message === "cannot_revoke_self" ? "cannot_revoke_self" : "Staff role could not be revoked");
}

export async function setLessonPublished(lessonId: string, published: boolean): Promise<LessonPublicationUpdate> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("admin_set_lesson_published", { p_lesson_id: lessonId, p_published: published });
  if (error || !data) throw new Error("Lesson publication could not be updated");
  return data as LessonPublicationUpdate;
}

export async function setModuleLessonOrder(moduleId: string, lessonIds: string[]): Promise<ModuleLessonOrderUpdate> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("admin_set_module_lesson_order", { p_module_id: moduleId, p_lesson_ids: lessonIds });
  if (error || !data) throw new Error("Lesson order could not be updated");
  return data as ModuleLessonOrderUpdate;
}

type SupportTicketQuery = { status?: SupportTicketStatus; offset?: number; limit?: number };

export async function listSupportTickets({ status, offset = 0, limit = 20 }: SupportTicketQuery = {}): Promise<{ rows: SupportTicketRow[]; total: number }> {
  const p_offset = Math.max(0, Math.floor(offset || 0));
  const p_limit = Math.min(50, Math.max(1, Math.floor(limit || 20)));
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("admin_list_support_tickets", { p_status: status ?? null, p_offset, p_limit });
  if (error || !data || typeof data !== "object") throw new Error("Support queue unavailable");
  const result = data as { total?: unknown; rows?: unknown };
  const total = countOrNull(result.total);
  if (total === null || !Array.isArray(result.rows)) throw new Error("Support queue unavailable");
  return { rows: result.rows as SupportTicketRow[], total };
}

export async function getSupportTicket(ticketId: number): Promise<SupportTicketDetail | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("admin_get_support_ticket", { p_ticket_id: ticketId });
  if (error) {
    if (error.message === "ticket_not_found") return null;
    throw new Error("Support ticket unavailable");
  }
  return data as SupportTicketDetail;
}

export async function replySupportTicket(ticketId: number, body: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("admin_reply_support_ticket", { p_ticket_id: ticketId, p_body: body });
  if (error) throw new Error(error.message === "ticket_not_found" ? "ticket_not_found" : "Reply could not be sent");
}

export async function setSupportTicketStatus(ticketId: number, status: SupportTicketStatus): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("admin_set_support_ticket_status", { p_ticket_id: ticketId, p_status: status });
  if (error) throw new Error(error.message === "ticket_not_found" ? "ticket_not_found" : "Status could not be updated");
}

export async function listBillingPlans(): Promise<BillingPlan[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("admin_list_billing_plans");
  if (error || !Array.isArray(data)) throw new Error("Billing plans unavailable");
  return data as BillingPlan[];
}

type SubscriptionQuery = { status?: SubscriptionStatus; offset?: number; limit?: number };

export async function listSubscriptions({ status, offset = 0, limit = 20 }: SubscriptionQuery = {}): Promise<{ rows: SubscriptionRow[]; total: number }> {
  const p_offset = Math.max(0, Math.floor(offset || 0));
  const p_limit = Math.min(50, Math.max(1, Math.floor(limit || 20)));
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("admin_list_subscriptions", { p_status: status ?? null, p_offset, p_limit });
  if (error || !data || typeof data !== "object") throw new Error("Subscriptions unavailable");
  const result = data as { total?: unknown; rows?: unknown };
  const total = countOrNull(result.total);
  if (total === null || !Array.isArray(result.rows)) throw new Error("Subscriptions unavailable");
  return { rows: result.rows as SubscriptionRow[], total };
}

export async function grantSubscription(email: string, planId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("admin_grant_subscription", { p_email: email, p_plan_id: planId });
  if (error) throw new Error(error.message === "learner_account_not_found" ? "learner_account_not_found" : "Subscription could not be granted");
}

export async function revokeSubscription(subscriptionId: number): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("admin_revoke_subscription", { p_subscription_id: subscriptionId });
  if (error) throw new Error(error.message === "subscription_not_found" ? "subscription_not_found" : "Subscription could not be revoked");
}

export async function listAudit({ offset = 0, limit = 20 }: { offset?: number; limit?: number } = {}): Promise<{ rows: AuditRow[]; total: number }> {
  const p_offset = Math.max(0, Math.floor(offset || 0));
  const p_limit = Math.min(50, Math.max(1, Math.floor(limit || 20)));
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("admin_list_audit", { p_offset, p_limit });
  if (error || !data || typeof data !== "object") throw new Error("Audit log unavailable");
  const result = data as { total?: unknown; rows?: unknown };
  const total = countOrNull(result.total);
  if (total === null || !Array.isArray(result.rows)) throw new Error("Audit log unavailable");
  return { rows: result.rows as AuditRow[], total };
}
