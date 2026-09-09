"use client";

import { useCallback, useRef } from "react";

import { useOptionalLessonProgressItem } from "./lesson-progress-context";

export function useProgressCompletionBoundary(progressItemId?: string) {
  const progress = useOptionalLessonProgressItem(progressItemId ?? "__untracked_interactive__");
  const terminalReached = useRef(false);
  const markTerminalStateReached = useCallback(() => {
    if (!progressItemId || terminalReached.current) return;
    terminalReached.current = true;
    void progress.complete({ eventType: "interactive_completed" });
  }, [progress, progressItemId]);
  return { markTerminalStateReached, state: progress.state, retry: progress.retry };
}
