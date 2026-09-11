import { createServerSupabaseClient } from "@/lib/supabase/server";

import { isPublishedLessonSlug, type WaitlistJoinInput } from "./waitlist-input.schema";
import {
  WAITLIST_CONSENT_VERSION,
  type WaitlistEntry,
  type WaitlistResult,
} from "./waitlist.types";

type WaitlistRow = {
  user_id: string;
  status: "joined" | "unsubscribed";
  source_lesson_slug: string | null;
  consent_version: string;
  consented_at: string;
  unsubscribed_at: string | null;
};

function mapOwnedRow(row: WaitlistRow, userId: string): WaitlistEntry | null {
  if (row.user_id !== userId) return null;
  return {
    status: row.status,
    sourceLessonSlug: row.source_lesson_slug,
    consentVersion: row.consent_version,
    consentedAt: row.consented_at,
    unsubscribedAt: row.unsubscribed_at,
  };
}

function mapMutation(row: unknown, userId: string): WaitlistResult {
  if (!row || typeof row !== "object") return { ok: false, code: "unavailable" };
  const entry = mapOwnedRow(row as WaitlistRow, userId);
  return entry ? { ok: true, entry } : { ok: false, code: "unavailable" };
}

export async function getWaitlistStatus(userId: string): Promise<WaitlistResult> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("pro_waitlist_entries")
    .select("user_id,status,source_lesson_slug,consent_version,consented_at,unsubscribed_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return { ok: false, code: "unavailable" };
  if (!data) return { ok: true, entry: null };
  return mapMutation(data, userId);
}

export async function joinWaitlist(
  userId: string,
  input: WaitlistJoinInput,
): Promise<WaitlistResult> {
  if (input.sourceLessonSlug && !isPublishedLessonSlug(input.sourceLessonSlug)) {
    return { ok: false, code: "invalid_source" };
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("join_pro_waitlist", {
    p_consent: true,
    p_consent_version: WAITLIST_CONSENT_VERSION,
    p_source_lesson_slug: input.sourceLessonSlug ?? null,
  });
  if (error) return { ok: false, code: "unavailable" };
  return mapMutation(data, userId);
}

export async function leaveWaitlist(userId: string): Promise<WaitlistResult> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("leave_pro_waitlist");
  if (error) return { ok: false, code: "unavailable" };
  return mapMutation(data, userId);
}
