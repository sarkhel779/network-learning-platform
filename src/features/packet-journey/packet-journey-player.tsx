"use client";

import { useEffect, useReducer, useRef } from "react";

import { PlaybackControls } from "@/features/packet-flow/playback-controls";
import { createPlaybackState, getStepDelay, playbackReducer } from "@/features/packet-flow/playback";
import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";

import { PacketJourneyStageView } from "./packet-journey-stage";
import type { PacketJourney } from "./packet-journey.types";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";

const stageDurationMs = 1400;

function JourneyPlayback({ journey, progressItemId }: { journey: PacketJourney; progressItemId?: string }) {
  const { markTerminalStateReached } = useProgressCompletionBoundary(progressItemId);
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const preferenceResolved = useRef(false);
  const [state, dispatch] = useReducer(
    playbackReducer,
    { count: journey.stages.length, reduced: reducedMotion || !isHydrated },
    ({ count, reduced }) => createPlaybackState(count, 1, reduced),
  );
  const stage = journey.stages[state.stepIndex];
  const atFinal = state.stepIndex === state.stepCount - 1;

  useEffect(() => {
    if (!isHydrated) return;
    if (!preferenceResolved.current) {
      preferenceResolved.current = true;
      dispatch({ type: reducedMotion ? "pause" : "play" });
      return;
    }
    if (reducedMotion) dispatch({ type: "pause" });
  }, [isHydrated, reducedMotion]);

  useEffect(() => {
    if (!state.playing || atFinal || reducedMotion) return;
    const timer = window.setTimeout(() => dispatch({ type: "tick" }), getStepDelay(stageDurationMs, state.speed));
    return () => window.clearTimeout(timer);
  }, [atFinal, reducedMotion, state.playing, state.speed, state.stepIndex]);

  useEffect(() => {
    if (atFinal) markTerminalStateReached();
  }, [atFinal, markTerminalStateReached]);

  return (
    <section aria-label={journey.accessibleName} className="packet-journey-player">
      <PacketJourneyStageView journey={journey} stage={stage} />
      <PlaybackControls state={state} dispatch={dispatch} reducedMotion={reducedMotion} restartLabel={atFinal ? "Replay" : "Restart"} />
      <section aria-atomic="true" aria-live="polite" className="packet-journey-progress">
        <p>Stage {state.stepIndex + 1} of {state.stepCount}</p>
        <h3>{stage.title}</h3>
        <p>{stage.explanation}</p>
        {stage.technicalDetail ? <details><summary>Technical detail</summary><p>{stage.technicalDetail}</p></details> : null}
      </section>
    </section>
  );
}

export function PacketJourneyPlayer({ journey, progressItemId }: { journey: PacketJourney; progressItemId?: string }) {
  return <JourneyPlayback journey={journey} progressItemId={progressItemId} key={journey.id} />;
}
