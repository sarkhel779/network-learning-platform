"use client";

import { useState } from "react";

import { useLessonProgress } from "./lesson-progress-context";
import { focusLessonAnchor } from "./progress-navigation";

export function LessonProgressControls() {
  const { authoritativeProgress, optimisticCompletionPercent, manifest, restartLesson } = useLessonProgress();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [restarting, setRestarting] = useState(false);
  const nextItem = manifest.items.find(({ itemId }) => itemId === authoritativeProgress?.nextItemId);

  const navigate = (anchor: string | null | undefined) => {
    setMessage("");
    if (!anchor || !focusLessonAnchor(anchor)) setMessage("That lesson position is no longer available.");
  };

  const confirmRestart = async () => {
    setRestarting(true);
    setMessage("");
    try {
      await restartLesson();
      setConfirming(false);
      setMessage("A new lesson attempt has started.");
    } catch {
      setMessage("The lesson could not be restarted. Try again.");
    } finally { setRestarting(false); }
  };

  return (
    <section className="lesson-progress-controls" aria-label="Lesson progress">
      <p><strong>{optimisticCompletionPercent}% complete</strong></p>
      <div className="lesson-progress-controls__actions">
        {authoritativeProgress?.lastAnchor ? <button type="button" onClick={() => navigate(authoritativeProgress.lastAnchor)}>Resume where you left off</button> : null}
        {nextItem ? <button type="button" onClick={() => navigate(nextItem.anchor)}>Go to next incomplete item</button> : null}
        <button type="button" onClick={() => setConfirming(true)}>Restart lesson</button>
      </div>
      {message ? <p role="status">{message}</p> : null}
      {confirming ? (
        <div role="dialog" aria-modal="true" aria-labelledby="restart-lesson-title" className="lesson-progress-controls__dialog">
          <h2 id="restart-lesson-title">Restart lesson?</h2>
          <p>This starts a new attempt at 0%. Your previous attempts and answers remain in your history.</p>
          <button type="button" onClick={() => void confirmRestart()} disabled={restarting}>{restarting ? "Restarting…" : "Confirm restart"}</button>
          <button type="button" onClick={() => setConfirming(false)} disabled={restarting}>Cancel</button>
        </div>
      ) : null}
    </section>
  );
}
