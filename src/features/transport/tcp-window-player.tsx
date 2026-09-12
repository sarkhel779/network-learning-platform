"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";
import { TransportPacketTrack } from "./transport-packet-track";
import { TransportPlayerControls } from "./transport-player-controls";
import { buildTcpWindowJourney, type TcpWindowScenario } from "./tcp-window-model";

const scenarios: { id: TcpWindowScenario; label: string }[] = [
  { id: "normal", label: "Normal sliding window" },
  { id: "fast-retransmit", label: "Loss, SACK and fast retransmit" },
  { id: "timeout", label: "Loss and timeout" },
];

export function TcpWindowPlayer({ progressItemId }: { progressItemId?: string }) {
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const preferenceResolved = useRef(false);
  const { markTerminalStateReached, state, retry } = useProgressCompletionBoundary(progressItemId);
  const [scenario, setScenario] = useState<TcpWindowScenario>("normal");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const steps = buildTcpWindowJourney(scenario);
  const step = steps[index];

  useEffect(() => {
    if (!isHydrated) return;
    if (!preferenceResolved.current) { preferenceResolved.current = true; setPlaying(!reducedMotion); return; }
    if (reducedMotion) setPlaying(false);
  }, [isHydrated, reducedMotion]);
  useEffect(() => {
    if (!playing || index >= steps.length - 1) return;
    const timer = window.setTimeout(() => setIndex((current) => current + 1), 2100 / speed);
    return () => window.clearTimeout(timer);
  }, [index, playing, speed, steps.length]);
  useEffect(() => { if (step.terminal) markTerminalStateReached(); }, [markTerminalStateReached, step.terminal]);

  const reset = (nextScenario: TcpWindowScenario) => { setScenario(nextScenario); setIndex(0); setPlaying(!reducedMotion); };
  return <section className="transport-player tcp-window-player" aria-labelledby="tcp-window-title">
    <h3 id="tcp-window-title">See TCP’s byte window move</h3>
    <p>The numbered markers show byte positions in the TCP stream. Move one step at a time or play the complete packet flow.</p>
    <fieldset><legend>Choose a packet flow</legend>{scenarios.map((choice) => <label key={choice.id}>
      <input type="radio" name="tcp-window-scenario" checked={scenario === choice.id} onChange={() => reset(choice.id)} />{choice.label}
    </label>)}</fieldset>
    <div className="tcp-window-topology" aria-label="TCP packet path">
      <div className="tcp-window-device"><span aria-hidden="true">▣</span><strong>Sender</strong></div>
      <div className="tcp-window-path"><strong>{step.packet}</strong><TransportPacketTrack stepId={step.id} direction={step.direction} /></div>
      <div className="tcp-window-device"><span aria-hidden="true">▤</span><strong>Receiver</strong></div>
    </div>
    <TransportPlayerControls finalIndex={steps.length - 1} playing={playing} stepIndex={index} speed={speed}
      onNext={() => { setPlaying(false); setIndex((current) => Math.min(current + 1, steps.length - 1)); }}
      onPrevious={() => { setPlaying(false); setIndex((current) => Math.max(0, current - 1)); }}
      onRestart={() => { setIndex(0); setPlaying(!reducedMotion); }}
      onTogglePlay={() => setPlaying((current) => !current)} onSpeedChange={setSpeed} />
    <p role="status" aria-live="polite">Step {index + 1} of {steps.length}: {step.title}</p>
    <p>{step.explanation}</p>
    <div className="tcp-window-byte-strip" role="group" aria-label="TCP byte window">
      <div className="tcp-window-byte-strip__range" aria-hidden="true"><span>1001</span><span>1201</span><span>1401</span><span>1601</span><span>1801</span><span>2001</span></div>
      <div className="tcp-window-byte-strip__bar" aria-hidden="true"><span className="tcp-window-byte-strip__active" style={{ left: `${(step.sendLeft - 1001) / 10}%`, width: `${(step.sendRight - step.sendLeft) / 10}%` }} /></div>
      <dl>
        <div><dt>Sender window left edge</dt><dd>{step.sendLeft} — oldest unacknowledged byte</dd></div>
        <div><dt>Next byte to send</dt><dd>{step.nextToSend}</dd></div>
        <div><dt>Sender window right edge</dt><dd>{step.sendRight} — first byte outside this window</dd></div>
        <div><dt>Cumulative ACK</dt><dd>{step.cumulativeAck} — next missing byte</dd></div>
        <div><dt>Duplicate ACK count</dt><dd>{step.duplicateAcks}</dd></div>
      </dl>
    </div>
    <div className="tcp-window-sack" aria-label="SACK blocks">
      <h4>SACK: received bytes beyond a gap</h4>
      {step.sackBlocks.length ? step.sackBlocks.map((block) => <dl key={`${block.left}-${block.right}`}>
        <div><dt>SACK block left edge</dt><dd>{block.left} — first received byte</dd></div>
        <div><dt>SACK block right edge</dt><dd>{block.right} — byte after the last received byte</dd></div>
      </dl>) : <p>SACK block left edge and SACK block right edge appear when later bytes arrive out of order.</p>}
    </div>
    {state === "error" ? <button type="button" onClick={retry}>Retry saving progress</button> : null}
  </section>;
}
