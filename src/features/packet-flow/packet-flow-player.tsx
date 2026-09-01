"use client";

import { useEffect, useReducer } from "react";

import { NetworkTopology } from "./network-topology";
import { PacketInspector } from "./packet-inspector";
import type { PacketFlowScenario } from "./packet-flow.schema";
import { PlaybackControls } from "./playback-controls";
import { createPlaybackState, getStepDelay, playbackReducer } from "./playback";
import { useReducedMotion } from "./use-reduced-motion";

type PacketFlowPlayerProps = Readonly<{
  scenario: PacketFlowScenario;
  headingId?: string;
  suppressHeading?: boolean;
  selectedDeviceId?: string;
  onDeviceSelect?: (deviceId: string) => void;
  autoplay?: boolean;
}>;

export function PacketFlowPlayer({
  scenario,
  headingId,
  suppressHeading = false,
  selectedDeviceId,
  onDeviceSelect,
  autoplay = true,
}: PacketFlowPlayerProps) {
  const reducedMotion = useReducedMotion();
  const [state, dispatch] = useReducer(
    playbackReducer,
    { stepCount: scenario.steps.length, defaultSpeed: scenario.defaultSpeed, reducedMotion, autoplay },
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
    if (reducedMotion) dispatch({ type: "pause" });
  }, [reducedMotion]);

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
        <PacketInspector step={currentStep} />
      </div>
    </section>
  );
}
