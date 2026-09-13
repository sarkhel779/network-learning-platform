"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotionState } from "@/features/packet-flow/use-reduced-motion";
import { useProgressCompletionBoundary } from "@/features/progress/progress-completion-boundary";
import { TransportPacketTrack } from "./transport-packet-track";
import { TransportPlayerControls } from "./transport-player-controls";
import { buildTcpWindowJourney } from "./tcp-window-model";

const steps = buildTcpWindowJourney("fast-retransmit").slice(3);

export function TcpFastRetransmitPlayer({ progressItemId }: { progressItemId?: string }) {
  const { reducedMotion, isHydrated } = useReducedMotionState();
  const preferenceResolved = useRef(false);
  const { markTerminalStateReached, state, retry } = useProgressCompletionBoundary(progressItemId);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const step = steps[index];

  useEffect(() => {
    if (!isHydrated) return;
    if (!preferenceResolved.current) { preferenceResolved.current = true; setPlaying(!reducedMotion); return; }
    if (reducedMotion) setPlaying(false);
  }, [isHydrated, reducedMotion]);
  useEffect(() => {
    if (!playing || index >= steps.length - 1) return;
    const timer = window.setTimeout(() => setIndex((current) => current + 1), 2200 / speed);
    return () => window.clearTimeout(timer);
  }, [index, playing, speed]);
  useEffect(() => { if (step.terminal) markTerminalStateReached(); }, [markTerminalStateReached, step.terminal]);

  const block = step.sackBlocks[0];
  return <section className="transport-player tcp-fast-player" aria-labelledby="tcp-fast-title">
    <h3 id="tcp-fast-title">Watch fast retransmit repair a missing segment</h3>
    <p>Time runs downward. Segment 4 (bytes 1101–1200) is lost; segments 5–7 arrive above the gap. Each sends a duplicate ACK back toward the sender.</p>
    <div className="tcp-fast-timeline" role="group" aria-label="Fast retransmit packet timeline">
      <div className="tcp-fast-timeline__heads"><strong>Sender</strong><strong>Receiver</strong></div>
      <ol>{steps.map((event, eventIndex) => <li key={event.id} data-active={index === eventIndex} data-direction={event.direction} data-lost={event.id === "missing-send"}>
        <span>{event.packet}</span><span className="tcp-fast-timeline__line" aria-hidden="true">{index === eventIndex ? <TransportPacketTrack stepId={event.id} direction={event.direction} /> : null}</span>
      </li>)}</ol>
    </div>
    <TransportPlayerControls finalIndex={steps.length - 1} playing={playing} stepIndex={index} speed={speed}
      onNext={() => { setPlaying(false); setIndex((current) => Math.min(current + 1, steps.length - 1)); }}
      onPrevious={() => { setPlaying(false); setIndex((current) => Math.max(0, current - 1)); }}
      onRestart={() => { setIndex(0); setPlaying(!reducedMotion); }}
      onTogglePlay={() => setPlaying((current) => !current)} onSpeedChange={setSpeed} />
    <p role="status" aria-live="polite">Step {index + 1} of {steps.length}: {step.title}</p>
    <p>{step.explanation}</p>
    <div className="tcp-fast-evidence">
      <div className="tcp-fast-receiver" role="group" aria-label="Receiver byte ranges">
        <strong>Receiver buffer</strong>
        <div role="list">{[1101, 1201, 1301, 1401].map((start) => {
          const receiverState = step.cumulativeAck > start ? "received" : start === 1101 ? "missing" : block && start >= block.left && start < block.right ? "buffered" : "awaiting";
          const description = receiverState === "received" ? "received in order" : receiverState === "buffered" ? "buffered out of order" : receiverState === "awaiting" ? "awaiting arrival" : "missing";
          return <span key={start} role="listitem" aria-label={`Bytes ${start}–${start + 99}: ${description}`} data-byte-start={start} data-receiver-state={receiverState}>{start}–{start + 99}</span>;
        })}</div>
        <small>Missing · buffered out of order · awaiting arrival · received in order</small>
      </div>
      <dl><div><dt>Cumulative ACK</dt><dd>{step.cumulativeAck} — first missing byte</dd></div><div><dt>Duplicate ACKs</dt><dd>{step.duplicateAcks} of 3</dd></div></dl>
      {step.duplicateAcks > 0 && step.cumulativeAck === 1101 ? <p>ACK 1101 remains the first missing byte while later data is buffered.</p> : null}
      {block ? <><p>{step.id === "fast-retransmit" ? "The sender repairs the missing range; the latest SACK report showed these later bytes already at the receiver." : step.direction === "forward" ? "Receiver-held range; the next duplicate ACK may report these SACK edges." : "The duplicate ACK reports this SACK block without moving the cumulative ACK."}</p><dl><div><dt>SACK block left edge</dt><dd>{block.left} — first received byte beyond the gap</dd></div><div><dt>SACK block right edge</dt><dd>{block.right} — exclusive; this byte is not in the block</dd></div></dl></> : <p>{step.terminal ? "Gap repaired; SACK is no longer needed for this block." : "No SACK block yet. The sender must advertise SACK-Permitted in its SYN before the receiver may report SACK blocks to it."}</p>}
    </div>
    {state === "error" ? <button type="button" onClick={retry}>Retry saving progress</button> : null}
  </section>;
}
