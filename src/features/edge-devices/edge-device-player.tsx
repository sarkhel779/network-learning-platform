"use client";

import { useEffect, useReducer, useRef, useState } from "react";

import { NetworkDeviceSymbol } from "@/features/packet-flow/network-device-symbol";
import { PlaybackControls } from "@/features/packet-flow/playback-controls";
import { createPlaybackState, getStepDelay, playbackReducer } from "@/features/packet-flow/playback";
import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";

import { edgeDeviceJourneys, getEdgeDeviceJourney, type EdgeDeviceKind } from "./edge-device-journeys";

const stageDurationMs = 1700;

function symbolKind(kind: EdgeDeviceKind) {
  return kind;
}

function Journey({ journeyId, onComplete }: { journeyId: string; onComplete: () => void }) {
  const journey = getEdgeDeviceJourney(journeyId);
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const preferenceResolved = useRef(false);
  const [state, dispatch] = useReducer(playbackReducer, { count: journey.stages.length, reduced: reducedMotion || !isHydrated }, ({ count, reduced }) => createPlaybackState(count, 1, reduced));
  const stage = journey.stages[state.stepIndex];
  const device = journey.devices.find(({ id }) => id === stage.activeDeviceId)!;
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
    if (atFinal) onComplete();
  }, [atFinal, onComplete]);

  return (
    <section aria-label={`Edge device packet journey: ${journey.title}`} className="edge-device-journey">
      <ol className="edge-device-topology" aria-label={`${journey.title} device order`}>
        {journey.devices.map((item, index) => (
          <li data-active={item.id === stage.activeDeviceId || undefined} key={item.id}>
            <svg aria-hidden="true" viewBox="-40 -35 80 70"><NetworkDeviceSymbol kind={symbolKind(item.kind)} /></svg>
            <strong>{item.label}</strong>
            <span>{item.interfaceLabel}</span>
            {item.id === stage.activeDeviceId ? <span aria-hidden="true" className="edge-device-topology__packet-marker">packet</span> : null}
            {index < journey.devices.length - 1 ? <span aria-hidden="true" className="edge-device-topology__link">→</span> : null}
          </li>
        ))}
      </ol>

      <div aria-label="Packet contents at the current hop" className="edge-device-packet" data-stage={stage.role} role="img">
        <div><strong>Local-link frame</strong><div><strong>IP packet</strong><div><strong>Application data</strong></div></div></div>
      </div>
      <PlaybackControls state={state} dispatch={dispatch} reducedMotion={reducedMotion} restartLabel={atFinal ? "Replay" : "Restart"} />
      <div aria-live="polite" className="edge-device-progress">
        <p>Stage {state.stepIndex + 1} of {state.stepCount}</p>
        <h3>{stage.title}</h3>
        <p>{stage.explanation}</p>
        <p><strong>Inside the packet:</strong> {stage.packetView}</p>
      </div>
      <section aria-label="What this device does" className="edge-device-role-card">
        <h3>{device.label}</h3>
        <p><strong>Interface:</strong> {device.interfaceLabel}</p>
        <p>{stage.changesPacketAddressing ? "This role changes packet addressing." : "This step does not change the packet's end-to-end IP addresses."}</p>
      </section>
    </section>
  );
}

export function EdgeDevicePlayer({ progressItemId }: { progressItemId?: string }) {
  const { markTerminalStateReached } = useProgressCompletionBoundary(progressItemId);
  const [journeyId, setJourneyId] = useState(edgeDeviceJourneys[0].id);
  return (
    <section aria-labelledby="edge-device-player-title" className="edge-device-player">
      <h3 id="edge-device-player-title">Follow traffic across the network edge</h3>
      <p>Select a layout, then watch each device perform only its own role.</p>
      <fieldset><legend>Choose an edge layout</legend>{edgeDeviceJourneys.map((journey) => (
        <label key={journey.id}><input checked={journey.id === journeyId} name="edge-layout" onChange={() => setJourneyId(journey.id)} type="radio" />{journey.title}</label>
      ))}</fieldset>
      <Journey journeyId={journeyId} key={journeyId} onComplete={markTerminalStateReached} />
    </section>
  );
}
