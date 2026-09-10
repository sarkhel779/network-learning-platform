"use client";

import { useEffect, useState } from "react";

import { TransportPlayerControls } from "@/features/transport/transport-player-controls";

import { dhcpLeaseTimelines } from "./dhcp-pro.data";

export function LeaseTimingPlayer() {
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timeline = dhcpLeaseTimelines[timelineIndex];
  const event = timeline.events[stepIndex];
  const position = Math.min(100, (event.seconds / timeline.leaseSeconds) * 100);
  const finalIndex = timeline.events.length - 1;
  const choose = (index: number) => { setTimelineIndex(index); setStepIndex(0); setPlaying(false); };
  useEffect(() => {
    if (!playing || stepIndex >= finalIndex) return;
    const timer = window.setTimeout(() => setStepIndex((value) => value + 1), 1900 / speed);
    return () => window.clearTimeout(timer);
  }, [finalIndex, playing, speed, stepIndex]);
  useEffect(() => { if (stepIndex >= finalIndex) setPlaying(false); }, [finalIndex, stepIndex]);

  return <section className="dhcp-player lease-timing-player">
    <h3>Lease lifecycle timing lab</h3>
    <fieldset><legend>Timing scenario</legend>{dhcpLeaseTimelines.map((item, index) => <label key={item.id}><input checked={timelineIndex === index} name="lease-timeline" onChange={() => choose(index)} type="radio" />{item.title}</label>)}</fieldset>
    <div aria-label="Lease timeline" className="lease-timeline">
      <div className="lease-timeline__track"><span data-testid="lease-timeline-marker" style={{ left: `${position}%` }} /></div>
      <ol><li>0 s: allocation</li><li>T1: {timeline.t1Seconds} s</li><li>T2: {timeline.t2Seconds} s</li><li>Expiry: {timeline.leaseSeconds} s</li></ol>
    </div>
    <div aria-live="polite" className="transport-outcome" role="status"><strong>{event.seconds} seconds · {event.state}</strong><p>{event.explanation}</p><p>Destination mode: {event.deliveryMode} · Lease {event.leaseValid ? "valid" : "invalid"}</p></div>
    <TransportPlayerControls finalIndex={finalIndex} onNext={() => { setPlaying(false); setStepIndex((value) => value + 1); }} onPrevious={() => { setPlaying(false); setStepIndex((value) => value - 1); }} onRestart={() => { setStepIndex(0); setPlaying(false); }} onSpeedChange={setSpeed} onTogglePlay={() => setPlaying((value) => !value)} playing={playing} speed={speed} stepIndex={stepIndex} />
  </section>;
}
