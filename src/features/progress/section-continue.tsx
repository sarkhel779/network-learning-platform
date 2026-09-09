"use client";

import { useState } from "react";

import { useLessonProgress, useLessonProgressItem } from "./lesson-progress-context";
import { focusLessonAnchor } from "./progress-navigation";

export function SectionContinue({ itemId, anchor: _anchor }: { itemId: string; anchor: string }) {
  const { manifest } = useLessonProgress();
  const { state, complete, retry } = useLessonProgressItem(itemId);
  const [navigationUnavailable, setNavigationUnavailable] = useState(false);
  const index = manifest.items.findIndex((item) => item.itemId === itemId);
  const item = manifest.items[index];
  if (!item) throw new Error(`Unknown progress item: ${itemId}`);

  const continueLesson = async () => {
    setNavigationUnavailable(false);
    const saved = await complete();
    if (saved === false) return;
    const next = manifest.items[index + 1];
    if (next && !focusLessonAnchor(next.anchor)) setNavigationUnavailable(true);
  };

  return (
    <div className="section-continue" data-anchor={_anchor}>
      <button type="button" onClick={() => void continueLesson()} disabled={state === "saving" || state === "saved"}>
        {state === "saving" ? "Saving…" : `Continue: ${item.label}`}
      </button>
      {state === "saved" ? <span role="status">Saved</span> : null}
      {state === "error" ? <><span role="alert">Progress was not saved.</span><button type="button" onClick={() => void retry()}>Retry saving</button></> : null}
      {navigationUnavailable ? <span role="status">The next lesson item is no longer available.</span> : null}
    </div>
  );
}
