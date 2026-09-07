"use client";

import { useEffect, useReducer, useRef } from "react";

import { PLAYBACK_SPEEDS } from "../packet-flow/packet-flow.schema";
import {
  createPlaybackState,
  getStepDelay,
  playbackReducer,
  type PlaybackSpeed,
} from "../packet-flow/playback";
import { useReducedMotionState } from "../packet-flow/use-reduced-motion";
import { layerModelsLab } from "./layer-models.data";
import type { LayerModelsLab } from "./layer-models.schema";

type EncapsulationStep = LayerModelsLab["encapsulationSteps"][number];

type EncapsulationPlayerProps = Readonly<{
  steps: LayerModelsLab["encapsulationSteps"];
}>;

const PDU_BLOCKS = {
  Data: ["Application data"],
  Segment: ["TCP header", "Application data"],
  Packet: ["IPv4 header", "TCP header", "Application data"],
  Frame: ["Ethernet header", "IPv4 header", "TCP header", "Application data", "Ethernet trailer"],
  Bits: ["Physical signals carrying the frame bits"],
} as const;

function titleCaseDirection(direction: EncapsulationStep["direction"]): string {
  return `${direction.charAt(0).toUpperCase()}${direction.slice(1)}`;
}

export function EncapsulationPlayer({ steps }: EncapsulationPlayerProps) {
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const preferenceResolved = useRef(false);
  const playbackReducedMotion = reducedMotion || !isHydrated;
  const [state, dispatch] = useReducer(
    playbackReducer,
    { stepCount: steps.length, reducedMotion: playbackReducedMotion },
    ({ stepCount, reducedMotion: initialReducedMotion }) => createPlaybackState(stepCount, 1, initialReducedMotion),
  );
  const currentStep = steps[state.stepIndex];
  const atFinalStep = state.stepIndex === state.stepCount - 1;

  useEffect(() => {
    if (!isHydrated) return;

    if (!preferenceResolved.current) {
      preferenceResolved.current = true;
      if (!reducedMotion) dispatch({ type: "play" });
      else dispatch({ type: "pause" });
      return;
    }

    if (reducedMotion) {
      dispatch({ type: "pause" });
    }
  }, [isHydrated, reducedMotion]);

  useEffect(() => {
    if (!state.playing || atFinalStep) return;
    const timeoutId = window.setTimeout(
      () => dispatch({ type: "tick" }),
      getStepDelay(currentStep.durationMs, state.speed),
    );
    return () => window.clearTimeout(timeoutId);
  }, [atFinalStep, currentStep.durationMs, state.playing, state.speed, state.stepIndex]);

  const activeOsiName = currentStep.activeOsiLayer === 7
    ? "Application"
    : currentStep.activeOsiLayer === 4
      ? "Transport"
      : currentStep.activeOsiLayer === 3
        ? "Network"
        : currentStep.activeOsiLayer === 2
          ? "Data Link"
          : "Physical";
  const activeTcpIpName = currentStep.activeTcpIpLayer === "network-access"
    ? "Network Access"
    : `${currentStep.activeTcpIpLayer.charAt(0).toUpperCase()}${currentStep.activeTcpIpLayer.slice(1)}`;

  return (
    <section
      className="encapsulation-player"
      aria-label="Encapsulation and decapsulation playback"
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <div className="encapsulation-player__status" role="status" aria-live="polite" aria-atomic="true">
        Step {state.stepIndex + 1} of {state.stepCount}: {currentStep.title}. Current PDU: {currentStep.pdu}.
      </div>

      <div className="encapsulation-player__controls">
        <button type="button" onClick={() => dispatch({ type: "previous" })} disabled={state.stepIndex === 0}>Previous</button>
        <button type="button" onClick={() => dispatch({ type: state.playing ? "pause" : "play" })} disabled={atFinalStep}>
          {state.playing ? "Pause" : "Play"}
        </button>
        <button type="button" onClick={() => dispatch({ type: "next" })} disabled={atFinalStep}>Next</button>
        <button type="button" onClick={() => dispatch({ type: "restart", autoplay: !reducedMotion })}>Restart</button>
        <label>
          Playback speed
          <select
            value={state.speed}
            onChange={(event) => dispatch({ type: "set-speed", speed: Number(event.currentTarget.value) as PlaybackSpeed })}
          >
            {PLAYBACK_SPEEDS.map((speed) => <option key={speed} value={speed}>{speed}×</option>)}
          </select>
        </label>
      </div>

      <div className="encapsulation-player__grid">
        <div className="encapsulation-player__step">
          <p className="encapsulation-player__counter">Step {state.stepIndex + 1} of {state.stepCount}</p>
          <p data-current-direction>{titleCaseDirection(currentStep.direction)}</p>
          <h3>{currentStep.title}</h3>
          <p>{currentStep.plainExplanation}</p>
          <dl className="encapsulation-player__layers">
            <div><dt>Active OSI layer</dt><dd data-active-osi-layer>OSI layer {currentStep.activeOsiLayer} — {activeOsiName}</dd></div>
            <div><dt>Active TCP/IP layer</dt><dd data-active-tcp-ip-layer>TCP/IP {activeTcpIpName} layer</dd></div>
            <div><dt>Current PDU</dt><dd data-current-pdu>{currentStep.pdu}</dd></div>
            <div><dt>{currentStep.direction === "decapsulation" ? "Information examined or removed" : "Information added"}</dt><dd data-added-information>{currentStep.addedInformation}</dd></div>
          </dl>
          <details>
            <summary>Technical details</summary>
            <p>{currentStep.technicalExplanation}</p>
          </details>
        </div>

        <div className="encapsulation-player__visual" data-motion={reducedMotion ? "discrete" : "transition"}>
          <div className="encapsulation-player__visual-content" data-step-id={currentStep.id}>
            <p className="encapsulation-player__visual-title">Visible PDU: <strong>{currentStep.pdu}</strong></p>
            <ul aria-label="Visible protocol data unit">
              {PDU_BLOCKS[currentStep.pdu].map((block) => <li key={block}>{block}</li>)}
            </ul>
          </div>
          <div className="encapsulation-player__decoration" data-encapsulation-decoration="true" aria-hidden="true">
            <span /><span /><span />
          </div>
        </div>
      </div>

      <div className="encapsulation-player__stacks" aria-label="Active layer stacks">
        <div className="encapsulation-player__stack">
          <h3>OSI model — seven-layer stack</h3>
          <ol aria-label="Active OSI seven-layer stack">
            {layerModelsLab.osiLayers.map((layer) => {
              const active = layer.number === currentStep.activeOsiLayer;

              return (
                <li
                  key={layer.number}
                  data-osi-layer={layer.number}
                  data-active={active ? "true" : "false"}
                  aria-current={active ? "step" : undefined}
                >
                  <span>Layer {layer.number}: {layer.name}</span>
                  <span className="encapsulation-player__layer-state">{active ? "Active" : "Standby"}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="encapsulation-player__stack">
          <h3>TCP/IP model — four-layer stack</h3>
          <ol aria-label="Active TCP/IP four-layer stack">
            {layerModelsLab.tcpIpLayers.map((layer) => {
              const active = layer.id === currentStep.activeTcpIpLayer;

              return (
                <li
                  key={layer.id}
                  data-tcp-ip-layer={layer.id}
                  data-active={active ? "true" : "false"}
                  aria-current={active ? "step" : undefined}
                >
                  <span>{layer.name}</span>
                  <span className="encapsulation-player__layer-state">{active ? "Active" : "Standby"}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
