"use client";

import { useEffect, useRef } from "react";

import { useLessonProgress, useLessonProgressItem, useOptionalLessonProgress } from "./lesson-progress-context";

export function SectionContinue({ itemId, anchor: _anchor }: { itemId: string; anchor: string }) {
  const progress = useOptionalLessonProgress();
  if (!progress) return null;
  return <TrackedSectionContinue itemId={itemId} anchor={_anchor} />;
}

function TrackedSectionContinue({ itemId, anchor: _anchor }: { itemId: string; anchor: string }) {
  const { manifest } = useLessonProgress();
  const { state, complete, retry } = useLessonProgressItem(itemId);
  const markerRef = useRef<HTMLDivElement>(null);
  const completeRef = useRef(complete);
  completeRef.current = complete;
  const item = manifest.items.find((candidate) => candidate.itemId === itemId);
  if (!item) throw new Error(`Unknown progress item: ${itemId}`);

  useEffect(() => {
    if (state !== "idle" || !markerRef.current) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (timer) clearTimeout(timer);
      if (entry.isIntersecting) {
        timer = setTimeout(() => {
          observer.disconnect();
          void completeRef.current();
        }, 1000);
      }
    });
    observer.observe(markerRef.current);
    return () => { if (timer) clearTimeout(timer); observer.disconnect(); };
  }, [state]);

  return (
    <div className="section-continue" data-anchor={_anchor} ref={markerRef}>
      {state === "saving" ? <span role="status">Saving lesson progress…</span> : null}
      {state === "saved" ? <span role="status">Progress saved</span> : null}
      {state === "error" ? <><span role="alert">Progress was not saved.</span><button type="button" onClick={() => void retry()}>Retry saving</button></> : null}
    </div>
  );
}
