import { createServerSupabaseClient } from "@/lib/supabase/server";

import { getLessonProgressManifest } from "./progress-manifests";
import type { ProgressMutationInput, RestartProgressInput } from "./progress-input.schema";
import type { LessonProgressStatus, LessonProgressSummary } from "./progress.types";

type ProgressAttemptRow = {
  id: string;
  pathway_id: string;
  lesson_id: string;
  content_version: number;
  attempt_number: number;
  status: LessonProgressStatus;
  completed_item_ids: string[];
  next_item_id: string | null;
  last_item_id: string | null;
  last_anchor: string | null;
  completion_percent: number;
  incorrect_check_count: number;
  updated_at: string;
};

export type ProgressMutationResult =
  | { ok: true; progress: LessonProgressSummary }
  | { ok: false; code: "unauthenticated" | "invalid_item" | "stale_version" | "unavailable" };

function mapRow(row: ProgressAttemptRow): LessonProgressSummary {
  return {
    attemptId: row.id, pathwayId: row.pathway_id, lessonId: row.lesson_id,
    contentVersion: row.content_version, attemptNumber: row.attempt_number,
    status: row.status, completedItemIds: row.completed_item_ids,
    nextItemId: row.next_item_id, lastItemId: row.last_item_id,
    lastAnchor: row.last_anchor, completionPercent: row.completion_percent,
    incorrectCheckCount: row.incorrect_check_count, updatedAt: row.updated_at,
  };
}

export async function getLessonProgress(
  userId: string,
  pathwayId: string,
  lessonId: string,
): Promise<LessonProgressSummary | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("learner_lesson_attempts").select("*")
    .eq("user_id", userId).eq("pathway_id", pathwayId).eq("lesson_id", lessonId)
    .eq("is_current", true).maybeSingle();
  if (error) throw new Error("Progress is unavailable.");
  return data ? mapRow(data as ProgressAttemptRow) : null;
}

export async function listPathwayProgress(
  userId: string,
  pathwayId: string,
): Promise<LessonProgressSummary[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("learner_lesson_attempts").select("*")
    .eq("user_id", userId).eq("pathway_id", pathwayId).eq("is_current", true)
    .order("updated_at", { ascending: false });
  if (error) throw new Error("Progress is unavailable.");
  return (data ?? []).map((row) => mapRow(row as ProgressAttemptRow));
}

function validateKnownItem(input: ProgressMutationInput) {
  let manifest;
  try {
    manifest = getLessonProgressManifest(input.pathwayId, input.lessonId);
  } catch {
    return "invalid_item" as const;
  }
  if (manifest.contentVersion !== input.contentVersion) return "stale_version" as const;
  const item = manifest.items.find(({ itemId }) => itemId === input.itemId);
  if (!item || item.kind !== input.itemKind || item.anchor !== input.anchor) return "invalid_item" as const;
  return null;
}

function mapProviderError(message: string | undefined): ProgressMutationResult {
  if (message?.includes("stale_content_version")) return { ok: false, code: "stale_version" };
  if (message?.includes("unknown_progress_item") || message?.includes("progress_item_mismatch")) {
    return { ok: false, code: "invalid_item" };
  }
  return { ok: false, code: "unavailable" };
}

export async function recordLearnerProgress(input: ProgressMutationInput): Promise<ProgressMutationResult> {
  const invalid = validateKnownItem(input);
  if (invalid) return { ok: false, code: invalid };
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("record_learner_progress_event", {
    p_pathway_id: input.pathwayId, p_lesson_id: input.lessonId,
    p_content_version: input.contentVersion, p_idempotency_key: input.idempotencyKey,
    p_event_type: input.eventType, p_item_id: input.itemId, p_item_kind: input.itemKind,
    p_anchor: input.anchor, p_answer_correct: input.answerCorrect ?? null, p_metadata: input.metadata,
  });
  if (error || !data) return mapProviderError(error?.message);
  return { ok: true, progress: mapRow(data as ProgressAttemptRow) };
}

export async function restartLearnerProgress(input: RestartProgressInput): Promise<ProgressMutationResult> {
  let manifest;
  try { manifest = getLessonProgressManifest(input.pathwayId, input.lessonId); }
  catch { return { ok: false, code: "invalid_item" }; }
  if (manifest.contentVersion !== input.contentVersion) return { ok: false, code: "stale_version" };
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("restart_learner_lesson", {
    p_pathway_id: input.pathwayId, p_lesson_id: input.lessonId,
    p_content_version: input.contentVersion, p_idempotency_key: input.idempotencyKey,
  });
  if (error || !data) return mapProviderError(error?.message);
  return { ok: true, progress: mapRow(data as ProgressAttemptRow) };
}
