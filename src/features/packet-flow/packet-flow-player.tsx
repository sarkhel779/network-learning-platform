"use client";

import { useEffect, useReducer, useRef } from "react";

import { NetworkTopology } from "./network-topology";
import { PacketInspector } from "./packet-inspector";
import type { PacketFlowScenario } from "./packet-flow.schema";
import { PlaybackControls } from "./playback-controls";
import { createPlaybackState, getStepDelay, playbackReducer } from "./playback";
import { useReducedMotionState } from "./use-reduced-motion";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";

type PacketFlowPlayerProps = Readonly<{
  scenario: PacketFlowScenario;
  headingId?: string;
  suppressHeading?: boolean;
  selectedDeviceId?: string;
  onDeviceSelect?: (deviceId: string) => void;
  autoplay?: boolean;
  inspectionDepthControl?: boolean;
  progressItemId?: string;
  onStepChange?: (stepIndex: number, atFinalStep: boolean) => void;
}>;

export function PacketFlowPlayer({
  scenario,
  headingId,
  suppressHeading = false,
  selectedDeviceId,
  onDeviceSelect,
  autoplay = true,
  inspectionDepthControl = false,
  progressItemId,
  onStepChange,
}: PacketFlowPlayerProps) {
  const { markTerminalStateReached } = useProgressCompletionBoundary(progressItemId);
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
  const isFirstLesson = scenario.id === "network-communication-arp-icmp";
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

  useEffect(() => {
    if (atFinalStep) markTerminalStateReached();
  }, [atFinalStep, markTerminalStateReached]);

  useEffect(() => { onStepChange?.(state.stepIndex, atFinalStep); }, [atFinalStep, onStepChange, state.stepIndex]);

  return (
    <section
      className={isFirstLesson ? "packet-flow packet-flow--first-lesson" : "packet-flow"}
      {...(suppressHeading && !headingId
        ? { "aria-label": scenario.title }
        : { "aria-labelledby": resolvedHeadingId })}
    >
      {suppressHeading ? null : <h2 id={resolvedHeadingId}>Interactive packet journey</h2>}
      <p>{scenario.description}</p>
      {isFirstLesson ? <nav aria-label="Packet lab sections" className="first-lesson-lab-nav"><a href="#first-packet-topology">Lab topology</a><a href="#first-packet-flow">Packet flow</a><a href="#first-packet-details">Packet details</a></nav> : null}
      <div id={isFirstLesson ? "first-packet-topology" : undefined}>
      <NetworkTopology
        scenario={scenario}
        step={currentStep}
        reducedMotion={reducedMotion}
        selectedDeviceId={selectedDeviceId}
        onDeviceSelect={handleDeviceSelect}
      />
      </div>
      <div id={isFirstLesson ? "first-packet-flow" : undefined}>
      <PlaybackControls state={state} dispatch={dispatch} reducedMotion={reducedMotion} />
      </div>
      <div className="packet-flow-details" id={isFirstLesson ? "first-packet-details" : undefined}>
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
