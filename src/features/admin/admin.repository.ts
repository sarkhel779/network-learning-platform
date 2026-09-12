import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { AdminOverview, LearnerRow } from "./admin.types";

function countOrNull(data: unknown): number | null {
  const value = typeof data === "number" ? data : typeof data === "string" ? Number(data) : NaN;
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export async function loadAdminOverview(): Promise<AdminOverview> {
  try {
    const supabase = await createServerSupabaseClient();
    const [accounts, joinedWaitlist, pageViews] = await Promise.all([
      supabase.rpc("admin_account_count"),
      supabase.rpc("admin_joined_waitlist_count"),
      supabase.rpc("admin_page_view_count", {
        p_from: new Date(Date.now() - 30 * 86400000).toISOString(),
        p_to: new Date().toISOString(),
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
