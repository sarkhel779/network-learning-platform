import { getLessonProgressManifest } from "./progress-manifests";
import type { ProgressMutationInput, RestartProgressInput } from "./progress-input.schema";
import type { LessonProgressSummary } from "./progress.types";

type TestEnv = Partial<Record<"NODE_ENV" | "PLAYWRIGHT_TEST_SESSION" | "PACKETSECRETS_TEST_ENV", string>>;
type State = Map<string, LessonProgressSummary>;

const state = (globalThis as typeof globalThis & { __packetsecretsProgressTestState?: State });
const attempts = state.__packetsecretsProgressTestState ??= new Map();
const key = (userId: string, pathwayId: string, lessonId: string) => `${userId}:${pathwayId}:${lessonId}`;

export const isProgressTestAdapterEnabled = (env: TestEnv) =>
  (env.NODE_ENV === "test" || env.NODE_ENV === "development") &&
  env.PLAYWRIGHT_TEST_SESSION === "1" &&
  env.PACKETSECRETS_TEST_ENV === "test";

export function listTestProgress(userId: string, pathwayId: string) {
  return [...attempts.entries()].filter(([entry]) => entry.startsWith(`${userId}:${pathwayId}:`)).map(([, value]) => value).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function recordTestProgress(userId: string, input: ProgressMutationInput): LessonProgressSummary | null {
  if (input.metadata.simulateFailure === true) return null;
  const manifest = getLessonProgressManifest(input.pathwayId, input.lessonId);
  const entryKey = key(userId, input.pathwayId, input.lessonId);
  const previous = attempts.get(entryKey);
  const completed = new Set(previous?.completedItemIds ?? []);
  const item = manifest.items.find(({ itemId }) => itemId === input.itemId);
  if (item?.required && input.itemKind === "knowledge_check" && input.answerCorrect) completed.add(input.itemId);
  const requiredItems = manifest.items.filter(({ required }) => required);
  const completedItemIds = requiredItems.filter(({ itemId }) => completed.has(itemId)).map(({ itemId }) => itemId);
  const next = requiredItems.find(({ itemId }) => !completed.has(itemId));
  const status = next ? "in_progress" as const : "completed" as const;
  const summary: LessonProgressSummary = {
    attemptId: previous?.attemptId ?? crypto.randomUUID(), pathwayId: input.pathwayId, lessonId: input.lessonId,
    contentVersion: input.contentVersion, attemptNumber: previous?.attemptNumber ?? 1, status, completedItemIds,
    nextItemId: next?.itemId ?? null, lastItemId: input.itemId, lastAnchor: input.anchor,
    completionPercent: Math.floor(completedItemIds.length * 100 / requiredItems.length),
    incorrectCheckCount: (previous?.incorrectCheckCount ?? 0) + (input.itemKind === "knowledge_check" && !input.answerCorrect ? 1 : 0),
    updatedAt: new Date().toISOString(),
  };
  attempts.set(entryKey, summary);
  return summary;
}

export function restartTestProgress(userId: string, input: RestartProgressInput): LessonProgressSummary {
  const entryKey = key(userId, input.pathwayId, input.lessonId);
  const previous = attempts.get(entryKey);
  const manifest = getLessonProgressManifest(input.pathwayId, input.lessonId);
  const summary: LessonProgressSummary = {
    attemptId: crypto.randomUUID(), pathwayId: input.pathwayId, lessonId: input.lessonId, contentVersion: input.contentVersion,
    attemptNumber: (previous?.attemptNumber ?? 0) + 1, status: "in_progress", completedItemIds: [], nextItemId: manifest.items[0]?.itemId ?? null,
    lastItemId: null, lastAnchor: manifest.items[0]?.anchor ?? null, completionPercent: 0, incorrectCheckCount: 0, updatedAt: new Date().toISOString(),
  };
  attempts.set(entryKey, summary);
  return summary;
}
