"use client";

import { useCallback, useEffect, useRef } from "react";

import { useOptionalLessonProgressItem } from "./lesson-progress-context";

export function useProgressCompletionBoundary(progressItemId?: string, attemptKey?: string) {
  const progress = useOptionalLessonProgressItem(progressItemId ?? "__untracked_interactive__");
  const terminalReached = useRef(false);
  useEffect(() => { terminalReached.current = false; }, [attemptKey]);
  const markTerminalStateReached = useCallback(() => {
    if (!progressItemId || terminalReached.current) return;
    terminalReached.current = true;
    void progress.complete({ eventType: "interactive_completed" });
  }, [progress, progressItemId]);
  return { markTerminalStateReached, state: progress.state, retry: progress.retry };
}
