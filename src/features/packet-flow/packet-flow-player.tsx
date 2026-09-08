"use client";

import { useEffect, useReducer, useRef } from "react";

import { NetworkTopology } from "./network-topology";
import { PacketInspector } from "./packet-inspector";
import type { PacketFlowScenario } from "./packet-flow.schema";
import { PlaybackControls } from "./playback-controls";
import { createPlaybackState, getStepDelay, playbackReducer } from "./playback";
import { useReducedMotionState } from "./use-reduced-motion";

type PacketFlowPlayerProps = Readonly<{
  scenario: PacketFlowScenario;
  headingId?: string;
  suppressHeading?: boolean;
  selectedDeviceId?: string;
  onDeviceSelect?: (deviceId: string) => void;
  autoplay?: boolean;
  inspectionDepthControl?: boolean;
}>;

export function PacketFlowPlayer({
  scenario,
  headingId,
  suppressHeading = false,
  selectedDeviceId,
  onDeviceSelect,
  autoplay = true,
  inspectionDepthControl = false,
}: PacketFlowPlayerProps) {
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const preferenceResolved = useRef(false);
  const playbackReducedMotion = reducedMotion || !isHydrated;
  const [state, dispatch] = useReducer(
    playbackReducer,
    { stepCount: scenario.steps.length, defaultSpeed: scenario.defaultSpeed, reducedMotion: playbackReducedMotion, autoplay },
    ({ stepCount, defaultSpeed, reducedMotion: initialReducedMotion, autoplay: initialAutoplay }) => ({
      ...createPlaybackState(stepCount, defaultSpeed, initialReducedMotion),
      playing: initialAutoplay && !initialReducedMotion,
    }),
  );
  const currentStep = scenario.steps[state.stepIndex];
  const atFinalStep = state.stepIndex === state.stepCount - 1;
  const resolvedHeadingId = headingId ?? `${scenario.id}-title`;
  const handleDeviceSelect = onDeviceSelect
    ? (deviceId: string) => {
        dispatch({ type: "pause" });
        onDeviceSelect(deviceId);
      }
    : undefined;

  useEffect(() => {
    if (!isHydrated) return;

    if (!preferenceResolved.current) {
      preferenceResolved.current = true;
      if (!reducedMotion && autoplay) dispatch({ type: "play" });
      else dispatch({ type: "pause" });
      return;
    }

    if (reducedMotion) {
      dispatch({ type: "pause" });
    }
  }, [autoplay, isHydrated, reducedMotion]);

  useEffect(() => {
    if (!state.playing || atFinalStep) return;

    const timeoutId = window.setTimeout(() => dispatch({ type: "tick" }), getStepDelay(currentStep.durationMs, state.speed));
    return () => window.clearTimeout(timeoutId);
  }, [atFinalStep, currentStep.durationMs, reducedMotion, state.playing, state.speed, state.stepIndex]);

  return (
    <section className="packet-flow" aria-labelledby={resolvedHeadingId}>
      {suppressHeading ? null : <h2 id={resolvedHeadingId}>Interactive packet journey</h2>}
      <p>{scenario.description}</p>
      <NetworkTopology
        scenario={scenario}
        step={currentStep}
        reducedMotion={reducedMotion}
        selectedDeviceId={selectedDeviceId}
        onDeviceSelect={handleDeviceSelect}
      />
      <PlaybackControls state={state} dispatch={dispatch} reducedMotion={reducedMotion} />
      <div className="packet-flow-details">
        <section className="packet-flow-progress" aria-live="polite" aria-atomic="true">
          <p>Step {state.stepIndex + 1} of {state.stepCount}</p>
          <h3>{currentStep.title}</h3>
          <p>{currentStep.explanation}</p>
          {currentStep.stateNote ? <p>{currentStep.stateNote}</p> : null}
        </section>
        <PacketInspector allowDepthSelection={inspectionDepthControl} step={currentStep} />
      </div>
    </section>
  );
}
