"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { restartProgress, saveProgress } from "./progress-client";
import type { ProgressMutationInput } from "./progress-input.schema";
import { createPendingProgressStore, type PendingProgressEvent } from "./pending-progress-store";
import type { LessonProgressManifest, LessonProgressSummary } from "./progress.types";

type SaveState = "idle" | "saving" | "saved" | "error";
type CompletionOptions = { eventType?: ProgressMutationInput["eventType"]; answerCorrect?: boolean };
type ContextValue = {
  learnerAttemptKey: string;
  authoritativeProgress: LessonProgressSummary | null;
  optimisticCompletionPercent: number;
  manifest: LessonProgressManifest;
  complete: (itemId: string, options?: CompletionOptions) => Promise<boolean>;
  retry: (itemId: string) => Promise<void>;
  restartLesson: () => Promise<void>;
  states: Readonly<Record<string, SaveState>>;
};

const ProgressContext = createContext<ContextValue | null>(null);

const serverStorage: Storage = {
  length: 0,
  clear() {},
  getItem() { return null; },
  key() { return null; },
  removeItem() {},
  setItem() {},
};

const eventTypeFor = (kind: "section" | "interactive" | "knowledge_check") =>
  kind === "section" ? "section_completed" as const
    : kind === "interactive" ? "interactive_completed" as const
      : "knowledge_check_attempted" as const;

export function LessonProgressProvider({ viewerId, manifest, initialProgress, children }: {
  viewerId: string; manifest: LessonProgressManifest; initialProgress: LessonProgressSummary | null; children: ReactNode;
}) {
  const store = useMemo(() => createPendingProgressStore(
    typeof window === "undefined" ? serverStorage : window.localStorage,
    viewerId,
  ), [viewerId]);
  const [pending, setPending] = useState<PendingProgressEvent[]>(() => store.list());
  const [authoritativeProgress, setAuthoritativeProgress] = useState(initialProgress);
  const [states, setStates] = useState<Record<string, SaveState>>({});
  const activeKeys = useRef(new Map<string, string>());

  const send = useCallback(async (event: PendingProgressEvent) => {
    if (activeKeys.current.get(event.itemId) === event.idempotencyKey) return false;
    activeKeys.current.set(event.itemId, event.idempotencyKey);
    setStates((current) => ({ ...current, [event.itemId]: "saving" }));
    try {
      const result = await saveProgress(event);
      store.remove(event.idempotencyKey);
      setPending(store.list());
      setAuthoritativeProgress(result);
      setStates((current) => ({ ...current, [event.itemId]: "saved" }));
      return true;
    } catch {
      setStates((current) => ({ ...current, [event.itemId]: "error" }));
      return false;
    } finally {
      activeKeys.current.delete(event.itemId);
    }
  }, [store]);

  const flush = useCallback(async (onlyItemId?: string) => {
    for (const event of store.list()) {
      if (!onlyItemId || event.itemId === onlyItemId) await send(event);
    }
  }, [send, store]);

  useEffect(() => {
    void flush();
    const online = () => { void flush(); };
    window.addEventListener("online", online);
    return () => window.removeEventListener("online", online);
  }, [flush]);

  const complete = useCallback(async (itemId: string, options?: CompletionOptions) => {
    if (authoritativeProgress?.completedItemIds.includes(itemId)) return true;
    if (store.list().some((event) => event.itemId === itemId)) return false;
    const item = manifest.items.find((candidate) => candidate.itemId === itemId);
    if (!item) throw new Error(`Unknown progress item: ${itemId}`);
    const eventType = options?.eventType ?? eventTypeFor(item.kind);
    const common = { pathwayId: manifest.pathwayId, lessonId: manifest.lessonId, contentVersion: manifest.contentVersion, idempotencyKey: crypto.randomUUID(), itemId, anchor: item.anchor, metadata: {}, createdAt: new Date().toISOString() };
    const event: PendingProgressEvent = item.kind === "knowledge_check"
      ? { ...common, eventType: "knowledge_check_attempted", itemKind: "knowledge_check", answerCorrect: options?.answerCorrect ?? false }
      : item.kind === "interactive"
        ? { ...common, eventType: "interactive_completed", itemKind: "interactive" }
        : { ...common, eventType: "section_completed", itemKind: "section" };
    if (event.eventType !== eventType) throw new Error("Progress event does not match item kind.");
    store.enqueue(event);
    setPending(store.list());
    return send(event);
  }, [authoritativeProgress, manifest, send, store]);

  const restartLesson = useCallback(async () => {
    const result = await restartProgress({
      pathwayId: manifest.pathwayId,
      lessonId: manifest.lessonId,
      contentVersion: manifest.contentVersion,
      idempotencyKey: crypto.randomUUID(),
    });
    store.clear();
    setPending([]);
    setStates({});
    setAuthoritativeProgress(result);
  }, [manifest, store]);

  const completed = new Set(authoritativeProgress?.completedItemIds ?? []);
  for (const event of pending) {
    if (event.lessonId === manifest.lessonId && manifest.items.some(({ itemId }) => itemId === event.itemId)) completed.add(event.itemId);
  }
  const requiredItems = manifest.items.filter(({ required }) => required);
  const completedRequired = requiredItems.filter(({ itemId }) => completed.has(itemId)).length;
  const optimisticCompletionPercent = Math.floor(completedRequired * 100 / requiredItems.length);
  const learnerAttemptKey = `${viewerId}:${manifest.lessonId}:attempt-${authoritativeProgress?.attemptNumber ?? 1}`;
  const value = useMemo<ContextValue>(() => ({ learnerAttemptKey, authoritativeProgress, optimisticCompletionPercent, manifest, complete, retry: (itemId) => flush(itemId), restartLesson, states }), [learnerAttemptKey, authoritativeProgress, optimisticCompletionPercent, manifest, complete, flush, restartLesson, states]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useLessonProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("Lesson progress is unavailable outside its provider.");
  return context;
}

export function useOptionalLessonProgress() {
  return useContext(ProgressContext);
}

export function useLessonProgressItem(itemId: string) {
  const context = useLessonProgress();
  return {
    state: context.states[itemId] ?? (context.authoritativeProgress?.completedItemIds.includes(itemId) ? "saved" : "idle"),
    complete: (options?: CompletionOptions) => context.complete(itemId, options),
    retry: () => context.retry(itemId),
  };
}

export function useOptionalLessonProgressItem(itemId: string) {
  const context = useContext(ProgressContext);
  if (!context) {
    return {
      state: "idle" as SaveState,
      complete: async () => true,
      retry: async () => undefined,
    };
  }
  return {
    state: context.states[itemId] ?? (context.authoritativeProgress?.completedItemIds.includes(itemId) ? "saved" : "idle"),
    complete: (options?: CompletionOptions) => context.complete(itemId, options),
    retry: () => context.retry(itemId),
  };
}
