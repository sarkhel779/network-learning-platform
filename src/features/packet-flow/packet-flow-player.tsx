"use client";

import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";

import { NetworkTopology } from "./network-topology";
import { PacketInspector } from "./packet-inspector";
import type { PacketFlowScenario } from "./packet-flow.schema";
import { PlaybackControls } from "./playback-controls";
import { createPlaybackState, getStepDelay, playbackReducer, type PlaybackAction } from "./playback";
import { useReducedMotionState } from "./use-reduced-motion";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";

type PacketFlowPlayerProps = Readonly<{
  scenario: PacketFlowScenario;
  headingId?: string;
  suppressHeading?: boolean;
  selectedDeviceId?: string;
  onDeviceSelect?: (deviceId: string) => void;
  deviceStepIndexes?: Readonly<Record<string, number>>;
  autoplay?: boolean;
  inspectionDepthControl?: boolean;
  progressItemId?: string;
  onStepChange?: (stepIndex: number, atFinalStep: boolean) => void;
  electricalSignal?: boolean;
  topologyOverlay?: ReactNode;
  showStepSummary?: boolean;
  packetTravelDurationMs?: number;
  allowMotionOverride?: boolean;
  packetMotion?: "svg" | "dhcp-css";
}>;

export function PacketFlowPlayer({
  scenario,
  headingId,
  suppressHeading = false,
  selectedDeviceId,
  onDeviceSelect,
  deviceStepIndexes,
  autoplay = true,
  inspectionDepthControl = false,
  progressItemId,
  onStepChange,
  electricalSignal = false,
  topologyOverlay,
  showStepSummary = true,
  packetTravelDurationMs,
  allowMotionOverride = false,
  packetMotion = "svg",
}: PacketFlowPlayerProps) {
  const { markTerminalStateReached } = useProgressCompletionBoundary(progressItemId);
  const { reducedMotion: systemReducedMotion, isHydrated } = useReducedMotionState();
  const [forceMotion, setForceMotion] = useState(false);
  const [packetAnimationPaused, setPacketAnimationPaused] = useState(false);
  const reducedMotion = systemReducedMotion && !forceMotion;
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
        setPacketAnimationPaused(false);
        const stepIndex = deviceStepIndexes?.[deviceId];
        dispatch(stepIndex === undefined ? { type: "pause" } : { type: "go-to", stepIndex });
        onDeviceSelect(deviceId);
      }
    : undefined;
  const handlePlaybackAction = (action: PlaybackAction) => {
    if (action.type === "pause") setPacketAnimationPaused(true);
    else if (action.type !== "set-speed") setPacketAnimationPaused(false);
    dispatch(action);
  };

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
      <div className="packet-flow-topology-stage" id={isFirstLesson ? "first-packet-topology" : undefined}>
      <NetworkTopology
        scenario={scenario}
        step={currentStep}
        reducedMotion={reducedMotion}
        electricalSignal={electricalSignal ? { playing: state.playing, speed: state.speed } : undefined}
        selectedDeviceId={selectedDeviceId}
        onDeviceSelect={handleDeviceSelect}
        packetTravelDurationMs={packetTravelDurationMs ? packetTravelDurationMs / state.speed : undefined}
        packetMotion={packetMotion}
        forceMotion={forceMotion}
        packetAnimationPlaying={!packetAnimationPaused}
      />
      {topologyOverlay}
      </div>
      <div id={isFirstLesson ? "first-packet-flow" : undefined}>
      {allowMotionOverride && systemReducedMotion ? (
        <div className="packet-flow-motion-choice">
          <button
            aria-pressed={forceMotion}
            onClick={() => setForceMotion((enabled) => !enabled)}
            type="button"
          >
            {forceMotion ? "Use reduced motion" : "Enable smooth packet motion"}
          </button>
          <span>{forceMotion ? "Full packet animation is enabled." : "Your system currently requests reduced motion."}</span>
        </div>
      ) : null}
      <PlaybackControls state={state} dispatch={handlePlaybackAction} reducedMotion={reducedMotion} />
      </div>
      <div className={`packet-flow-details${showStepSummary ? "" : " packet-flow-details--inspector-only"}`} id={isFirstLesson ? "first-packet-details" : undefined}>
        {showStepSummary ? <section className="packet-flow-progress" aria-live="polite" aria-atomic="true">
          <p>Step {state.stepIndex + 1} of {state.stepCount}</p>
          <h3>{currentStep.title}</h3>
          <p>{currentStep.explanation}</p>
          {currentStep.stateNote ? <p>{currentStep.stateNote}</p> : null}
        </section> : null}
        <PacketInspector allowDepthSelection={inspectionDepthControl} step={currentStep} />
      </div>
    </section>
  );
}
